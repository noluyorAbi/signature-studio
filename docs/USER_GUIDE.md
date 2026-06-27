# User Guide

How to build and install your own email signature with Signature Studio.

## 1. Run it

```bash
bun install
bun run dev
```

Open <http://localhost:3000>. The app boots pre-filled with a demo signature so you
immediately see a complete, animated result.

## 2. Fill in your details

The editor on the left has four sections. Every change updates the live preview instantly,
and your draft is saved to the browser (localStorage) automatically.

| Section | What goes here |
|---|---|
| **Identity** | Full name, job title, optional company, brand wordmark, tagline |
| **Contact** | Email, phone (optional), website, location (optional) |
| **Links** | Website, GitHub, LinkedIn, X, Instagram, YouTube. Empty links disappear. |
| **Appearance** | Accent colour, profile photo URL, animated photo URL, toggles |

Notes:

- **Accent colour.** Pick a swatch or a custom colour. If a colour is too light to read on a
  white email, a warning appears and links are auto-darkened so they stay legible.
- **Profile photo.** Paste a hosted, square image URL. Leave it empty to get a monogram tile.
- **Verification badge / portrait** toggles are in Appearance.

## 3. Preview

The preview header has a toggle:

- **Animated** is the interactive, motion-rich preview (use **Replay** to play it again).
- **Email** renders the exact static HTML your recipients receive. What you see is what they get.

## 4. Export

`Copy signature` puts a clean, email-safe signature on your clipboard. It is tiny (~3 KB),
has clickable links, and is safe to paste into any mail client. `\.html` downloads the same
signature as a file.

For motion, use the **Animate in email** panel:

| Option | What it gives | Best for |
|---|---|---|
| **Clickable + animated** | Full card, every region is a real link, portrait animates | Apple Mail / iOS |
| **Whole signature as GIF** | The complete signature as one animated image | A single image you host anywhere |

## 5. Install in your mail client

After `Copy signature` (or building an animated version), paste it in:

- **Gmail**: Settings (gear) -> See all settings -> General -> Signature -> Create new ->
  paste (Cmd/Ctrl+V) -> Save changes.
- **Outlook (web)**: Settings -> Mail -> Compose and reply -> paste into the signature box -> Save.
- **Apple Mail**: Settings -> Signatures -> pick the account -> paste. Untick "Always match my
  default message font".

## 6. Animation per mail client (important)

Email only animates via GIF, and clients differ:

- **Apple Mail / iOS** play embedded GIFs immediately. Use **Clickable + animated** and paste.
  Done, no hosting.
- **Gmail** caps the signature field at about 10 KB, so an embedded GIF will not fit ("signature
  too long"). To animate in Gmail: download the GIF, **host it** somewhere public, paste its URL
  into **Animated photo URL**, then use **Copy signature**. The signature stays ~3 KB and the
  portrait animates.
- **Outlook desktop** shows the first frame of any GIF, which is a clean static signature.

### Where to host a GIF

Anywhere that serves a public image URL: your own site (for example `adatepe.dev/sig.gif`), a
GitHub repo `raw` URL, a CDN, or an image host. Paste the resulting `https://...gif` URL into
**Animated photo URL**.

## 7. Generate from the command line

```bash
bun run gen          # writes alperen-signature.html (static)
bun run gen:animated # writes alperen-signature-animated.html (embedded animated portrait)
```

Edit `lib/defaults.ts` to change the pre-filled brand, then re-run.

## Tips

- Empty fields vanish from the signature, so only fill what you want shown.
- The signature is fluid: on a narrow screen it wraps to fit, no horizontal scroll.
- Reset to the demo defaults anytime with the **Reset to defaults** button in the editor.
