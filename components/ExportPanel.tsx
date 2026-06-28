"use client";

import { useMemo, useState } from "react";
import type { SignatureData } from "@/lib/types";
import { buildSignatureHtml, buildSignatureDocument } from "@/lib/exportHtml";
import { buildFullSignatureGif } from "@/lib/fullSignatureGif";
import { buildClickableCardSignature } from "@/lib/cardSignature";
import { buildVCard, buildPlainText } from "@/lib/exportExtras";
import { CopyIcon, CheckIcon, DownloadIcon, CodeIcon, ExternalIcon, SparkleIcon } from "./icons";

type Tab = "install" | "code";
type Job = "idle" | "busy" | "done" | "error";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function siteHref(data: SignatureData) {
  const raw = data.website.trim() || "adatepe.dev";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export function ExportPanel({ data }: { data: SignatureData }) {
  const html = useMemo(() => buildSignatureHtml(data), [data]);
  const doc = useMemo(() => buildSignatureDocument(data), [data]);
  const [tab, setTab] = useState<Tab>("install");
  const [copied, setCopied] = useState<"sig" | "code" | "whole" | "card" | "text" | null>(null);

  const [card, setCard] = useState<Job>("idle");
  const [cardHtml, setCardHtml] = useState<string | null>(null);

  const [whole, setWhole] = useState<Job>("idle");
  const [wholeUrl, setWholeUrl] = useState<string | null>(null);
  const [wholeData, setWholeData] = useState<{ dataUrl: string; width: number; blob: Blob } | null>(null);
  const [gifFrames, setGifFrames] = useState(18);
  const [gifWidth, setGifWidth] = useState(540);

  function flash(which: "sig" | "code" | "whole" | "card" | "text") {
    setCopied(which);
    setTimeout(() => setCopied((c) => (c === which ? null : c)), 1800);
  }

  function downloadVcf() {
    const name = (data.name || "signature").replace(/\s+/g, "-").toLowerCase();
    triggerDownload(new Blob([buildVCard(data)], { type: "text/vcard" }), `${name}.vcf`);
  }
  async function copyPlain() {
    await navigator.clipboard.writeText(buildPlainText(data));
    flash("text");
  }

  async function copyHtml(markup: string) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([markup], { type: "text/html" }),
          "text/plain": new Blob([markup], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(markup);
    }
  }

  async function copyStatic() {
    await copyHtml(html);
    flash("sig");
  }
  async function copyCode() {
    await navigator.clipboard.writeText(html);
    flash("code");
  }
  function download() {
    triggerDownload(new Blob([doc], { type: "text/html" }), "adatepe-signature.html");
  }

  // Clickable + animated card: every region is a real <a>, portrait is a GIF.
  async function copyCard() {
    setCard("busy");
    try {
      const markup = await buildClickableCardSignature(data);
      setCardHtml(markup);
      await copyHtml(markup);
      setCard("done");
      flash("card");
    } catch {
      setCard("error");
    }
  }

  // Whole signature as one flat animated GIF (not clickable).
  async function generateWhole() {
    setWhole("busy");
    try {
      const { blob, dataUrl, width } = await buildFullSignatureGif(data, { width: gifWidth, frames: gifFrames });
      if (wholeUrl) URL.revokeObjectURL(wholeUrl);
      setWholeUrl(URL.createObjectURL(blob));
      setWholeData({ dataUrl, width, blob });
      setWhole("done");
    } catch {
      setWhole("error");
    }
  }
  async function copyWhole() {
    if (!wholeData) return;
    const markup = `<a href="${siteHref(data)}" target="_blank" rel="noopener"><img src="${wholeData.dataUrl}" alt="${data.name}" width="${wholeData.width}" style="display:block;border:0;outline:0;max-width:100%;height:auto;" /></a>`;
    await copyHtml(markup);
    flash("whole");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={copyStatic}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_var(--color-accent)] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[var(--color-accent-hot)] active:scale-[0.98]"
        >
          {copied === "sig" ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          {copied === "sig" ? "Copied to clipboard" : "Copy signature"}
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] px-4 py-3 text-sm font-medium text-[var(--color-fg-muted)] transition-colors duration-150 hover:border-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] active:scale-[0.98]"
        >
          <DownloadIcon size={16} />
          .html
        </button>
      </div>

      <p className="text-[12px] leading-relaxed text-[var(--color-fg-subtle)]">
        Copy pastes a static, email-safe signature with clickable links: tiny (~3KB) and safe
        for Gmail. To animate the portrait <span className="text-[var(--color-fg-muted)]">in Gmail
        too</span>, host a GIF and paste its URL into <span className="text-[var(--color-fg)]">Animated
        photo URL</span>; this stays small. The embedded options below are for Apple Mail / iOS.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyPlain}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[12px] font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          {copied === "text" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied === "text" ? "Copied" : "Plain text"}
        </button>
        <button
          type="button"
          onClick={downloadVcf}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[12px] font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          <DownloadIcon size={14} /> vCard (.vcf)
        </button>
      </div>

      <div className="relative flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1 text-sm">
        <TabButton active={tab === "install"} onClick={() => setTab("install")}>
          <ExternalIcon size={14} /> Install
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")}>
          <CodeIcon size={14} /> Code
        </TabButton>
      </div>

      <div className="motion-safe:[animation:rise_0.3s_var(--ease-family)_both]" key={tab}>
        {tab === "install" ? (
          <ol className="flex flex-col gap-3 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
            <InstallStep client="Gmail">
              Settings (gear) → See all settings → General → Signature → Create new → paste
              (Cmd/Ctrl+V) → Save changes.
            </InstallStep>
            <InstallStep client="Outlook (web)">
              Settings → Mail → Compose and reply → paste into the signature box → Save.
            </InstallStep>
            <InstallStep client="Apple Mail">
              Settings → Signatures → pick the account → paste. Untick &ldquo;Always match my
              default message font.&rdquo;
            </InstallStep>
          </ol>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={copyCode}
              className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-panel)]/80 px-2 py-1 text-[11px] text-[var(--color-fg-muted)] backdrop-blur transition-colors hover:text-[var(--color-fg)]"
            >
              {copied === "code" ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
              {copied === "code" ? "Copied" : "Copy"}
            </button>
            <pre className="scroll-thin max-h-64 overflow-auto rounded-lg border border-[var(--color-border)] bg-[#0b0d11] p-3 pr-16 font-mono text-[11px] leading-relaxed text-[#aeb6c6]">
              <code>{html}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Animate in email */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
        <div className="flex items-center gap-2">
          <SparkleIcon size={15} className="text-[var(--color-accent)]" />
          <h3 className="font-display text-[13px] font-semibold text-[var(--color-fg)]">Animate in email</h3>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-fg-subtle)]">
          GIF is the only motion email allows. <span className="text-[var(--color-fg-muted)]">Apple Mail / iOS</span>{" "}
          render embedded GIFs + icons; <span className="text-[var(--color-fg-muted)]">Gmail</span> needs hosted
          images; <span className="text-[var(--color-fg-muted)]">Outlook desktop</span> shows the first frame.
        </p>

        {/* Clickable + animated card */}
        <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold text-[var(--color-fg)]">Clickable + animated</div>
              <div className="text-[10px] text-[var(--color-fg-subtle)]">Every region is a real link; portrait animates. Apple Mail / iOS.</div>
            </div>
            <button
              type="button"
              onClick={copyCard}
              disabled={card === "busy"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-[var(--color-accent-hot)] active:scale-[0.98] disabled:opacity-60"
            >
              {card === "busy" ? <SparkleIcon size={13} className="animate-pulse" /> : copied === "card" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
              {card === "busy" ? "Building…" : copied === "card" ? "Copied" : "Build & copy"}
            </button>
          </div>
          {cardHtml && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="rounded-md border border-[var(--color-border)] bg-white p-3" dangerouslySetInnerHTML={{ __html: cardHtml }} />
              <p className="text-[10px] leading-relaxed text-[var(--color-fg-subtle)]">
                Copied. Paste into Apple Mail / iOS — icons, links and the email/website are all
                clickable, portrait animates. Too large for Gmail&rsquo;s signature field; for Gmail
                use Copy signature above with a hosted Animated photo URL.
              </p>
            </div>
          )}
          {card === "error" && <p className="mt-2 text-[11px] text-amber-400/90">Could not build. The photo host may block access.</p>}
        </div>

        {/* Whole signature as one flat GIF */}
        <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold text-[var(--color-fg)]">Whole signature as GIF</div>
              <div className="text-[10px] text-[var(--color-fg-subtle)]">One flat image. Not clickable; host for Gmail.</div>
            </div>
            <button
              type="button"
              onClick={generateWhole}
              disabled={whole === "busy"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-fg-muted)] transition-colors duration-150 hover:text-[var(--color-fg)] disabled:opacity-60"
            >
              <SparkleIcon size={13} />
              {whole === "busy" ? "Rendering…" : whole === "done" ? "Regenerate" : "Generate"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">Reveal<span>{gifFrames}f</span></span>
              <input type="range" min={8} max={32} value={gifFrames} onChange={(e) => setGifFrames(Number(e.target.value))} className="accent-[var(--color-accent)]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">Width<span>{gifWidth}px</span></span>
              <input type="range" min={420} max={680} step={20} value={gifWidth} onChange={(e) => setGifWidth(Number(e.target.value))} className="accent-[var(--color-accent)]" />
            </label>
          </div>
          {wholeUrl && wholeData && (
            <div className="mt-3 flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wholeUrl} alt="Whole signature GIF preview" className="w-full rounded-md border border-[var(--color-border)] bg-white" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyWhole}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] px-3 py-2 text-[12px] font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] active:scale-[0.98]"
                >
                  {copied === "whole" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied === "whole" ? "Copied (embed)" : "Copy (embed)"}
                </button>
                <button
                  type="button"
                  onClick={() => triggerDownload(wholeData.blob, "adatepe-signature.gif")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] px-3 py-2 text-[12px] font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] active:scale-[0.98]"
                >
                  <DownloadIcon size={14} /> Host
                </button>
              </div>
            </div>
          )}
          {whole === "error" && <p className="mt-2 text-[11px] text-amber-400/90">Could not render the signature GIF.</p>}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors duration-150 ${
        active ? "bg-[var(--color-panel-hover)] text-[var(--color-fg)]" : "text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

function InstallStep({ client, children }: { client: string; children: React.ReactNode }) {
  return (
    <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
      <div className="mb-1 font-display text-[12px] font-semibold text-[var(--color-fg)]">{client}</div>
      <div>{children}</div>
    </li>
  );
}
