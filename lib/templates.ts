import { deriveAccent } from "./accent";
import { SIG, SIG_FONT } from "./signatureTokens";
import { SOCIAL_ORDER, SOCIAL_LABELS, FONT_STACKS, DENSITY_SCALE, type SignatureData, type Roundness } from "./types";

/* ------------------------------------------------------------------ */
/*  Signature template system.                                         */
/*  Each template is render(data, accent) -> email-safe HTML string,   */
/*  used for BOTH the live preview and the export. Shared toolkit below */
/*  keeps every template table-based, inline-styled, and Outlook-safe.  */
/* ------------------------------------------------------------------ */

export type AccentRoles = { accentFill: string; accentText: string; onAccent: string };
export type Template = {
  id: string;
  name: string;
  oneLiner: string;
  render: (d: SignatureData, v: AccentRoles) => string;
};

// Per-render style context (set synchronously in renderTemplate before drawing).
let FONT = SIG_FONT;
let RND: Roundness = "soft";
let SCALE = 1;
const radiusFor = (size: number, fallback: number) =>
  RND === "round" ? Math.round(size / 2) : RND === "square" ? 2 : fallback;
const C = { name: SIG.name, title: SIG.title, tagline: SIG.tagline, meta: SIG.meta, sep: SIG.divider };

