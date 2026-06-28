/**
 * Canonical data model for a signature. One flat object, persisted to
 * localStorage and fed to both the live preview and the email-safe exporter.
 */

export type SocialKey =
  | "website"
  | "github"
  | "linkedin"
  | "x"
  | "instagram"
  | "youtube";

/** Fixed render order of the vertical social nav. */
export const SOCIAL_ORDER: SocialKey[] = [
  "website",
  "github",
  "linkedin",
  "x",
  "instagram",
  "youtube",
];

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  website: "Website",
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  youtube: "YouTube",
};

export type FontKey = "sans" | "modern" | "classic" | "mono" | "system";
export type Roundness = "square" | "soft" | "round";
export type Density = "compact" | "cozy" | "spacious";

/** Web-safe font stacks (no webfonts, email-safe). */
export const FONT_STACKS: Record<FontKey, string> = {
  sans: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  modern: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', Times, serif",
  mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
};
export const FONT_LABELS: Record<FontKey, string> = { sans: "Arial", modern: "Segoe", classic: "Georgia", mono: "Mono", system: "System" };
export const ROUNDNESS_LABELS: Record<Roundness, string> = { square: "Square", soft: "Soft", round: "Round" };
export const DENSITY_LABELS: Record<Density, string> = { compact: "Compact", cozy: "Cozy", spacious: "Spacious" };
export const DENSITY_SCALE: Record<Density, number> = { compact: 0.82, cozy: 1, spacious: 1.18 };

export type SignatureData = {
  /** Selected signature template id (see lib/templates.ts). */
  templateId: string;

  // Identity
  name: string;
  title: string;
  company: string;
  tagline: string;
  /** Animated wordmark shown above the text block (personal brand). */
  brand: string;

  // Contact
  email: string;
  phone: string;
  website: string;
  location: string;

  // Visuals
  photoUrl: string;
  /** Hosted animated GIF of the portrait, used in the email export when set. */
  animatedPhotoUrl: string;
  showAvatar: boolean;
  showVerifiedBadge: boolean;
  accentColor: string;

  // Customization axes
  fontStack: FontKey;
  roundness: Roundness;
  density: Density;

  // Branding
  logoUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  disclaimer: string;

  // Links — empty string means "hidden"
  socials: Record<SocialKey, string>;
  /** Render order of the social links; defaults to SOCIAL_ORDER. */
  socialOrder: SocialKey[];
};

/** The social keys in the signature's chosen order, with any missing appended. */
export function socialKeysInOrder(d: Pick<SignatureData, "socialOrder">): SocialKey[] {
  const order = (d.socialOrder?.length ? d.socialOrder : SOCIAL_ORDER).filter((k) => SOCIAL_ORDER.includes(k));
  const missing = SOCIAL_ORDER.filter((k) => !order.includes(k));
  return [...order, ...missing];
}
