import { buildSignatureHtml } from "./exportHtml";
import { deriveAccent } from "./accent";
import { SOCIAL_ORDER, SOCIAL_LABELS, type SignatureData } from "./types";

/**
 * Deliverability + quality linter. Produces actionable checks plus the exact
 * byte size of the exported signature (Gmail's signature field caps near 10KB).
 */

export type LintLevel = "error" | "warn" | "ok";
export type LintCheck = { level: LintLevel; message: string };

const GMAIL_LIMIT = 10000;

function bytesOf(s: string): number {
  return new TextEncoder().encode(s).length;
}
function looksLikeUrl(s: string): boolean {
  const u = s.trim();
  return /^https?:\/\//i.test(u) || /^[\w-]+(\.[\w-]+)+/.test(u);
}
function isDataUri(s: string): boolean {
  return /^data:/i.test(s.trim());
}

export function lintSignature(d: SignatureData): { checks: LintCheck[]; bytes: number; gmailLimit: number } {
  const html = buildSignatureHtml(d);
  const bytes = bytesOf(html);
  const checks: LintCheck[] = [];

  if (!d.name.trim()) checks.push({ level: "error", message: "Name is empty." });

  // Size vs Gmail signature field.
  if (bytes > GMAIL_LIMIT) {
    const embedded = isDataUri(d.animatedPhotoUrl) || isDataUri(d.photoUrl) || isDataUri(d.logoUrl);
    checks.push({
      level: "error",
      message: embedded
        ? `Signature is ${(bytes / 1024).toFixed(1)} KB. An embedded (data-URI) image will not fit Gmail's ~10 KB field; host the image and use its URL.`
        : `Signature is ${(bytes / 1024).toFixed(1)} KB, over Gmail's ~10 KB field.`,
    });
  } else if (bytes > GMAIL_LIMIT * 0.8) {
    checks.push({ level: "warn", message: `Signature is ${(bytes / 1024).toFixed(1)} KB, near Gmail's ~10 KB field.` });
  }

  // Accent contrast.
  const accentWarn = deriveAccent(d.accentColor).warning;
  if (accentWarn) checks.push({ level: "warn", message: accentWarn });

  // Email.
  if (!d.email.trim()) checks.push({ level: "warn", message: "No email address set." });
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) checks.push({ level: "warn", message: "Email address looks invalid." });

  // Photo.
  if (d.showAvatar && !d.photoUrl.trim() && !d.animatedPhotoUrl.trim())
    checks.push({ level: "warn", message: "No photo: a monogram is shown. Add a square hosted image for a portrait." });
  if (isDataUri(d.photoUrl) || isDataUri(d.animatedPhotoUrl))
    checks.push({ level: "warn", message: "An embedded (data-URI) image is Apple Mail / iOS only; Gmail strips it. Host it for Gmail." });

  // URL fields.
  const urlChecks: Array<[string, string]> = [
    ["Website", d.website],
    ["Logo URL", d.logoUrl],
    ["CTA URL", d.ctaUrl],
    ...SOCIAL_ORDER.map((k) => [SOCIAL_LABELS[k], d.socials[k]] as [string, string]),
  ];
  for (const [label, val] of urlChecks) {
    if (val.trim() && !isDataUri(val) && !looksLikeUrl(val) && !/^mailto:/i.test(val))
      checks.push({ level: "warn", message: `${label} does not look like a valid URL.` });
  }

  // CTA needs both parts.
  if (d.ctaLabel.trim() !== "" && d.ctaUrl.trim() === "") checks.push({ level: "warn", message: "CTA has a label but no URL." });

  if (checks.length === 0) checks.push({ level: "ok", message: "Looks deliverable. Clean, tiny, email-safe." });

  return { checks, bytes, gmailLimit: GMAIL_LIMIT };
}