/* ---- low-level helpers ---- */
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function withProtocol(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u) || /^data:/i.test(u)) return u;
  return "https://" + u;
}
const stripProto = (s: string) => s.replace(/^https?:\/\//, "").replace(/\/$/, "");
function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function a(href: string, text: string, color: string, extra = ""): string {
  return `<a href="${esc(withProtocol(href))}" style="color:${color};text-decoration:none;${extra}" target="_blank" rel="noopener">${esc(text)}</a>`;
}

/* ---- fragment helpers (return inline HTML, templates arrange them) ---- */
export function badge(d: SignatureData, v: AccentRoles, size = 15): string {
  if (!d.showVerifiedBadge) return "";
  return `<span aria-hidden="true" style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;text-align:center;background-color:${v.accentFill};color:${v.onAccent};border-radius:50%;font-size:${Math.round(size * 0.67)}px;font-family:${FONT};margin-left:6px;vertical-align:middle;">&#10003;</span>`;
}
function brandMark(d: SignatureData, color: string, size = 11): string {
  if (!d.brand.trim()) return "";
  return `<span style="font-family:${FONT};font-size:${size}px;line-height:${size + 3}px;letter-spacing:1.5px;text-transform:uppercase;color:${color};font-weight:bold;">&lt;/&gt;&nbsp;${esc(d.brand)}</span>`;
}
function nameSpan(d: SignatureData, v: AccentRoles, size = 16): string {
  return `<span style="font-family:${FONT};font-size:${size}px;line-height:${Math.round(size * 1.2)}px;font-weight:bold;letter-spacing:-0.2px;color:${C.name};">${esc(d.name)}</span>${badge(d, v)}`;
}
function titleSpan(d: SignatureData, v: AccentRoles, size = 13): string {
  if (!d.title.trim()) return "";
  const comp = d.company.trim() ? ` <span style="color:${C.sep};">|</span> <span style="color:${v.accentText};font-weight:600;">${esc(d.company)}</span>` : "";
  return `<span style="font-family:${FONT};font-size:${size}px;line-height:${size + 5}px;color:${C.title};">${esc(d.title)}${comp}</span>`;
}
function taglineSpan(d: SignatureData, size = 12): string {
  if (!d.tagline.trim()) return "";
  return `<span style="font-family:${FONT};font-size:${size}px;line-height:${size + 5}px;color:${C.tagline};">${esc(d.tagline)}</span>`;
}
function emailA(d: SignatureData, v: AccentRoles, size = 12): string {
  if (!d.email.trim()) return "";
  return a("mailto:" + d.email.trim(), d.email.trim(), v.accentText, `font-family:${FONT};font-size:${size}px;font-weight:600;`);
}
function websiteA(d: SignatureData, v: AccentRoles, size = 12): string {
  if (!d.website.trim()) return "";
  return a(d.website, stripProto(d.website), v.accentText, `font-family:${FONT};font-size:${size}px;font-weight:600;`);
}
function socialInline(d: SignatureData, color: string, size = 12): string {
  const items = SOCIAL_ORDER.filter((k) => d.socials[k]?.trim()).map((k) =>
    a(d.socials[k], SOCIAL_LABELS[k], color, `font-family:${FONT};font-size:${size}px;font-weight:600;`),
  );
  if (!items.length) return "";
  return items.join(`<span style="color:${C.sep};"> &middot; </span>`);
}
function avatar(d: SignatureData, v: AccentRoles, size = 80, radius = 12, ring = true): string {
  if (!d.showAvatar) return "";
  const r = radiusFor(size, radius);
  const src = d.animatedPhotoUrl.trim() || d.photoUrl.trim();
  const border = ring ? "border:1px solid #e6e8ee;" : "border:0;";
  if (src) {
    return `<img src="${esc(withProtocol(src))}" width="${size}" height="${size}" alt="${esc(d.name)}" style="display:block;width:${size}px;min-width:${size}px;max-width:${size}px;height:${size}px;border-radius:${r}px;object-fit:cover;${border}outline:0;" />`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" width="${size}" height="${size}" bgcolor="${v.accentFill}" style="width:${size}px;height:${size}px;background-color:${v.accentFill};border-radius:${r}px;color:${v.onAccent};font-family:${FONT};font-size:${Math.round(size * 0.38)}px;font-weight:bold;letter-spacing:1px;">${esc(initials(d.name))}</td></tr></table>`;
}
const T_OPEN = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">`;
const spacer = (h: number) => {
  const hh = Math.max(1, Math.round(h * SCALE));
  return `<tr><td style="font-size:0;line-height:${hh}px;height:${hh}px;mso-line-height-rule:exactly;">&nbsp;</td></tr>`;
};
const tdRow = (inner: string, pad = "") => `<tr><td style="${pad}">${inner}</td></tr>`;

/* ============================== TEMPLATES ============================== */

// 1. Card — accent spine | text | photo, vertically centered (the refined baseline).
function tplCard(d: SignatureData, v: AccentRoles): string {
  const rows: string[] = [];
  if (d.brand.trim()) rows.push(tdRow(brandMark(d, v.accentText), "padding-bottom:6px;"));
  rows.push(tdRow(nameSpan(d, v), "padding-bottom:2px;"));
  if (d.title.trim()) rows.push(tdRow(titleSpan(d, v), "padding-top:2px;"));
  if (d.tagline.trim()) rows.push(tdRow(taglineSpan(d), "padding-top:4px;"));
  rows.push(spacer(12));
  if (d.email.trim()) rows.push(tdRow(emailA(d, v), "line-height:16px;"));
  if (d.phone.trim()) rows.push(tdRow(`<span style="font-family:${FONT};font-size:12px;line-height:18px;color:${C.meta};">${esc(d.phone)}</span>`));
  if (d.location.trim()) rows.push(tdRow(`<span style="font-family:${FONT};font-size:12px;line-height:18px;color:${C.meta};">${esc(d.location)}</span>`));
  const soc = socialInline(d, v.accentText);
  if (soc) rows.push(tdRow(soc, "padding-top:9px;line-height:16px;"));
  const text = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows.join("")}</table>`;
  return [
    T_OPEN, "<tr>",
    `<td valign="middle" width="3" bgcolor="${v.accentFill}" style="width:3px;min-width:3px;background-color:${v.accentFill};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>`,
    `<td valign="middle" style="padding:2px 0 2px 18px;${d.showAvatar ? "padding-right:24px;" : ""}">${text}</td>`,
    d.showAvatar ? `<td valign="middle">${avatar(d, v)}</td>` : "",
    "</tr>", "</table>",
  ].join("");
}

