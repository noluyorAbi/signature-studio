"use client";

import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { deriveAccent } from "./accent";
import { SIG } from "./signatureTokens";
import { SOCIAL_ORDER, type SignatureData } from "./types";
import { drawSocial, drawGlobe, drawMail } from "./iconCanvas";

/**
 * Renders the COMPLETE signature as one animated GIF, drawn entirely on a
 * <canvas> to match the live card: left social-icon nav | accent rule | text
 * block (with mail/globe row icons) | portrait. Static parts are drawn once to
 * a base canvas; each frame = base + the portrait strip-reveal. Plays once,
 * rests on the finished signature.
 */

const PR = 2;
const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const STRIPS = 5;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}
const stripProto = (s: string) => s.replace(/^https?:\/\//, "");

function proxied(url: string): string {
  if (!url) return url;
  if (/^data:/.test(url)) return url;
  const abs = new URL(url, location.origin).href;
  return abs.startsWith(location.origin) ? abs : `/api/proxy-image?url=${encodeURIComponent(abs)}`;
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("img load failed"));
    img.src = src;
  });
}
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
}

export type FullGif = { blob: Blob; dataUrl: string; width: number; height: number };

export async function buildFullSignatureGif(
  data: SignatureData,
  { width = 540, frames = 18, hold = 6, delay = 60 } = {},
): Promise<FullGif> {
  const { accentFill, accentText, onAccent } = deriveAccent(data.accentColor);

  const P = 16;
  const navW = 30;
  const iconSize = 17;
  const photo = 104;
  const rowIconW = 19;
  const navX = P;
  const dividerX = navX + navW;
  const textX = dividerX + 2 + 16;
  const photoX = width - P - photo;
  const textRight = photoX - 16;

  let img: HTMLImageElement | null = null;
  if (data.photoUrl.trim()) {
    try {
      img = await loadImage(proxied(data.photoUrl.trim()));
    } catch {
      img = null;
    }
  }

  const scratch = document.createElement("canvas").getContext("2d")!;
  const lines = layoutText(scratch, data, accentText, textRight - textX, rowIconW);
  const textH = lines.height;
  const contentH = Math.max(textH, photo);
  const height = Math.round(P * 2 + contentH);
  const textY = Math.round(P + (contentH - textH) / 2);
  const photoY = Math.round(P + (contentH - photo) / 2);

  const navKeys = SOCIAL_ORDER.filter((k) => data.socials[k]?.trim());

  const W = Math.round(width * PR);
  const H = Math.round(height * PR);
  const base = document.createElement("canvas");
  base.width = W;
  base.height = H;
  const bctx = base.getContext("2d")!;
  bctx.scale(PR, PR);
  bctx.fillStyle = "#ffffff";
  bctx.fillRect(0, 0, width, height);

  // social-icon nav (vertical, distributed over the text block height)
  const navTop = textY;
  const navSpan = textH;
  navKeys.forEach((k, i) => {
    const cy = navKeys.length > 1 ? navTop + (i * (navSpan - iconSize)) / (navKeys.length - 1) + iconSize / 2 : navTop + navSpan / 2;
    drawSocial(bctx, k, navX + navW / 2, cy, iconSize, SIG.iconRest);
  });

  // accent divider
  bctx.fillStyle = accentFill;
  bctx.fillRect(dividerX, textY, 2, textH);

  // text + row icons
  drawText(bctx, lines, textX, textY, accentFill, accentText, onAccent, rowIconW);

  // frames
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const px = photoX * PR;
  const py = photoY * PR;
  const ps = photo * PR;

  const gif = GIFEncoder();
  const total = frames + hold;
  for (let i = 0; i < total; i++) {
    const p = i < frames ? i / (frames - 1) : 1;
    ctx.drawImage(base, 0, 0);
    drawPortrait(ctx, img, px, py, ps, p, accentFill, onAccent, data.name);
    const { data: pixels } = ctx.getImageData(0, 0, W, H);
    const palette = quantize(pixels, 256);
    const index = applyPalette(pixels, palette);
    gif.writeFrame(index, W, H, { palette, delay, ...(i === 0 ? { repeat: -1 } : {}) });
  }
  gif.finish();

  const blob = new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
  const dataUrl = await blobToDataUrl(blob);
  return { blob, dataUrl, width, height };
}

/* ---------- text layout + drawing ---------- */

type Line = {
  text: string;
  size: number;
  weight: string;
  color: string;
  top: number;
  ls?: number;
  badge?: boolean;
  nameWidth?: number;
  rowIcon?: "mail" | "globe";
};

