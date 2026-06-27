"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { renderTemplate } from "@/lib/templates";
import type { SignatureData } from "@/lib/types";

/**
 * Renders a template's email HTML and auto-fits it inside the parent box
 * (measures the natural size, scales to fit width AND height, centered, never
 * cropped). The parent must have a fixed height.
 */
export function TemplateThumb({
  data,
  templateId,
  pad = 16,
  max = 1.5,
}: {
  data: SignatureData;
  templateId: string;
  pad?: number;
  max?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const html = useMemo(() => renderTemplate({ ...data, templateId }), [data, templateId]);

  useLayoutEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i) return;
    const fit = () => {
      const bw = w.clientWidth - pad * 2;
      const bh = w.clientHeight - pad * 2;
      const iw = i.offsetWidth;
      const ih = i.offsetHeight;
      if (iw && ih && bw > 0 && bh > 0) setScale(Math.min(bw / iw, bh / ih, max));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(w);
    return () => ro.disconnect();
  }, [html, pad, max]);

  return (
    <div ref={wrap} className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
      <div
        style={{ transform: scale ? `scale(${scale})` : undefined, opacity: scale ? 1 : 0, transformOrigin: "center", transition: "opacity 0.2s ease" }}
      >
        <div ref={inner} className="inline-block" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
