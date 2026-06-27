/**
 * Headless: embed an animated portrait GIF as a data-URI avatar inside the full
 * signature, producing a standalone .html that animates in Apple Mail / iOS
 * (and any browser) with zero hosting. Expects ./adatepe-portrait.gif to exist
 * (generate it once from the app's "Download GIF", or reuse the bundled one).
 *
 *   bun run gen:animated
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { buildSignatureHtml } from "../lib/exportHtml";
import { DEFAULT_SIGNATURE } from "../lib/defaults";

const gifPath = join(process.cwd(), "adatepe-portrait.gif");
if (!existsSync(gifPath)) {
  console.error("Missing adatepe-portrait.gif — generate it from the app first.");
  process.exit(1);
}

const dataUrl = `data:image/gif;base64,${readFileSync(gifPath).toString("base64")}`;
const snippet = buildSignatureHtml({ ...DEFAULT_SIGNATURE, animatedPhotoUrl: dataUrl });
const docHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Alperen Adatepe — Animated Signature</title></head>
<body style="margin:0;padding:32px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
${snippet}
</body></html>`;

const out = join(process.cwd(), "alperen-signature-animated.html");
writeFileSync(out, docHtml);
console.log(`Wrote ${out} (${Math.round(docHtml.length / 1024)} KB)`);
