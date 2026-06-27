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

export type SignatureData = {
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

  // Links — empty string means "hidden"
  socials: Record<SocialKey, string>;
};
