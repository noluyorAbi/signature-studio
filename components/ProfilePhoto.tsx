"use client";

/**
 * The signature "profile animation": a square portrait sliced into diagonal
 * parallelogram strips that reveal in a staggered cascade.
 *
 * Two modes:
 *  - live (default): CSS keyframe animation, replays via `key` upstream.
 *  - seek (`progress` 0..1): deterministic per-frame state for GIF capture.
 *    Falls back to a monogram tile when no photo URL.
 */

const STRIPS = 5;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function ProfilePhoto({
  photoUrl,
  name,
  accent,
  onAccent = "#ffffff",
  size = 96,
  progress,
  capture = false,
}: {
  photoUrl: string;
  name: string;
  accent: string;
  onAccent?: string;
  size?: number;
  progress?: number;
  /** Capture mode: render a plain white rounded placeholder so the GIF
   *  builder can measure the rect and draw the animated portrait on canvas. */
  capture?: boolean;
}) {
  const stripW = size / STRIPS;
  const seek = progress !== undefined;

  if (capture) {
    return (
      <div
        data-portrait
        className="shrink-0"
        style={{ width: size, height: size, borderRadius: 12, background: "#ffffff" }}
      />
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        boxShadow: "0 10px 30px -12px rgba(20,30,60,0.35)",
      }}
    >
      {Array.from({ length: STRIPS }).map((_, i) => {
        let seekStyle: React.CSSProperties = {};
        if (seek) {
          const local = clamp((progress! - i * 0.12) / 0.5, 0, 1);
          const e = 1 - Math.pow(1 - local, 3);
          const xOff = (1 - e) * (size * 0.12);
          seekStyle = { opacity: e, transform: `translateX(${xOff}px)` };
        }
        return (
          <div
            key={i}
            className={seek ? "" : "motion-safe:[animation:strip-in_0.62s_var(--ease-out-quint)_both]"}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: i * stripW,
              width: stripW + 1,
              ...(seek ? {} : { animationDelay: `${i * 70}ms` }),
              ...(photoUrl
                ? {
                    backgroundImage: `url("${photoUrl}")`,
                    backgroundSize: `${size}px ${size}px`,
                    backgroundPosition: `${-i * stripW}px center`,
                    backgroundRepeat: "no-repeat",
                  }
                : {
                    background: `linear-gradient(150deg, ${accent}, ${accent}cc)`,
                  }),
              ...seekStyle,
            }}
          />
        );
      })}

      {!photoUrl && (
        <div
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{
            fontSize: size * 0.34,
            letterSpacing: 1,
            color: onAccent,
            opacity: seek ? clamp((progress! - 0.2) / 0.6, 0, 1) : 1,
          }}
        >
          {initials(name)}
        </div>
      )}

      {/* subtle sheen along the diagonal */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(255,255,255,0.18) 0%, transparent 38%, transparent 62%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </div>
  );
}
