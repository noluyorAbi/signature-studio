/**
 * Headless generator: writes the default (adatepe.dev) signature to disk as a
 * standalone, email-safe .html document. Run with:  bun run gen
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildSignatureDocument } from "../lib/exportHtml";
import { DEFAULT_SIGNATURE } from "../lib/defaults";

// `bun run gen` executes from the project root.
const out = join(process.cwd(), "alperen-signature.html");
writeFileSync(out, buildSignatureDocument(DEFAULT_SIGNATURE));
console.log(`Wrote ${out}`);
