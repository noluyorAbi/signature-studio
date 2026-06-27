<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from
your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing
any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guide

Read this before changing the signature pipeline. It encodes the invariants that keep the
exported signature deliverable across real email clients.

## Mental model: one data object, two render paths

```
SignatureData (lib/types.ts)
  |-- components/SignatureCard.tsx   animated React preview (CSS, motion, :hover)
  |-- lib/exportHtml.ts              pure serializer -> email-safe HTML string
```

The two paths share **data only, never CSS**. The serializer is the real product; the preview
is disposable. Never serialize the React DOM to produce an export. Colours and the web-safe
font come from `lib/signatureTokens.ts` so the two paths cannot drift.

## File map

| Path | Role |
|---|---|
| `lib/types.ts` | `SignatureData`, `SOCIAL_ORDER`, `SOCIAL_LABELS` |
| `lib/defaults.ts` | pre-filled brand + `STORAGE_KEY` |
| `lib/signatureTokens.ts` | shared light palette + web-safe font (source of truth) |
| `lib/accent.ts` | contrast-safe accent engine (`deriveAccent`) |
| `lib/exportHtml.ts` | email-safe HTML serializer (static signature) |
| `lib/cardSignature.ts` | clickable card HTML (embedded icon PNGs + animated portrait) |
| `lib/portraitGif.ts` | canvas portrait strip-reveal GIF |
| `lib/fullSignatureGif.ts` | whole-signature GIF, drawn entirely on canvas |
| `lib/iconCanvas.ts` | shared canvas icon drawing + `renderIconDataUrl` |
| `lib/usePersistentSignature.ts` | localStorage-backed state (SSR-safe hydration) |
| `components/*` | editor, live preview, social nav, portrait, export panel, icons |
| `app/api/proxy-image/route.ts` | SSRF-hardened image proxy (canvas needs same-origin) |
| `ads/` | Remotion advertisement videos |

## Hard invariants (do not break)

1. **Email-safe export.** Tables (`role="presentation"`, `cellpadding/cellspacing=0`), all
   styles **inline**, web-safe fonts (Arial stack), no `<script>`, no flexbox/grid, no `<style>`
   block, no CSS classes. Outlook-safe: explicit widths, `valign`, `font-size:0;line-height:0`
   on spacer/divider cells. Vertical centering uses `valign="middle"` on the row cells, never
   transforms.
2. **Tiny + Gmail-safe.** The static signature must stay a few KB. Gmail's signature field caps
   near 10 KB and **strips data-URIs**, so an embedded GIF cannot work there. Embedded
   (data-URI) outputs are Apple Mail / iOS only. For Gmail, images must be **hosted** (short URL)
   and the static signature references them via `animatedPhotoUrl || photoUrl`.
3. **Accent is contrast-split.** Use `deriveAccent(hex)` -> `accentFill` (divider/badge/icons),
   `accentText` (links, auto-darkened to >= 4.5:1 on white), `onAccent` (glyph on fill). Never
   use the raw accent for link text.
4. **Light paper signature.** The signature renders dark text on white. It must not inherit the
   dark app chrome tokens or the brand fonts (dark signatures invert badly under email dark mode).
5. **No em dash anywhere. No emojis in product output.** Personal-brand only (no employer).

## GIFs are drawn on canvas, not screenshotted

`html-to-image` was tried and **rejected**: it produced blank text when capturing an off-screen
node. All GIFs are drawn directly on `<canvas>` and encoded with `gifenc`:

- `portraitGif.ts` draws the strip-reveal (configurable `reveal`/`hold`/`colors`/`size`).
- `fullSignatureGif.ts` draws the **whole** signature (icons via `iconCanvas`, text via
  `fillText`, photo strips) and composites a static base with the per-frame reveal.

Cross-origin photos must be loaded through `/api/proxy-image` (same-origin) or the canvas taints
and `getImageData` throws.

## Gotchas

- **Next private folders.** A folder under `app/` whose name starts with `_` is NOT routed
  (private folder). An API route at `app/api/_x/route.ts` returns 404. Use a normal name.
- **`withProtocol` allows `data:`.** Required so embedded GIF/icon data-URIs survive into the
  `<img src>` instead of being prefixed with `https://`.
- **SSRF proxy** resolves the host and blocks private/loopback/link-local/ULA/multicast IPs and
  re-validates redirects. Keep that if you touch `proxy-image`.
- **`dangerouslySetInnerHTML`** in the export preview is fed only by our serializer, which
  HTML-escapes every text field and sanitizes URLs. Keep that guarantee if you change it.

## Commands

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build (must stay clean)
bun run lint     # eslint (must stay clean)
bun run gen          # write static signature .html
bun run gen:animated # write signature with embedded animated portrait
```

Verify visually with Playwright when changing render output; check the exported HTML byte size
stays small (Gmail safety).

## Ads (Remotion)

```bash
cd ads && bun install
bun run studio        # Remotion editor
bun run render:promo  # 1080p promo -> ads/out/
```

`ads/src/SignatureCardVideo.tsx` rebuilds the signature card for video (frame-driven, fonts via
`@remotion/google-fonts`). It mirrors the same tokens/accent but is independent of the email
serializer. The suit photo lives in `ads/public/`.

## Recipes

- **Add a social platform:** extend `SOCIAL_ORDER` + `SOCIAL_LABELS` (`types.ts`), add an icon in
  `components/icons.tsx`, and add its canvas path to `iconCanvas.ts` `BRAND_PATHS`.
- **Add a field:** `types.ts` + `defaults.ts` + `components/Editor.tsx` + `lib/exportHtml.ts`
  (serializer) + `components/SignatureCard.tsx` (preview). Keep the export email-safe.
- **Tune GIF weight:** pass `size`/`reveal`/`hold`/`colors` to `buildPortraitGif`. Smaller =
  lighter data-URI (matters only for Apple Mail embeds; Gmail needs hosting regardless).
