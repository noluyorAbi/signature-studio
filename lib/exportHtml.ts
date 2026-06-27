import { SOCIAL_ORDER, SOCIAL_LABELS, type SignatureData } from "./types";
import { deriveAccent } from "./accent";
import { SIG, SIG_FONT } from "./signatureTokens";

/* ------------------------------------------------------------------ */
/*  Email-safe HTML generator.                                         */
/*  Pure function: SignatureData -> table-based, inline-styled HTML.    */
/*  No <script>, no flexbox/grid, web-safe fonts, Outlook (MSO) safe.   */
/*  Renders dark text on a white email background (real-world inbox).   */
/*  Accent is split into contrast-safe roles via deriveAccent().        */
/* ------------------------------------------------------------------ */

// Single source of truth for the light signature palette + web-safe font,
// shared with the live preview so the two render paths can never drift.
const FONT = SIG_FONT;
const C = {
  name: SIG.name,
  title: SIG.title,
  tagline: SIG.tagline,
  meta: SIG.meta,
  sep: SIG.divider,
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function withProtocol(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u) || /^data:/i.test(u)) return u;
  return "https://" + u;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function link(href: string, text: string, color: string, extra = ""): string {
  return `<a href="${esc(withProtocol(href))}" style="color:${color};text-decoration:none;${extra}" target="_blank" rel="noopener">${esc(text)}</a>`;
}

/** The avatar: a hosted image when provided, otherwise a monogram cell.
 *  80px, 12px radius, 1px hairline ring so a light headshot does not bleed into
 *  the white email paper (image-free craft touch). */
function avatarCell(data: SignatureData, fill: string, onFill: string): string {
  const size = 80;
  const src = data.animatedPhotoUrl.trim() || data.photoUrl.trim();
  if (src) {
    return `<img src="${esc(withProtocol(src))}" width="${size}" height="${size}" alt="${esc(data.name)}" style="display:block;width:${size}px;height:${size}px;border-radius:12px;object-fit:cover;border:1px solid #e6e8ee;outline:0;" />`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" width="${size}" height="${size}" style="width:${size}px;height:${size}px;background-color:${fill};border-radius:12px;color:${onFill};font-family:${FONT};font-size:30px;font-weight:bold;letter-spacing:1px;">${esc(initials(data.name))}</td></tr></table>`;
}

function metaRow(inner: string): string {
  return `<tr><td style="padding:1px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${C.meta};">${inner}</td></tr>`;
}

/** The social links as a bulletproof text row (no remote icon hosting). */
function socialRow(data: SignatureData, linkColor: string): string {
  const items = SOCIAL_ORDER.filter((k) => data.socials[k]?.trim()).map((k) =>
    link(data.socials[k], SOCIAL_LABELS[k], linkColor, "font-weight:600;"),
  );
  if (items.length === 0) return "";
  const sep = `<span style="color:${C.sep};"> &middot; </span>`;
  return `<tr><td style="padding-top:9px;font-family:${FONT};font-size:12px;line-height:16px;">${items.join(sep)}</td></tr>`;
}

/** The inner signature snippet (paste this into Gmail/Outlook signature fields). */
export function buildSignatureHtml(data: SignatureData): string {
  const { accentFill, accentText, onAccent } = deriveAccent(data.accentColor);

  const badge = data.showVerifiedBadge
    ? `<span style="display:inline-block;width:15px;height:15px;line-height:15px;text-align:center;background-color:${accentFill};color:${onAccent};border-radius:50%;font-size:10px;font-family:${FONT};margin-left:6px;vertical-align:middle;">&#10003;</span>`
    : "";

  // IDENTITY cluster — tracked-out eyebrow vs tight name (letter-spacing polarity).
  const brandLine = data.brand.trim()
    ? `<tr><td style="padding-bottom:6px;font-family:${FONT};font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;color:${accentText};font-weight:bold;">&lt;/&gt;&nbsp;${esc(data.brand)}</td></tr>`
    : "";

  const rows: string[] = [];
  rows.push(brandLine);
  rows.push(
    `<tr><td style="padding-bottom:2px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:bold;letter-spacing:-0.2px;color:${C.name};">${esc(data.name)}${badge}</td></tr>`,
  );
  if (data.title.trim())
    rows.push(
      `<tr><td style="padding-top:2px;font-family:${FONT};font-size:13px;line-height:18px;color:${C.title};">${esc(data.title)}${data.company.trim() ? ` <span style="color:${C.sep};">|</span> <span style="color:${accentText};font-weight:600;">${esc(data.company)}</span>` : ""}</td></tr>`,
    );
  if (data.tagline.trim())
    rows.push(
      `<tr><td style="padding-top:4px;font-family:${FONT};font-size:12px;line-height:17px;color:${C.tagline};">${esc(data.tagline)}</td></tr>`,
    );

  // single deliberate breath between the identity and contact clusters
  rows.push(`<tr><td style="font-size:0;line-height:0;height:12px;">&nbsp;</td></tr>`);

  // CONTACT cluster — email leads (bold), socials are the quieter row beneath.
  if (data.email.trim())
    rows.push(
      `<tr><td style="font-family:${FONT};font-size:12px;line-height:16px;">${link("mailto:" + data.email.trim(), data.email.trim(), accentText, "font-weight:600;")}</td></tr>`,
    );
  if (data.phone.trim()) rows.push(metaRow(`<span style="color:${C.meta};">${esc(data.phone)}</span>`));
  if (data.location.trim()) rows.push(metaRow(`<span style="color:${C.meta};">${esc(data.location)}</span>`));
  rows.push(socialRow(data, accentText));

  const textBlock = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows.join("")}</table>`;

  // One row, all cells valign=middle: the tallest (text) sets the row height, so
  // the 3px accent spine and the 80px photo optically centre against it.
  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">`,
    `<tr>`,
    `<td valign="middle" width="3" style="width:3px;min-width:3px;background-color:${accentFill};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>`,
    `<td valign="middle" style="padding:2px 0 2px 18px;${data.showAvatar ? "padding-right:24px;" : ""}">${textBlock}</td>`,
    data.showAvatar ? `<td valign="middle">${avatarCell(data, accentFill, onAccent)}</td>` : "",
    `</tr>`,
    `</table>`,
  ].join("");
}

/** A full downloadable .html document wrapping the snippet, for preview/saving. */
export function buildSignatureDocument(data: SignatureData): string {
  const snippet = buildSignatureHtml(data);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(data.name)} — Email Signature</title>
</head>
<body style="margin:0;padding:32px;background-color:#f3f4f6;font-family:${FONT};">
<!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
${snippet}
<!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;
}
