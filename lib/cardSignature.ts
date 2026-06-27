"use client";

import { deriveAccent } from "./accent";
import { SIG } from "./signatureTokens";
import { buildPortraitGif } from "./portraitGif";
import { renderIconDataUrl } from "./iconCanvas";
import { SOCIAL_ORDER, SOCIAL_LABELS, type SignatureData } from "./types";

/**
 * Clickable, animated email signature in the CARD layout (icon nav | divider |
 * text | portrait), built as an HTML table so every region is a real <a>:
 * each social icon, the email and website links. The portrait is an animated
 * GIF; the social icons + row icons are embedded PNG data-URIs.
 *
 * Fully functional in Apple Mail / iOS (data-URIs render + links click). Gmail
 * strips data-URIs, so for Gmail the images need hosting (links still work).
 */

const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function withProtocol(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u) || /^data:/i.test(u)) return u;
  return "https://" + u;
}
const stripProto = (s: string) => s.replace(/^https?:\/\//, "");
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
}

export async function buildClickableCardSignature(data: SignatureData): Promise<string> {
  const { accentFill, accentText, onAccent } = deriveAccent(data.accentColor);

  // Animated portrait GIF (data-URI). Kept compact (small dims + palette) so
  // the embedded signature stays as light as a data-URI signature can be.
  const gif = await buildPortraitGif({ photoUrl: data.photoUrl, name: data.name, accent: accentFill, onAccent, size: 156, reveal: 16, hold: 5, colors: 64 });
  const portrait = await blobToDataUrl(gif);

  // Icon data-URIs.
  const mailIcon = renderIconDataUrl("mail", accentText, 14);
  const globeIcon = renderIconDataUrl("website", accentText, 14);

  // ---- social icon nav (clickable image links) ----
  const navKeys = SOCIAL_ORDER.filter((k) => data.socials[k]?.trim());
  const navRows = navKeys
    .map((k) => {
      const icon = renderIconDataUrl(k, SIG.iconRest, 18);
      return `<tr><td align="center" style="padding:5px 0;line-height:0;"><a href="${esc(withProtocol(data.socials[k]))}" target="_blank" rel="noopener" style="text-decoration:none;"><img src="${icon}" width="18" height="18" alt="${esc(SOCIAL_LABELS[k])}" style="display:block;border:0;outline:0;" /></a></td></tr>`;
    })
    .join("");

  // ---- badge ----
  const badge = data.showVerifiedBadge
    ? `<span style="display:inline-block;width:15px;height:15px;line-height:15px;text-align:center;background-color:${accentFill};color:${onAccent};border-radius:50%;font-size:10px;font-family:${FONT};margin-left:6px;vertical-align:middle;">&#10003;</span>`
    : "";

  // ---- text block ----
  const rows: string[] = [];
  if (data.brand.trim())
    rows.push(`<tr><td style="padding-bottom:4px;font-family:${FONT};font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;color:${accentText};font-weight:bold;">&lt;/&gt;&nbsp;${esc(data.brand)}</td></tr>`);
  rows.push(`<tr><td style="font-family:${FONT};font-size:16px;line-height:22px;font-weight:bold;color:${SIG.name};">${esc(data.name)}${badge}</td></tr>`);
  if (data.title.trim())
    rows.push(`<tr><td style="padding-top:2px;font-family:${FONT};font-size:13px;line-height:18px;color:${SIG.title};">${esc(data.title)}${data.company.trim() ? ` <span style="color:${SIG.divider};">|</span> <span style="color:${accentText};font-weight:600;">${esc(data.company)}</span>` : ""}</td></tr>`);
  if (data.tagline.trim())
    rows.push(`<tr><td style="padding-top:4px;font-family:${FONT};font-size:12px;line-height:18px;color:${SIG.tagline};">${esc(data.tagline)}</td></tr>`);
  rows.push(`<tr><td style="font-size:8px;line-height:8px;">&nbsp;</td></tr>`);

  const rowLink = (icon: string, href: string, text: string) =>
    `<tr><td style="padding:1px 0;font-family:${FONT};font-size:12px;line-height:18px;"><img src="${icon}" width="14" height="14" alt="" style="vertical-align:middle;border:0;margin-right:7px;" /><a href="${esc(withProtocol(href))}" target="_blank" rel="noopener" style="color:${accentText};text-decoration:none;font-weight:600;vertical-align:middle;">${esc(text)}</a></td></tr>`;

  if (data.email.trim()) rows.push(rowLink(mailIcon, "mailto:" + data.email.trim(), data.email.trim()));
  if (data.website.trim()) rows.push(rowLink(globeIcon, data.website, stripProto(data.website)));
  if (data.phone.trim())
    rows.push(`<tr><td style="padding:1px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${SIG.meta};">${esc(data.phone)}</td></tr>`);
  if (data.location.trim())
    rows.push(`<tr><td style="padding:1px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${SIG.meta};">${esc(data.location)}</td></tr>`);

  const textBlock = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows.join("")}</table>`;

  const navCell = navRows
    ? `<td valign="middle" style="padding-right:14px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${navRows}</table></td>`
    : "";

  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">`,
    `<tr>`,
    navCell,
    `<td valign="middle" width="2" style="width:2px;min-width:2px;background-color:${accentFill};font-size:1px;line-height:1px;">&nbsp;</td>`,
    `<td valign="middle" style="padding-left:16px;padding-right:20px;">${textBlock}</td>`,
    data.showAvatar
      ? `<td valign="middle"><img src="${esc(portrait)}" width="104" height="104" alt="${esc(data.name)}" style="display:block;border-radius:12px;border:0;outline:0;" /></td>`
      : "",
    `</tr>`,
    `</table>`,
  ].join("");
}
