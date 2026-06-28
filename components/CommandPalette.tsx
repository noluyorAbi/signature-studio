"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Command = { id: string; label: string; group: string; run: () => void };

/** A Cmd/Ctrl+K command launcher: fuzzy filter, arrow-key nav, Enter to run.
 *  Mounted only while open, so its state resets on each open. */
export function CommandPalette({ onClose, commands }: { onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => (c.label + " " + c.group).toLowerCase().includes(s));
  }, [q, commands]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, []);

  const run = (c: Command) => {
    c.run();
    onClose();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((x) => Math.min(filtered.length - 1, x + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((x) => Math.max(0, x - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true">
      <div className="cmdk-backdrop absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="cmdk-panel relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]"
        onKeyDown={onKey}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          placeholder="Type a command…"
          spellCheck={false}
          className="w-full border-b border-[var(--color-border)] bg-transparent px-4 py-3.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none"
        />
        <ul ref={listRef} className="scroll-thin max-h-[340px] overflow-y-auto p-1.5">
          {filtered.map((c, idx) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => run(c)}
                onMouseMove={() => setActive(idx)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-75 ${
                  idx === active ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-fg-muted)]"
                }`}
              >
                <span>{c.label}</span>
                <span className={`font-mono text-[10px] uppercase tracking-wider ${idx === active ? "text-white/70" : "text-[var(--color-fg-subtle)]"}`}>{c.group}</span>
              </button>
            </li>
          ))}
          {!filtered.length && <li className="px-3 py-6 text-center text-[13px] text-[var(--color-fg-subtle)]">No matching command</li>}
        </ul>
      </div>
    </div>
  );
}
