import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, Easing } from "remotion";
import { Backdrop } from "./Backdrop";
import { SignatureCardVideo } from "./SignatureCardVideo";
import { C } from "./theme";
import { display, sans, mono } from "./fonts";

const rise = (frame: number, delay: number, dur = 14, dist = 24) => {
  const o = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { opacity: o, transform: `translateY(${(1 - o) * dist}px)` };
};

export const Square: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "space-between", padding: "96px 0 84px" }}>
        {/* headline */}
        <div style={{ textAlign: "center" }}>
          <div style={{ ...rise(frame, 2), fontFamily: mono, color: C.accent, fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase" }}>
            {"</>"} Signature Studio
          </div>
          <div style={{ ...rise(frame, 10), fontFamily: display, fontWeight: 800, fontSize: 76, lineHeight: 1.05, color: C.fg, letterSpacing: -1.5, marginTop: 22 }}>
            Email signatures,
            <br />
            <span style={{ color: C.accent }}>animated.</span>
          </div>
        </div>

        {/* signature card */}
        <Sequence from={26}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: "scale(1.18)" }}>
              <SignatureCardVideo />
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* cta */}
        <div
          style={{
            ...rise(frame, 92),
            fontFamily: mono,
            fontSize: 27,
            fontWeight: 600,
            color: "#fff",
            background: C.accent,
            padding: "18px 36px",
            borderRadius: 14,
            boxShadow: `0 24px 56px -22px ${C.accent}`,
          }}
        >
          github.com/noluyorAbi/signature-studio
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
