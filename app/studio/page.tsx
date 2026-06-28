"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePersistentSignature } from "@/lib/usePersistentSignature";
import type { SignatureData } from "@/lib/types";
import { buildSignatureHtml } from "@/lib/exportHtml";
import { lintSignature, type LintLevel } from "@/lib/lint";
import { TEMPLATES } from "@/lib/templates";
import { PRESETS, applyPreset } from "@/lib/presets";
import { TemplateThumb } from "@/components/TemplateThumb";
import { Editor } from "@/components/Editor";
import { ExportPanel } from "@/components/ExportPanel";
import { ProfileBar } from "@/components/ProfileBar";
import { CommandPalette, type Command } from "@/components/CommandPalette";
import { SparkleIcon, ResetIcon } from "@/components/icons";

export default function Studio() {
  const { data, update, updateSocial, setData, reset, undo, redo, canUndo, canRedo, profiles, activeId, switchProfile, addProfile, duplicateProfile, renameProfile, deleteProfile } =
    usePersistentSignature();
  const html = useMemo(() => buildSignatureHtml(data), [data]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const commands = useMemo<Command[]>(() => {
    const c: Command[] = [
      { id: "undo", label: "Undo", group: "Edit", run: undo },
      { id: "redo", label: "Redo", group: "Edit", run: redo },
      { id: "reset", label: "Reset to defaults", group: "Edit", run: reset },
      { id: "toggle-portrait", label: `${data.showAvatar ? "Hide" : "Show"} portrait`, group: "Toggle", run: () => update("showAvatar", !data.showAvatar) },
      { id: "toggle-badge", label: `${data.showVerifiedBadge ? "Hide" : "Show"} verification badge`, group: "Toggle", run: () => update("showVerifiedBadge", !data.showVerifiedBadge) },
      { id: "new-profile", label: "New profile", group: "Profile", run: () => addProfile() },
      { id: "dup-profile", label: "Duplicate profile", group: "Profile", run: () => duplicateProfile() },
    ];
    TEMPLATES.forEach((t) => c.push({ id: "tpl-" + t.id, label: `Template: ${t.name}`, group: "Template", run: () => update("templateId", t.id) }));
    PRESETS.forEach((p) => c.push({ id: "preset-" + p.id, label: `Preset: ${p.name}`, group: "Preset", run: () => setData(applyPreset(data, p)) }));
    profiles.forEach((p) => p.id !== activeId && c.push({ id: "switch-" + p.id, label: `Switch to ${p.name}`, group: "Profile", run: () => switchProfile(p.id) }));
    return c;
  }, [data, profiles, activeId, undo, redo, reset, update, setData, addProfile, duplicateProfile, switchProfile]);

  return (
    <div className="app-bg min-h-screen">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between px-6 pt-7 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-[0_6px_18px_-6px_var(--color-accent)]">
            <SparkleIcon size={17} />
          </span>
          <div className="leading-tight">
            <h1 className="font-display text-[15px] font-bold tracking-tight text-[var(--color-fg)]">Signature Studio</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">Animated, email-safe signatures</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Cmd/Ctrl+Z)"
              className="px-2.5 py-1.5 text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-30"
            >
              <ResetIcon size={14} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Cmd/Ctrl+Shift+Z)"
              className="border-l border-[var(--color-border)] px-2.5 py-1.5 text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-30"
            >
              <ResetIcon size={14} className="-scale-x-100" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            title="Command palette (Cmd/Ctrl+K)"
            className="hidden items-center gap-1 rounded-lg border border-[var(--color-border)] px-2 py-1 font-mono text-[10px] text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg)] sm:inline-flex"
          >
            ⌘K
          </button>
          <Link href="/" className="hidden rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg)] sm:inline">
            Home
          </Link>
        </div>
      </header>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} commands={commands} />}

      <main className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 pb-16 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <section className="scroll-thin rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-128px)] lg:overflow-auto">
          <div className="mb-5">
            <ProfileBar
              profiles={profiles}
              activeId={activeId}
              onSwitch={switchProfile}
              onAdd={addProfile}
              onDuplicate={duplicateProfile}
              onRename={renameProfile}
              onDelete={deleteProfile}
            />
          </div>
          <Editor data={data} update={update} updateSocial={updateSocial} setData={setData} reset={reset} />
        </section>

        <section className="flex flex-col gap-6">
          {/* Template picker */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-[var(--color-fg)]">Template</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">{TEMPLATES.length} designs</span>
            </div>
            <div className="scroll-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
              {TEMPLATES.map((t) => {
                const active = data.templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update("templateId", t.id)}
                    title={t.name}
                    className={`group shrink-0 rounded-xl border p-1 transition-colors duration-150 ${
                      active ? "border-[var(--color-accent)]" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <div className="h-[74px] w-[188px] overflow-hidden rounded-lg">
                      <TemplateThumb data={data} templateId={t.id} pad={9} />
                    </div>
                    <div className={`px-1 pt-1.5 pb-0.5 text-left text-[11px] font-medium ${active ? "text-[var(--color-accent-hot)]" : "text-[var(--color-fg-muted)]"}`}>{t.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-[var(--color-fg)]">Live preview</h2>
            <EmailWindow>
              <div key={data.templateId} className="motion-safe:[animation:rise_0.4s_var(--ease-family)_both]" dangerouslySetInnerHTML={{ __html: html }} />
            </EmailWindow>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-fg-subtle)]">
              Exactly the HTML you copy: table-based, inline-styled, Outlook-safe. Animate the portrait in the Export panel.
            </p>
          </div>

          {/* Deliverability */}
          <LintPanel data={data} />

          {/* Export */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-[var(--color-fg)]">Export</h2>
            <ExportPanel data={data} />
          </div>
        </section>
      </main>
    </div>
  );
}

function LintPanel({ data }: { data: SignatureData }) {
  const { checks, bytes, gmailLimit } = useMemo(() => lintSignature(data), [data]);
  const pct = Math.min(100, Math.round((bytes / gmailLimit) * 100));
  const over = bytes > gmailLimit;
  const dot = (l: LintLevel) => (l === "error" ? "bg-red-500" : l === "warn" ? "bg-amber-400" : "bg-emerald-500");
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-[var(--color-fg)]">Deliverability</h2>
        <span className={`font-mono text-[11px] ${over ? "text-red-400" : "text-[var(--color-fg-subtle)]"}`}>{(bytes / 1024).toFixed(1)} KB / ~10 KB Gmail</span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: over ? "#ef4444" : pct > 80 ? "#f59e0b" : "var(--color-accent)" }} />
      </div>
      <ul className="flex flex-col gap-1.5">
        {checks.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--color-fg-muted)]">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot(c.level)}`} />
            {c.message}
          </li>
        ))}
      </ul>
    </div>
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
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-[#9aa0ad]">Thanks for reaching out. Happy to jump on a call this week.</p>
        <p className="mt-3 font-sans text-[13px] text-[#3a3f4a]">Best,</p>
        <div className="my-4 h-px w-full bg-black/[0.06]" />
        {children}
      </div>
    </div>
  );
}
