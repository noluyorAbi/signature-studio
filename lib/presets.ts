import type { SignatureData, FontKey, Roundness, Density } from "./types";

/** One-click skins that set several style fields at once. */
export type Preset = {
  id: string;
  name: string;
  accentColor: string;
  templateId: string;
  fontStack: FontKey;
  roundness: Roundness;
  density: Density;
};

export const PRESETS: Preset[] = [
  { id: "signature", name: "Signature", accentColor: "#4d7dff", templateId: "card", fontStack: "sans", roundness: "soft", density: "cozy" },
  { id: "mono-ink", name: "Mono Ink", accentColor: "#111827", templateId: "mono", fontStack: "mono", roundness: "square", density: "cozy" },
  { id: "editorial", name: "Editorial", accentColor: "#b45309", templateId: "editorial", fontStack: "classic", roundness: "soft", density: "spacious" },
  { id: "minimal", name: "Minimal", accentColor: "#0ea5e9", templateId: "underline", fontStack: "system", roundness: "square", density: "compact" },
  { id: "soft-round", name: "Soft", accentColor: "#8b5cf6", templateId: "left-photo", fontStack: "modern", roundness: "round", density: "cozy" },
  { id: "bold-banner", name: "Bold", accentColor: "#ef4444", templateId: "banner", fontStack: "sans", roundness: "soft", density: "cozy" },
];

export function applyPreset(d: SignatureData, p: Preset): SignatureData {
  return {
    ...d,
    accentColor: p.accentColor,
    templateId: p.templateId,
    fontStack: p.fontStack,
    roundness: p.roundness,
    density: p.density,
  };
}
