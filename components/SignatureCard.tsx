"use client";

import type { SignatureData } from "@/lib/types";
import { deriveAccent } from "@/lib/accent";
import { SIG, SIG_FONT } from "@/lib/signatureTokens";
import { SocialNav } from "./SocialNav";
import { ProfilePhoto } from "./ProfilePhoto";
import { BadgeCheckIcon, MailIcon, PhoneIcon, GlobeIcon, PinIcon } from "./icons";

const stripProtocol = (s: string) => s.replace(/^https?:\/\//, "");

/**
 * High-fidelity, animated live preview of the signature, rendered on a white
 * email surface (dark text). Colours, the web-safe font and accent roles come
 * from the shared token modules (signatureTokens + deriveAccent) so the preview
 * matches the exported email exactly.
 */
export function SignatureCard({
  data,
  playKey,
  progress,
  capture = false,
}: {
  data: SignatureData;
  playKey: number | string;
  /** 0..1 deterministic seek for GIF capture; undefined = live CSS animation. */
  progress?: number;
  /** Capture mode for the whole-signature GIF: portrait becomes a placeholder. */
  capture?: boolean;
}) {
  const { accentFill, accentText, onAccent } = deriveAccent(data.accentColor);
  const seek = progress !== undefined;

  return (
    <div
      className="flex items-stretch gap-4"
      style={{ fontFamily: SIG_FONT, color: SIG.name }}
    >
      <SocialNav socials={data.socials} accent={accentFill} />

      {/* accent divider */}
      <div
        className="w-px shrink-0 self-stretch rounded-full"
        style={{ background: `linear-gradient(${accentFill}, ${accentFill}55)` }}
      />

      {/* text block */}
      <div className="min-w-0 flex-1">
        {data.brand.trim() && (
          <div
            className={`mb-1 text-[11px] font-bold uppercase tracking-[0.16em] ${seek ? "" : "motion-safe:[animation:shimmer_3.2s_linear_infinite]"}`}
            style={{
              backgroundImage: `linear-gradient(90deg, ${accentText}, ${accentFill}, ${accentText})`,
              backgroundSize: "200% auto",
              ...(seek ? { backgroundPosition: `${200 - progress! * 200}% center` } : {}),
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {"</> "}
            {data.brand}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-[17px] font-bold leading-tight" style={{ color: SIG.name }}>
            {data.name || "Your Name"}
          </span>
          {data.showVerifiedBadge && (
            <BadgeCheckIcon size={16} style={{ color: accentFill }} />
          )}
        </div>

        {data.title.trim() && (
          <div className="mt-0.5 text-[13px] leading-snug" style={{ color: SIG.title }}>
            {data.title}
            {data.company.trim() && (
              <>
                <span className="mx-1.5" style={{ color: SIG.divider }}>|</span>
                <span className="font-semibold" style={{ color: accentText }}>
                  {data.company}
                </span>
              </>
            )}
          </div>
        )}

        {data.tagline.trim() && (
          <div className="mt-1 text-[12px] leading-snug" style={{ color: SIG.tagline }}>
            {data.tagline}
          </div>
        )}

        <div className="mt-3 flex flex-col gap-1 text-[12px]">
          {data.email.trim() && (
            <Row icon={<MailIcon size={13} />} accent={accentText}>
              <a
                href={`mailto:${data.email}`}
                className="font-semibold no-underline transition-opacity hover:opacity-70"
                style={{ color: accentText }}
              >
                {data.email}
              </a>
            </Row>
          )}
          {data.phone.trim() && (
            <Row icon={<PhoneIcon size={13} />} accent={accentText}>
              <span style={{ color: SIG.meta }}>{data.phone}</span>
            </Row>
          )}
          {data.website.trim() && (
            <Row icon={<GlobeIcon size={13} />} accent={accentText}>
              <a
                href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold no-underline transition-opacity hover:opacity-70"
                style={{ color: accentText }}
              >
                {stripProtocol(data.website)}
              </a>
            </Row>
          )}
          {data.location.trim() && (
            <Row icon={<PinIcon size={13} />} accent={accentText}>
              <span style={{ color: SIG.meta }}>{data.location}</span>
            </Row>
          )}
        </div>
      </div>

      {/* portrait */}
      {data.showAvatar && (
        <ProfilePhoto
          key={`${playKey}-${data.photoUrl}`}
          photoUrl={data.photoUrl}
          name={data.name}
          accent={accentFill}
          onAccent={onAccent}
          size={104}
          progress={progress}
          capture={capture}
        />
      )}
    </div>
  );
}

function Row({
  icon,
  accent,
  children,
}: {
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 leading-none">
      <span className="shrink-0" style={{ color: accent }}>
        {icon}
      </span>
      {children}
    </div>
  );
}
