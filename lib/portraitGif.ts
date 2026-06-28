"use client";

import { GIFEncoder, quantize, applyPalette } from "gifenc";

/**
 * Renders the portrait strip-reveal to an animated GIF (the only animation
 * technique broadly supported in email: Gmail / Apple Mail / mobile animate it;
 * Outlook desktop shows the first frame). Opaque white background so it sits
 * seamlessly on a white email body. Plays once and rests on the full photo.
 */

const STRIPS = 5;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/** Route cross-origin images through our same-origin proxy to keep canvas clean. */
function proxied(url: string): string {
  if (/^data:/.test(url)) return url;
  const abs = new URL(url, location.origin).href;
  if (abs.startsWith(location.origin)) return abs;
  return `/api/proxy-image?url=${encodeURIComponent(abs)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

type Opts = {
  photoUrl: string;
  name: string;
  accent: string;
  onAccent?: string;
  size?: number;
  /** reveal frame count (fewer = smaller file) */
  reveal?: number;
  /** hold frames on the final photo */
  hold?: number;
  /** GIF palette size (fewer colours = smaller file) */
  colors?: number;
  delay?: number;
};

export async function buildPortraitGif({
  photoUrl,
  name,
  accent,
  onAccent = "#ffffff",
  size = 176,
  reveal = 18,
  hold = 6,
  colors = 128,
  delay = 50,
}: Opts): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");

  let img: HTMLImageElement | null = null;
  if (photoUrl.trim()) {
    try {
      img = await loadImage(proxied(photoUrl.trim()));
    } catch {
      img = null; // fall back to monogram
    }
  }

  const stripW = size / STRIPS;
  const total = reveal + hold;
  const gif = GIFEncoder();

  for (let f = 0; f < total; f++) {
    // Frame 0 is the FULL photo so Outlook (shows only the first frame) renders
    // the complete portrait, not a blank reveal start. The reveal plays from f=1.
    const p = f === 0 ? 1 : f < reveal ? f / (reveal - 1) : 1;
    drawFrame(ctx, size, stripW, img, p, name, accent, onAccent);

    const { data } = ctx.getImageData(0, 0, size, size);
    const palette = quantize(data, colors);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, size, size, {
      palette,
      delay,
      ...(f === 0 ? { repeat: -1 } : {}),
    });
  }

  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  stripW: number,
  img: HTMLImageElement | null,
  p: number,
  name: string,
  accent: string,
  onAccent: string,
) {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < STRIPS; i++) {
    const local = clamp((p - i * 0.12) / 0.5, 0, 1);
    const e = 1 - Math.pow(1 - local, 3); // ease-out
    if (e <= 0) continue;
    const xOff = (1 - e) * (size * 0.12);

    ctx.save();
    ctx.beginPath();
    ctx.rect(i * stripW, 0, stripW + 1, size);
    ctx.clip();
    ctx.globalAlpha = e;
    if (img) {
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, xOff, 0, size, size);
    } else {
      ctx.fillStyle = accent;
      ctx.fillRect(xOff, 0, size, size);
    }
    ctx.restore();
  }

  if (!img) {
    ctx.save();
    ctx.globalAlpha = clamp((p - 0.2) / 0.6, 0, 1);
    ctx.fillStyle = onAccent;
    ctx.font = `bold ${Math.round(size * 0.34)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(name), size / 2, size / 2 + size * 0.02);
    ctx.restore();
  }
}
