"use client";

import type { SocialKey } from "./types";

/**
 * Canvas icon drawing, shared by the whole-signature GIF and the clickable
 * card signature (which embeds each icon as a small PNG data-URI wrapped in an
 * <a>). simple-icons 24-viewBox fill paths; globe/mail drawn as primitives.
 */

export const BRAND_PATHS: Partial<Record<SocialKey, string>> = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
};

export function drawFillIcon(ctx: CanvasRenderingContext2D, d: string, cx: number, cy: number, size: number, color: string) {
  const path = new Path2D(d);
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

export function drawGlobe(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const r = size * 0.46;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.082);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.46, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawMail(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const w = size * 0.94;
  const h = size * 0.68;
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.082);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, y + h * 0.14);
  ctx.lineTo(cx, y + h * 0.58);
  ctx.lineTo(x + w * 0.94, y + h * 0.14);
  ctx.stroke();
  ctx.restore();
}

export function drawSocial(ctx: CanvasRenderingContext2D, key: SocialKey, cx: number, cy: number, size: number, color: string) {
  if (key === "website") return drawGlobe(ctx, cx, cy, size, color);
  const d = BRAND_PATHS[key];
  if (d) drawFillIcon(ctx, d, cx, cy, size, color);
}

/** Render a single icon to a transparent PNG data-URI for embedding in <img>. */
export function renderIconDataUrl(kind: SocialKey | "mail", color: string, size = 18, pr = 3): string {
  const canvas = document.createElement("canvas");
  canvas.width = size * pr;
  canvas.height = size * pr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(pr, pr);
  if (kind === "mail") drawMail(ctx, size / 2, size / 2, size, color);
  else drawSocial(ctx, kind, size / 2, size / 2, size, color);
  return canvas.toDataURL("image/png");
}