function layoutText(ctx: CanvasRenderingContext2D, data: SignatureData, accentText: string, maxW: number, rowIconW: number) {
  const lines: Line[] = [];
  let y = 0;
  const push = (text: string, size: number, weight: string, color: string, gap: number, extra: Partial<Line> = {}) => {
    if (!text) return;
    lines.push({ text, size, weight, color, top: y, ...extra });
    y += size + gap;
  };

  if (data.brand.trim()) push(`</> ${data.brand.toUpperCase()}`, 11, "bold", accentText, 7, { ls: 1.5 });

  ctx.font = `bold 17px ${FONT}`;
  const nameWidth = ctx.measureText(data.name || "Your Name").width;
  push(data.name || "Your Name", 17, "bold", SIG.name, 5, { badge: data.showVerifiedBadge, nameWidth });

  if (data.title.trim()) {
    const t = data.company.trim() ? `${data.title}  |  ${data.company}` : data.title;
    push(t, 13, "normal", SIG.title, 5, {});
  }
  if (data.tagline.trim()) push(fit(ctx, data.tagline, 12, maxW), 12, "normal", SIG.tagline, 13, {});

  if (data.email.trim()) push(data.email, 12, "bold", accentText, 5, { rowIcon: "mail" });
  if (data.website.trim()) push(stripProto(data.website), 12, "bold", accentText, 5, { rowIcon: "globe" });
  if (data.phone.trim()) push(data.phone, 12, "normal", SIG.meta, 5, {});
  if (data.location.trim()) push(data.location, 12, "normal", SIG.meta, 5, {});

  void rowIconW;
  return { lines, height: Math.max(y, 17) };
}

function fit(ctx: CanvasRenderingContext2D, text: string, size: number, maxW: number): string {
  ctx.font = `normal ${size}px ${FONT}`;
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 4 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t.trimEnd() + "…";
}

type CtxLS = CanvasRenderingContext2D & { letterSpacing: string };

function drawText(
  ctx: CanvasRenderingContext2D,
  layout: { lines: Line[] },
  x: number,
  y: number,
  accentFill: string,
  accentText: string,
  onAccent: string,
  rowIconW: number,
) {
  ctx.textBaseline = "top";
  for (const ln of layout.lines) {
    const tx = ln.rowIcon ? x + rowIconW : x;
    if (ln.rowIcon) {
      const cy = y + ln.top + ln.size / 2;
      if (ln.rowIcon === "mail") drawMail(ctx, x + 6, cy, 13, accentText);
      else drawGlobe(ctx, x + 6, cy, 13, accentText);
    }
    ctx.font = `${ln.weight} ${ln.size}px ${FONT}`;
    ctx.fillStyle = ln.color;
    try {
      (ctx as CtxLS).letterSpacing = `${ln.ls ?? 0}px`;
    } catch {
      /* noop */
    }
    ctx.fillText(ln.text, tx, y + ln.top);
    try {
      (ctx as CtxLS).letterSpacing = "0px";
    } catch {
      /* noop */
    }
    if (ln.badge && ln.nameWidth != null) {
      const bx = x + ln.nameWidth + 11;
      const by = y + ln.top + ln.size / 2;
      ctx.beginPath();
      ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = accentFill;
      ctx.fill();
      ctx.strokeStyle = onAccent;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(bx - 3.2, by);
      ctx.lineTo(bx - 0.8, by + 2.4);
      ctx.lineTo(bx + 3.4, by - 2.8);
      ctx.stroke();
    }
  }
}

function drawPortrait(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  p: number,
  accent: string,
  onAccent: string,
  name: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 12 * PR);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);
  const sw = size / STRIPS;
  for (let i = 0; i < STRIPS; i++) {
    const local = clamp((p - i * 0.12) / 0.5, 0, 1);
    const e = 1 - Math.pow(1 - local, 3);
    if (e <= 0) continue;
    const xOff = (1 - e) * (size * 0.12);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + i * sw, y, sw + 1, size);
    ctx.clip();
    ctx.globalAlpha = e;
    if (img) {
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, x + xOff, y, size, size);
    } else {
      ctx.fillStyle = accent;
      ctx.fillRect(x + xOff, y, size, size);
    }
    ctx.restore();
  }
  if (!img) {
    ctx.globalAlpha = clamp((p - 0.2) / 0.6, 0, 1);
    ctx.fillStyle = onAccent;
    ctx.font = `bold ${Math.round(size * 0.34)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(name), x + size / 2, y + size / 2);
  }
  ctx.restore();
}
