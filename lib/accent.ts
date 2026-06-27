/**
 * Accent color engine — the single source of truth for how the user's chosen
 * accent is split into email-safe, WCAG-aware roles.
 *
 * ONE picked color drives four things: the divider stroke, link text, the
 * verification-badge fill, and the nav-icon hover. But a bright brand accent
 * (e.g. #4d7dff is only ~3.7:1 on white) FAILS AA for body/link text. So we
 * split the token:
 *   - accentFill : the bright color as-picked, for the 2px divider + badge fill
 *                  + nav hover (graphic contrast, AA wants >= 3:1).
 *   - accentText : an auto-darkened sibling (hue/sat preserved) guaranteed
 *                  >= 4.5:1 on white, for mailto/website links.
 *   - onAccent   : white or near-black, whichever reads better ON the fill
 *                  (the badge checkmark / monogram glyph).
 *
 * Both render paths consume PLAIN HEX from here: the live preview wires these
 * into CSS custom properties (--accent-fill / --accent-text / --accent-on) for
 * a zero-JS recolor, and the email serializer interpolates the same hex
 * literals inline (email clients drop CSS variables). Saved == emailed.
 */

export type DerivedAccent = {
  /** As-picked bright color: divider, badge fill, nav hover. */
  accentFill: string;
  /** Auto-darkened to >= 4.5:1 on white: link text. */
  accentText: string;
  /** Foreground that reads on accentFill: "#ffffff" | "#14161b". */
  onAccent: string;
  /** accentFill contrast vs white (graphic/non-text threshold is 3:1). */
  fillContrast: number;
  /** accentText contrast vs white (>= 4.5 after correction). */
  textContrast: number;
  /** Human-readable lint message for the editor, or null when all-clear. */
  warning: string | null;
};

export const ACCENT_FALLBACK = "#4d7dff";
const AA_TEXT = 4.5; // links / body text on white
const AA_GRAPHIC = 3.0; // divider / badge fill on white
const NEAR_BLACK: RGB = [20, 22, 27]; // #14161b, the signature's ink

type RGB = [number, number, number];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Accepts #abc / abc / #aabbcc / aabbcc. Returns canonical #rrggbb or null. */
export function normalizeHex(input: string): string | null {
  let h = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  return /^[0-9a-fA-F]{6}$/.test(h) ? "#" + h.toLowerCase() : null;
}

const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = ([r, g, b]: RGB): string =>
  "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");

/** WCAG relative luminance. */
function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const WHITE: RGB = [255, 255, 255];

/* --- HSL round-trip so we darken via lightness only, preserving hue + sat --- */
function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const ch = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [ch(h + 1 / 3) * 255, ch(h) * 255, ch(h - 1 / 3) * 255];
}

/**
 * Split a picked hex into its email-safe accent roles. Pure + deterministic;
 * unit-testable; never throws (invalid input falls back to the brand azure).
 */
export function deriveAccent(input: string): DerivedAccent {
  const normalized = normalizeHex(input);
  const hex = normalized ?? ACCENT_FALLBACK;
  const rgb = hexToRgb(hex);
  const fillContrast = contrast(rgb, WHITE);

  // Walk lightness down in 2% steps until link text clears AA on white.
  const [h, s] = rgbToHsl(rgb);
  let [, , l] = rgbToHsl(rgb);
  let textRgb = rgb;
  let textContrast = fillContrast;
  for (let i = 0; i < 60 && textContrast < AA_TEXT && l > 0; i++) {
    l = Math.max(0, l - 0.02);
    textRgb = hslToRgb([h, s, l]);
    textContrast = contrast(textRgb, WHITE);
  }
  const accentText = rgbToHex(textRgb);
  // Badge check + monogram glyph are GRAPHIC (3:1), not body text. Prefer white
  // (the conventional "verified" / avatar look) and only flip to near-black when
  // the fill is too light for white to clear the graphic threshold.
  const onAccent = contrast(rgb, WHITE) >= AA_GRAPHIC ? "#ffffff" : rgbToHex(NEAR_BLACK);

  let warning: string | null = null;
  if (normalized === null && input.trim() !== "") {
    warning = `"${input}" is not a valid hex color. Using ${ACCENT_FALLBACK}.`;
  } else if (fillContrast < AA_GRAPHIC) {
    warning = `Accent ${hex} is too light for the divider and badge on white (${round2(
      fillContrast,
    )}:1, needs 3:1). Pick a deeper color.`;
  } else if (fillContrast < AA_TEXT) {
    warning = `Links use an auto-darkened ${accentText} for legibility (your ${hex} is ${round2(
      fillContrast,
    )}:1; AA body text needs 4.5:1).`;
  }

  return {
    accentFill: hex,
    accentText,
    onAccent,
    fillContrast: round2(fillContrast),
    textContrast: round2(textContrast),
    warning,
  };
}
