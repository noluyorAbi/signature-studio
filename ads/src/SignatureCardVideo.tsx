import React from "react";
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SIG } from "./theme";
import { display, sans, mono } from "./fonts";
import { GlobeIcon, GithubIcon, LinkedinIcon, XIcon, MailIcon, BadgeCheck } from "./Icons";

const PHOTO = 188;
const STRIPS = 5;

export const SignatureCardVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardEnter = spring({ frame, fps, config: { damping: 18, mass: 0.9 } });
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const rise = (delay: number, dur = 10, dist = 14) => {
    const o = interpolate(frame, [delay, delay + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { opacity: o, transform: `translateY(${(1 - o) * dist}px)` };
  };

  const spineGrow = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const badgePop = spring({ frame: frame - 26, fps, config: { damping: 10, mass: 0.5 } });

  const navIcons: Array<(s: number, c: string) => React.ReactNode> = [
    GlobeIcon,
    (s, c) => GithubIcon(s, c),
    (s, c) => LinkedinIcon(s, c),
    (s, c) => XIcon(s, c),
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        background: SIG.paper,
        padding: "40px 48px",
        borderRadius: 24,
        boxShadow: "0 50px 120px -40px rgba(0,0,0,0.65), 0 0 0 1px rgba(20,30,60,0.05)",
        opacity: cardOpacity,
        transform: `scale(${interpolate(cardEnter, [0, 1], [0.95, 1])})`,
        fontFamily: sans,
      }}
    >
      {/* social nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
        {navIcons.map((Ico, i) => (
          <div key={i} style={rise(10 + i * 5, 10, 10)}>
            {Ico(26, SIG.iconRest)}
          </div>
        ))}
      </div>

      {/* accent spine */}
      <div
        style={{
          width: 4,
          alignSelf: "stretch",
          background: SIG.accentFill,
          borderRadius: 3,
          transform: `scaleY(${spineGrow})`,
          transformOrigin: "top",
        }}
      />

      {/* text block */}
      <div style={{ minWidth: 430 }}>
        <div
          style={{
            ...rise(14, 10),
            fontFamily: mono,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: SIG.accentText,
            marginBottom: 8,
          }}
        >
          {"</>"} ADATEPE.DEV
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, ...rise(18, 10) }}>
          <span style={{ fontFamily: display, fontSize: 34, fontWeight: 800, color: SIG.name, letterSpacing: -0.5 }}>
            Alperen Adatepe
          </span>
          <div style={{ transform: `scale(${interpolate(badgePop, [0, 1], [0, 1])})` }}>
            {BadgeCheck(26, SIG.accentFill)}
          </div>
        </div>

        <div style={{ ...rise(24, 10), fontSize: 21, color: SIG.title, marginTop: 6 }}>
          Full-Stack Developer &amp; Software Engineer
        </div>
        <div style={{ ...rise(28, 10), fontSize: 18, color: SIG.tagline, marginTop: 6 }}>
          Creating powerful digital experiences through modern solutions
        </div>

        <div style={{ ...rise(34, 10), display: "flex", alignItems: "center", gap: 9, marginTop: 22 }}>
          {MailIcon(20, SIG.accentText)}
          <span style={{ fontSize: 19, fontWeight: 600, color: SIG.accentText }}>alperen@adatepe.dev</span>
        </div>
        <div style={{ ...rise(38, 10), display: "flex", alignItems: "center", gap: 9, marginTop: 7 }}>
          {GlobeIcon(20, SIG.accentText)}
          <span style={{ fontSize: 19, fontWeight: 600, color: SIG.accentText }}>adatepe.dev</span>
        </div>
      </div>

      {/* portrait strip-reveal */}
      <div
        style={{
          position: "relative",
          width: PHOTO,
          height: PHOTO,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid #e6e8ee",
          boxShadow: "0 18px 44px -18px rgba(20,30,60,0.4)",
        }}
      >
        {Array.from({ length: STRIPS }).map((_, i) => {
          const o = interpolate(frame, [10 + i * 4, 26 + i * 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: (i * PHOTO) / STRIPS,
                width: PHOTO / STRIPS + 1,
                opacity: o,
                transform: `translateX(${(1 - o) * 16}px)`,
                backgroundImage: `url(${staticFile("suit.jpeg")})`,
                backgroundSize: `${PHOTO}px ${PHOTO}px`,
                backgroundPosition: `${(-i * PHOTO) / STRIPS}px center`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
