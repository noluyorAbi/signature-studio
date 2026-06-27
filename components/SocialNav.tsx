"use client";

import { SOCIAL_ORDER, SOCIAL_LABELS, type SignatureData } from "@/lib/types";
import { SIG } from "@/lib/signatureTokens";
import { SOCIAL_ICON } from "./icons";

/**
 * The interactive vertical social nav bar — the Custom Esignature signature
 * element. Renders only links that have a value. Hover lifts and accents.
 */
export function SocialNav({
  socials,
  accent,
}: {
  socials: SignatureData["socials"];
  accent: string;
}) {
  const keys = SOCIAL_ORDER.filter((k) => socials[k]?.trim());
  if (keys.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {keys.map((k, i) => {
        const Icon = SOCIAL_ICON[k];
        return (
          <a
            key={k}
            href={socials[k]}
            target="_blank"
            rel="noopener noreferrer"
            title={SOCIAL_LABELS[k]}
            aria-label={SOCIAL_LABELS[k]}
            className="group/icon relative flex h-7 w-7 items-center justify-center rounded-md transition-[color,transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 motion-safe:[animation:rise_0.45s_var(--ease-family)_both]"
            style={{ animationDelay: `${i * 55}ms`, color: SIG.iconRest }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = accent;
              e.currentTarget.style.backgroundColor = `${accent}14`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = SIG.iconRest;
              e.currentTarget.style.backgroundColor = "";
            }}
          >
            <Icon size={17} />
          </a>
        );
      })}
    </div>
  );
}
