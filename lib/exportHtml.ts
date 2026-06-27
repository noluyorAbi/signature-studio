import { renderTemplate, esc } from "./templates";
import { SIG_FONT } from "./signatureTokens";
import type { SignatureData } from "./types";

/**
 * Public entry points. The actual signature markup is produced by the selected
 * template (lib/templates.ts); every template is table-based, inline-styled,
 * web-safe, and Outlook-safe.
 */

/** The inner signature snippet (paste into Gmail/Outlook/Apple Mail). */
export function buildSignatureHtml(data: SignatureData): string {
  return renderTemplate(data);
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
<body style="margin:0;padding:32px;background-color:#f3f4f6;font-family:${SIG_FONT};">
<!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
${snippet}
<!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;
}
