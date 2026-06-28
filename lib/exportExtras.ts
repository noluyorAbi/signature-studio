import { SOCIAL_ORDER, SOCIAL_LABELS, type SignatureData } from "./types";

/** vCard 4.0, plain-text, and other portable signature formats. */

function vEsc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
const withProtocol = (u: string) => {
  const s = u.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : "https://" + s;
};
const stripProto = (s: string) => s.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function buildVCard(d: SignatureData): string {
  const lines = ["BEGIN:VCARD", "VERSION:4.0"];
  if (d.name.trim()) {
    lines.push(`FN:${vEsc(d.name)}`);
    const parts = d.name.trim().split(/\s+/);
    const last = parts.length > 1 ? parts.pop()! : "";
    lines.push(`N:${vEsc(last)};${vEsc(parts.join(" "))};;;`);
  }
  if (d.title.trim()) lines.push(`TITLE:${vEsc(d.title)}`);
  if (d.company.trim()) lines.push(`ORG:${vEsc(d.company)}`);
  if (d.email.trim()) lines.push(`EMAIL;TYPE=work:${vEsc(d.email.trim())}`);
  if (d.phone.trim()) lines.push(`TEL;TYPE=work,voice:${vEsc(d.phone.trim())}`);
  if (d.website.trim()) lines.push(`URL:${vEsc(withProtocol(d.website))}`);
  if (d.location.trim()) lines.push(`ADR;TYPE=work:;;${vEsc(d.location)};;;;`);
  for (const k of SOCIAL_ORDER) {
    const u = d.socials[k]?.trim();
    if (u) lines.push(`X-SOCIALPROFILE;TYPE=${k}:${vEsc(withProtocol(u))}`);
  }
  if (d.photoUrl.trim() && /^https?:/i.test(d.photoUrl.trim())) lines.push(`PHOTO;VALUE=uri:${vEsc(d.photoUrl.trim())}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function buildPlainText(d: SignatureData): string {
  const out: string[] = [];
  if (d.name.trim()) out.push(d.name.trim());
  const role = [d.title.trim(), d.company.trim()].filter(Boolean).join(" | ");
  if (role) out.push(role);
  if (d.tagline.trim()) out.push(d.tagline.trim());
  out.push("");
  if (d.email.trim()) out.push(d.email.trim());
  if (d.phone.trim()) out.push(d.phone.trim());
  if (d.website.trim()) out.push(stripProto(d.website));
  if (d.location.trim()) out.push(d.location.trim());
  const socials = SOCIAL_ORDER.filter((k) => d.socials[k]?.trim()).map((k) => `${SOCIAL_LABELS[k]}: ${stripProto(d.socials[k])}`);
  if (socials.length) {
    out.push("");
    out.push(...socials);
  }
  if (d.disclaimer.trim()) {
    out.push("");
    out.push(d.disclaimer.trim());
  }
  return out.join("\n");
}
