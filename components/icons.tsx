import type { SVGProps } from "react";
import type { SocialKey } from "@/lib/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/* ---- Brand glyphs (filled, simple-icons paths) ---- */

function Brand({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const GithubIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </Brand>
);

export const LinkedinIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </Brand>
);

export const XIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </Brand>
);

export const InstagramIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </Brand>
);

export const YoutubeIcon = (p: IconProps) => (
  <Brand {...p}>
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </Brand>
);

/* ---- Outline glyphs (stroked, lucide-style) ---- */

function Line({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const GlobeIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M2.5 12h19" />
    <path d="M12 2.5a14.5 14.5 0 010 19 14.5 14.5 0 010-19z" />
  </Line>
);

export const MailIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 6 9 6 9-6" />
  </Line>
);

export const PhoneIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 3.5h3.2l1.4 4.2-2 1.3a12 12 0 005.1 5.1l1.3-2 4.2 1.4V18a2.5 2.5 0 01-2.7 2.5A16.5 16.5 0 013 6.2 2.5 2.5 0 015 3.5z" />
  </Line>
);

export const PinIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Line>
);

export const CopyIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.2" />
    <path d="M5 15a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2" />
  </Line>
);

export const DownloadIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
  </Line>
);

export const PlusIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 5v14M5 12h14" />
  </Line>
);

export const CheckIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Line>
);

export const CodeIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="m9 8-5 4 5 4m6-8 5 4-5 4" />
  </Line>
);

export const SparkleIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
  </Line>
);

export const ResetIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M4 5v5h5" />
    <path d="M4.5 10a8 8 0 113.2 8.8" />
  </Line>
);

export const ExternalIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M14 4h6v6m0-6L10 14" />
    <path d="M18 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5" />
  </Line>
);

/* ---- Verification badge (filled, accent) ---- */
export const BadgeCheckIcon = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
    />
    <path
      fill="#fff"
      d="m10.09 15.41-2.5-2.5 1.06-1.06 1.44 1.43 3.66-3.66 1.06 1.06-4.72 4.73z"
    />
  </svg>
);

/* ---- Registry for the social nav ---- */
export const SOCIAL_ICON: Record<
  SocialKey,
  (p: IconProps) => React.ReactElement
> = {
  website: GlobeIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
};
