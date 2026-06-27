"use client";

import { useMemo, useState } from "react";
import { usePersistentSignature } from "@/lib/usePersistentSignature";
import { buildSignatureHtml } from "@/lib/exportHtml";
import { Editor } from "@/components/Editor";
import { SignatureCard } from "@/components/SignatureCard";
import { ExportPanel } from "@/components/ExportPanel";
import { SparkleIcon, ResetIcon } from "@/components/icons";

type Mode = "animated" | "email";

export default function Home() {
  const { data, update, updateSocial, reset, hydrated } = usePersistentSignature();
  const [playKey, setPlayKey] = useState(0);
  const [mode, setMode] = useState<Mode>("animated");
  const staticHtml = useMemo(() => buildSignatureHtml(data), [data]);

  return (
    <div className="app-bg min-h-screen">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between px-6 pt-7 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-[0_6px_18px_-6px_var(--color-accent)]">
            <SparkleIcon size={17} />
          </span>
          <div className="leading-tight">
            <h1 className="font-display text-[15px] font-bold tracking-tight text-[var(--color-fg)]">
              Signature Studio
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Animated, email-safe signatures
            </p>
          </div>
        </div>
        <span className="hidden rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)] sm:inline">
          POC · adatepe.dev
        </span>
      </header>

      <main className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 pb-16 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        {/* Editor */}
        <section className="scroll-thin rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-128px)] lg:overflow-auto">
          <Editor data={data} update={update} updateSocial={updateSocial} reset={reset} />
        </section>

        {/* Preview + export */}
        <section className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold text-[var(--color-fg)]">Live preview</h2>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5 text-[11px]">
                  <ModeButton active={mode === "animated"} onClick={() => setMode("animated")}>
                    Animated
                  </ModeButton>
                  <ModeButton active={mode === "email"} onClick={() => setMode("email")}>
                    Email
                  </ModeButton>
                </div>
                {mode === "animated" && (
                  <button
                    type="button"
                    onClick={() => setPlayKey((k) => k + 1)}
                    title="Replay animation"
                    className="group inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
                  >
                    <ResetIcon size={13} className="transition-transform duration-500 group-hover:-rotate-180" />
                    Replay
                  </button>
                )}
              </div>
            </div>

            <EmailWindow>
              {mode === "animated" ? (
                <div
                  key={`${playKey}-${hydrated}`}
                  className="motion-safe:[animation:rise_0.5s_var(--ease-family)_both]"
                >
                  <SignatureCard data={data} playKey={playKey} />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: staticHtml }} />
              )}
            </EmailWindow>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-fg-subtle)]">
              {mode === "animated"
                ? "Interactive preview. Animations are preview-only; recipients get the static version."
                : "Exactly the HTML pasted into your email client. No scripts, no animation, table-based, Outlook-safe."}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-[var(--color-fg)]">Export</h2>
            <ExportPanel data={data} />
          </div>
        </section>
      </main>
    </div>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 font-medium transition-colors duration-150 ${
        active ? "bg-[var(--color-panel-hover)] text-[var(--color-fg)]" : "text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

/** A faux email composer so the signature is seen in its real context. */
function EmailWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-[#f6f7f9] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-sans text-[12px] text-[#9aa0ad]">New Message</span>
      </div>
      <div className="px-6 py-5">
        <p className="font-sans text-[13px] leading-relaxed text-[#3a3f4a]">Hi there,</p>
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-[#9aa0ad]">
          Thanks for reaching out. Happy to jump on a call this week.
        </p>
        <p className="mt-3 font-sans text-[13px] text-[#3a3f4a]">Best,</p>
        <div className="my-4 h-px w-full bg-black/[0.06]" />
        {children}
      </div>
    </div>
  );
}
