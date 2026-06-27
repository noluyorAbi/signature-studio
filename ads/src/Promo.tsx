import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Backdrop } from "./Backdrop";
import { SignatureCardVideo } from "./SignatureCardVideo";
import { C } from "./theme";
import { display, sans, mono } from "./fonts";

const fade = (frame: number, dur: number, inF = 12, outF = 14) => {
  const fin = interpolate(frame, [0, inF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fout = interpolate(frame, [dur - outF, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.min(fin, fout);
};

const rise = (frame: number, delay: number, dur = 14, dist = 26) => {
  const o = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { opacity: o, transform: `translateY(${(1 - o) * dist}px)` };
};

const Kicker: React.FC = () => (
  <div style={{ fontFamily: mono, color: C.accent, fontSize: 26, fontWeight: 700, letterSpacing: 7, textTransform: "uppercase" }}>
    {"</>"} Signature Studio
  </div>
);

const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade(frame, dur) }}>
      <div style={{ textAlign: "center" }}>
        <div style={rise(frame, 4)}>
          <Kicker />
        </div>
        <div style={{ ...rise(frame, 12), fontFamily: display, fontWeight: 800, fontSize: 108, lineHeight: 1.04, color: C.fg, marginTop: 28, letterSpacing: -2 }}>
          Your email signature,
          <br />
          <span style={{ color: C.accent }}>now animated.</span>
        </div>
        <div style={{ ...rise(frame, 24), fontFamily: sans, fontSize: 34, color: C.muted, marginTop: 30 }}>
          Built in the browser. Email-safe. No backend.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Hero: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade(frame, dur, 16, 16) }}>
      <div style={{ transform: "scale(1.5)" }}>
        <SignatureCardVideo />
      </div>
      <div style={{ position: "absolute", bottom: 96, ...rise(frame, 54, 16), fontFamily: mono, fontSize: 24, letterSpacing: 4, color: C.muted, textTransform: "uppercase" }}>
        Live editor &middot; real-time preview &middot; one-click export
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ label: string; frame: number; delay: number; fps: number }> = ({ label, frame, delay, fps }) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.6 } });
  return (
    <div
      style={{
        fontFamily: sans,
        fontSize: 30,
        fontWeight: 600,
        color: C.fg,
        padding: "18px 34px",
        borderRadius: 999,
        border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.04)",
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

const Features: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chips = ["Animated GIF", "Clickable links", "Email-safe HTML", "Gmail · Apple · Outlook"];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade(frame, dur) }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...rise(frame, 2), fontFamily: display, fontWeight: 800, fontSize: 72, color: C.fg, letterSpacing: -1, marginBottom: 50 }}>
          Everything an inbox respects.
        </div>
        <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap", maxWidth: 1400 }}>
          {chips.map((c, i) => (
            <Chip key={c} label={c} frame={frame} delay={10 + i * 7} fps={fps} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 13, mass: 0.7 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade(frame, dur, 14, 18) }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...rise(frame, 2), marginBottom: 14 }}>
          <Kicker />
        </div>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 96, color: C.fg, letterSpacing: -2, transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`, opacity: interpolate(pop, [0, 1], [0, 1]) }}>
          Signature Studio
        </div>
        <div
          style={{
            ...rise(frame, 18),
            display: "inline-block",
            marginTop: 36,
            fontFamily: mono,
            fontSize: 30,
            fontWeight: 600,
            color: "#fff",
            background: C.accent,
            padding: "20px 40px",
            borderRadius: 16,
            boxShadow: `0 26px 60px -22px ${C.accent}`,
          }}
        >
          github.com/noluyorAbi/signature-studio
        </div>
        <div style={{ ...rise(frame, 28), fontFamily: sans, fontSize: 26, color: C.subtle, marginTop: 26 }}>
          by adatepe.dev
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      <Sequence durationInFrames={95}>
        <Hook dur={95} />
      </Sequence>
      <Sequence from={85} durationInFrames={215}>
        <Hero dur={215} />
      </Sequence>
      <Sequence from={288} durationInFrames={92}>
        <Features dur={92} />
      </Sequence>
      <Sequence from={368} durationInFrames={82}>
        <CTA dur={82} />
      </Sequence>
    </AbsoluteFill>
  );
};
