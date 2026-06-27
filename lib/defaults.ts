import type { SignatureData } from "./types";

/**
 * Pre-filled with the adatepe.dev personal brand.
 * NDA: no employer / no BMW reference anywhere. Personal brand only.
 * Location intentionally left empty (privacy).
 */
export const DEFAULT_SIGNATURE: SignatureData = {
  name: "Alperen Adatepe",
  title: "Full-Stack Developer & Software Engineer",
  company: "",
  tagline: "Creating powerful digital experiences through modern solutions",
  brand: "adatepe.dev",

  email: "alperen@adatepe.dev",
  phone: "",
  website: "adatepe.dev",
  location: "",

  photoUrl: "https://www.adatepe.dev/_next/image?url=%2Falpi-anzug-no-tie.jpeg&w=640&q=75",
  animatedPhotoUrl: "",
  showAvatar: true,
  showVerifiedBadge: true,
  accentColor: "#4d7dff",

  socials: {
    website: "https://adatepe.dev",
    github: "https://github.com/noluyorAbi",
    linkedin: "https://www.linkedin.com/in/alperen-adatepe",
    x: "https://x.com/adatepedev",
    instagram: "",
    youtube: "",
  },
};

export const STORAGE_KEY = "signature-studio:v1";
