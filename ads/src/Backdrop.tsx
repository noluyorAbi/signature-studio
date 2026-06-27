import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* drifting accent glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${28 + drift * 18}% ${22 + drift * 10}%, rgba(77,125,255,0.20), transparent 60%),
                       radial-gradient(50% 45% at ${82 - drift * 12}% 86%, rgba(110,150,255,0.10), transparent 55%)`,
        }}
      />
      {/* faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(120% 100% at 50% 35%, #000 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 50% 35%, #000 30%, transparent 78%)",
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{ boxShadow: "inset 0 0 320px 80px rgba(0,0,0,0.55)" }}
      />
    </AbsoluteFill>
  );
};
