/**
 * The LIGHT "paper" signature palette + web-safe font — one source of truth
 * imported by BOTH the live preview (components/SignatureCard.tsx) and the
 * email serializer (lib/exportHtml.ts) so the two render paths can never drift.
 *
 * Deliberately INDEPENDENT of the dark app-chrome @theme in app/globals.css.
 * The signature must NEVER inherit dark chrome tokens or the Bricolage/Hanken
 * brand fonts: it renders on white paper with off-black Arial text, because a
 * dark signature card inverts unpredictably under email-client dark mode. This
 * is the two-tier styling boundary made literal.
 *
 * Accent is NOT here — it is per-user and derived in lib/accent.ts.
 */

/** Web-safe stack. Arial first: the lowest-common-denominator across Gmail /
 *  Outlook (Word engine) / Apple Mail. No webfont, no brand font. */
export const SIG_FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

/** The fixed light palette of the signature card (NOT user-editable). */
export const SIG = {
  /** Card background. The default export surface; dark export is a warned opt-in. */
  paper: "#ffffff",
  /** Bold name. Off-black, softer than pure #000 for a refined read. */
  name: "#14161b",
  /** Job title. */
  title: "#565d6b",
  /** Tagline — the lightest text that still clears AA on white (4.6:1). */
  tagline: "#6b7280",
  /** Email / phone / website meta text. */
  meta: "#565d6b",
  /** Neutral hairline + " | " separators (decorative, sub-AA is fine). */
  divider: "#c7ccd6",
  /** Social-icon resting color: neutral slate, WYSIWYG at-rest in BOTH paths
   *  (accent only appears on hover in the preview; export stays neutral). */
  iconRest: "#5b6470",
} as const;

export type SigToken = keyof typeof SIG;