const bar = (color: string, w: number, h = 2) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${color}" style="width:${w}px;height:${h}px;background-color:${color};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
const textTable = (rows: string[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows.join("")}</table>`;
const metaText = (s: string, c = C.meta) => `<span style="font-family:${FONT};font-size:12px;line-height:18px;color:${c};">${esc(s)}</span>`;

function identityRows(d: SignatureData, v: AccentRoles, nameSize = 16): string[] {
  const r: string[] = [];
  if (d.brand.trim()) r.push(tdRow(brandMark(d, v.accentText), "padding-bottom:6px;"));
  r.push(tdRow(nameSpan(d, v, nameSize), "padding-bottom:2px;"));
  if (d.title.trim()) r.push(tdRow(titleSpan(d, v), "padding-top:2px;"));
  if (d.tagline.trim()) r.push(tdRow(taglineSpan(d), "padding-top:4px;"));
  return r;
}
function contactRows(d: SignatureData, v: AccentRoles): string[] {
  const r: string[] = [];
  if (d.email.trim()) r.push(tdRow(emailA(d, v), "line-height:16px;"));
  if (d.website.trim()) r.push(tdRow(websiteA(d, v), "line-height:16px;padding-top:2px;"));
  if (d.phone.trim()) r.push(tdRow(metaText(d.phone)));
  if (d.location.trim()) r.push(tdRow(metaText(d.location)));
  const soc = socialInline(d, v.accentText);
  if (soc) r.push(tdRow(soc, "padding-top:9px;line-height:16px;"));
  return r;
}

// 2. Bordered — a hairline-framed card, no spine, photo right.
function tplBordered(d: SignatureData, v: AccentRoles): string {
  const text = textTable([...identityRows(d, v), spacer(10), ...contactRows(d, v)]);
  const inner = [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>`,
    `<td valign="middle" style="${d.showAvatar ? "padding-right:20px;" : ""}">${text}</td>`,
    d.showAvatar ? `<td valign="middle">${avatar(d, v, 74, 12)}</td>` : "",
    `</tr></table>`,
  ].join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;background-color:#ffffff;border:1px solid #e6e8ee;border-radius:14px;"><tr><td style="padding:20px 22px;">${inner}</td></tr></table>`;
}

// 3. Left Portrait — photo left, accent underline beneath the name.
function tplLeftPhoto(d: SignatureData, v: AccentRoles): string {
  const rows: string[] = [];
  if (d.brand.trim()) rows.push(tdRow(brandMark(d, v.accentText), "padding-bottom:6px;"));
  rows.push(tdRow(nameSpan(d, v)));
  rows.push(tdRow(bar(v.accentFill, 30, 2), "padding:7px 0 3px;"));
  if (d.title.trim()) rows.push(tdRow(titleSpan(d, v), "padding-top:2px;"));
  if (d.tagline.trim()) rows.push(tdRow(taglineSpan(d), "padding-top:4px;"));
  rows.push(spacer(10));
  contactRows(d, v).forEach((x) => rows.push(x));
  const text = textTable(rows);
  return [
    T_OPEN, "<tr>",
    d.showAvatar ? `<td valign="middle" style="padding-right:22px;">${avatar(d, v, 84, 14)}</td>` : "",
    `<td valign="middle">${text}</td>`,
    "</tr>", "</table>",
  ].join("");
}

// 4. Stacked — centered, photo on top; mobile-friendly.
function tplStacked(d: SignatureData, v: AccentRoles): string {
  const center = "text-align:center;";
  const rows: string[] = [];
  if (d.showAvatar) rows.push(tdRow(`<div style="display:inline-block;">${avatar(d, v, 76, 14)}</div>`, `${center}padding-bottom:12px;`));
  if (d.brand.trim()) rows.push(tdRow(brandMark(d, v.accentText), `${center}padding-bottom:5px;`));
  rows.push(tdRow(nameSpan(d, v), center));
  if (d.title.trim()) rows.push(tdRow(titleSpan(d, v), `${center}padding-top:3px;`));
  if (d.tagline.trim()) rows.push(tdRow(taglineSpan(d), `${center}padding-top:4px;`));
  rows.push(spacer(11));
  if (d.email.trim()) rows.push(tdRow(emailA(d, v), `${center}line-height:16px;`));
  if (d.website.trim()) rows.push(tdRow(websiteA(d, v), `${center}line-height:16px;padding-top:2px;`));
  const soc = socialInline(d, v.accentText);
  if (soc) rows.push(tdRow(soc, `${center}padding-top:9px;line-height:16px;`));
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">${rows.join("")}</table>`;
}

