import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Same-origin image proxy. The GIF generator draws the portrait to a <canvas>;
 * a cross-origin image taints the canvas and blocks getImageData. Routing the
 * fetch through here returns the bytes from our own origin, so the canvas stays
 * clean.
 *
 * SSRF hardening: the URL is attacker-controllable, so before each hop we
 * DNS-resolve the host and reject any private / loopback / link-local / ULA /
 * multicast / metadata address, and we follow redirects manually so each new
 * Location is re-validated. (Residual TOCTOU: Node re-resolves DNS at fetch
 * time; acceptable for this local POC. A production proxy should pin the
 * resolved IP or use an allowlist.)
 */

const MAX_BYTES = 8_000_000;
const MAX_REDIRECTS = 3;

function ipBlocked(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  if (v === 6) {
    const lc = ip.toLowerCase();
    if (lc === "::1" || lc === "::") return true; // loopback / unspecified
    if (lc.startsWith("fe80")) return true; // link-local
    if (lc.startsWith("fc") || lc.startsWith("fd")) return true; // ULA fc00::/7
    if (lc.startsWith("ff")) return true; // multicast
    const mapped = lc.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped
    if (mapped) return ipBlocked(mapped[1]);
    return false;
  }
  return true; // not a valid IP -> block
}

async function hostAllowed(hostname: string): Promise<boolean> {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (isIP(host)) return !ipBlocked(host);
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    return false;
  }
  return addrs.length > 0 && addrs.every((a) => !ipBlocked(a.address));
}

async function safeFetch(rawUrl: string): Promise<Response> {
  let current = rawUrl;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const u = new URL(current);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("scheme");
    if (!(await hostAllowed(u.hostname))) throw new Error("blocked host");
    const res = await fetch(u, { headers: { Accept: "image/*" }, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("redirect without location");
      current = new URL(loc, u).href;
      continue;
    }
    return res;
  }
  throw new Error("too many redirects");
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !/^https?:\/\//i.test(url)) {
    return new Response("Bad url", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await safeFetch(url);
  } catch {
    return new Response("Blocked or unreachable", { status: 502 });
  }
  if (!upstream.ok) return new Response("Upstream error", { status: 502 });

  const type = upstream.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    return new Response("Not an image", { status: 415 });
  }
  const declared = Number(upstream.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) return new Response("Too large", { status: 413 });

  const buf = await upstream.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) {
    return new Response("Too large", { status: 413 });
  }

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