// 5. Banner — a slim accent bar across the top.
function tplBanner(d: SignatureData, v: AccentRoles): string {
  const text = textTable([...identityRows(d, v), spacer(10), ...contactRows(d, v)]);
  const body = [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>`,
    `<td valign="middle" style="${d.showAvatar ? "padding-right:20px;" : ""}">${text}</td>`,
    d.showAvatar ? `<td valign="middle">${avatar(d, v, 74, 12)}</td>` : "",
    `</tr></table>`,
  ].join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;"><tr><td bgcolor="${v.accentFill}" style="height:5px;background-color:${v.accentFill};font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr><tr><td style="padding:16px 4px 4px;">${body}</td></tr></table>`;
}

// 6. Monochrome — no colour accent, typographic restraint.
function tplMono(d: SignatureData, v: AccentRoles): string {
  void v;
  const m: AccentRoles = { accentFill: "#3a3f4a", accentText: "#1f242c", onAccent: "#ffffff" };
  const text = textTable([...identityRows(d, m), spacer(11), ...contactRows(d, m)]);
  return [
    T_OPEN, "<tr>",
    `<td valign="middle" width="2" style="width:2px;background-color:#d7dbe2;font-size:0;line-height:0;">&nbsp;</td>`,
    `<td valign="middle" style="padding:2px 0 2px 18px;${d.showAvatar ? "padding-right:22px;" : ""}">${text}</td>`,
    d.showAvatar ? `<td valign="middle">${avatar(d, m, 78, 12)}</td>` : "",
    "</tr>", "</table>",
  ].join("");
}

// 7. Compact — smallest footprint, dense lines.
function tplCompact(d: SignatureData, v: AccentRoles): string {
  const line1 = `<span style="font-family:${FONT};font-size:14px;font-weight:bold;letter-spacing:-0.2px;color:${C.name};">${esc(d.name)}</span>${badge(d, v, 13)}${d.title.trim() ? `<span style="font-family:${FONT};font-size:12px;color:${C.title};"> &nbsp;&middot;&nbsp; ${esc(d.title)}</span>` : ""}`;
  const contact: string[] = [];
  if (d.email.trim()) contact.push(emailA(d, v));
  if (d.website.trim()) contact.push(websiteA(d, v));
  const line2 = contact.join(`<span style="color:${C.sep};"> &middot; </span>`);
  const soc = socialInline(d, v.accentText);
  const rows = [tdRow(line1, "line-height:18px;")];
  if (line2) rows.push(tdRow(line2, "padding-top:4px;line-height:16px;"));
  if (soc) rows.push(tdRow(soc, "padding-top:4px;line-height:16px;"));
  const text = textTable(rows);
  return [
    T_OPEN, "<tr>",
    d.showAvatar ? `<td valign="middle" style="padding-right:14px;">${avatar(d, v, 46, 10)}</td>` : "",
    `<td valign="middle" width="3" style="width:3px;background-color:${v.accentFill};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>`,
    `<td valign="middle" style="padding-left:14px;">${text}</td>`,
    "</tr>", "</table>",
  ].join("");
}

// 8. Editorial — oversized name, strong hierarchy.
function tplEditorial(d: SignatureData, v: AccentRoles): string {
  const rows: string[] = [];
  if (d.brand.trim()) rows.push(tdRow(brandMark(d, v.accentText, 11), "padding-bottom:6px;"));
  rows.push(tdRow(`<span style="font-family:${FONT};font-size:24px;line-height:26px;font-weight:bold;letter-spacing:-0.6px;color:${C.name};">${esc(d.name)}</span>${badge(d, v, 17)}`));
  if (d.title.trim()) rows.push(tdRow(titleSpan(d, v, 14), "padding-top:6px;"));
  if (d.tagline.trim()) rows.push(tdRow(taglineSpan(d), "padding-top:5px;"));
  rows.push(spacer(13));
  contactRows(d, v).forEach((x) => rows.push(x));
  const text = textTable(rows);
  return [
    T_OPEN, "<tr>",
    `<td valign="middle" style="${d.showAvatar ? "padding-right:26px;" : ""}">${text}</td>`,
    d.showAvatar ? `<td valign="middle">${avatar(d, v, 96, 16)}</td>` : "",
    "</tr>", "</table>",
  ].join("");
}

// Underline — name with an accent underline, horizontal.
function tplUnderline(d: SignatureData, v: AccentRoles): string {
  const rows: string[] = [];
  if (d.brand.trim()) rows.push(tdRow(brandMark(d, v.accentText), "padding-bottom:6px;"));
  rows.push(`<tr><td style="border-bottom:2px solid ${v.accentFill};padding-bottom:6px;">${nameSpan(d, v)}</td></tr>`);
  if (d.title.trim()) rows.push(tdRow(titleSpan(d, v), "padding-top:7px;"));
  if (d.tagline.trim()) rows.push(tdRow(taglineSpan(d), "padding-top:4px;"));
  rows.push(spacer(10));
  contactRows(d, v).forEach((x) => rows.push(x));
  const text = textTable(rows);
  return [
    T_OPEN, "<tr>",
    `<td valign="middle" style="${d.showAvatar ? "padding-right:24px;" : ""}">${text}</td>`,
    d.showAvatar ? `<td valign="middle">${avatar(d, v, 82, 12)}</td>` : "",
    "</tr>", "</table>",
  ].join("");
}

export const TEMPLATES: Template[] = [
  { id: "card", name: "Card", oneLiner: "Accent spine, photo right", render: tplCard },
  { id: "bordered", name: "Bordered", oneLiner: "Hairline-framed card", render: tplBordered },
  { id: "left-photo", name: "Left Portrait", oneLiner: "Photo left, accent underline", render: tplLeftPhoto },
  { id: "stacked", name: "Stacked", oneLiner: "Centered, photo on top", render: tplStacked },
  { id: "banner", name: "Banner", oneLiner: "Slim accent bar on top", render: tplBanner },
  { id: "mono", name: "Monochrome", oneLiner: "No colour, pure type", render: tplMono },
  { id: "compact", name: "Compact", oneLiner: "Smallest, dense lines", render: tplCompact },
  { id: "editorial", name: "Editorial", oneLiner: "Oversized name", render: tplEditorial },
  { id: "underline", name: "Underline", oneLiner: "Underlined name, horizontal", render: tplUnderline },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/* ---- optional branding blocks (logo above, CTA + disclaimer below) ---- */
function logoBlock(d: SignatureData): string {
  if (!d.logoUrl.trim()) return "";
  return `<img src="${esc(withProtocol(d.logoUrl))}" alt="${esc(d.company || d.brand || d.name)}" height="34" style="display:block;height:34px;width:auto;max-width:220px;border:0;outline:0;" />`;
}
function ctaBlock(d: SignatureData, v: AccentRoles): string {
  if (!d.ctaLabel.trim() || !d.ctaUrl.trim()) return "";
  const r = radiusFor(40, 8);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td bgcolor="${v.accentFill}" style="background-color:${v.accentFill};border-radius:${r}px;"><a href="${esc(withProtocol(d.ctaUrl))}" target="_blank" rel="noopener" style="display:inline-block;padding:9px 18px;font-family:${FONT};font-size:12px;font-weight:bold;color:${v.onAccent};text-decoration:none;">${esc(d.ctaLabel)}</a></td></tr></table>`;
}
function disclaimerBlock(d: SignatureData): string {
  if (!d.disclaimer.trim()) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="border-top:1px solid #eef0f3;padding-top:8px;font-family:${FONT};font-size:10px;line-height:14px;color:#9aa0ad;mso-line-height-rule:exactly;">${esc(d.disclaimer)}</td></tr></table>`;
}

export function renderTemplate(d: SignatureData): string {
  const v = deriveAccent(d.accentColor);
  FONT = FONT_STACKS[d.fontStack] ?? SIG_FONT;
  RND = d.roundness ?? "soft";
  SCALE = DENSITY_SCALE[d.density] ?? 1;

  const sig = getTemplate(d.templateId).render(d, v);
  const logo = logoBlock(d);
  const cta = ctaBlock(d, v);
  const disc = disclaimerBlock(d);
  if (!logo && !cta && !disc) return sig;

  const rows: string[] = [];
  if (logo) rows.push(`<tr><td style="padding-bottom:14px;">${logo}</td></tr>`);
  rows.push(`<tr><td>${sig}</td></tr>`);
  if (cta) rows.push(`<tr><td style="padding-top:14px;">${cta}</td></tr>`);
  if (disc) rows.push(`<tr><td style="padding-top:14px;">${disc}</td></tr>`);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">${rows.join("")}</table>`;
}
