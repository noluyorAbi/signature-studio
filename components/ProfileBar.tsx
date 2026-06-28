"use client";

import { useState } from "react";
import type { Profile } from "@/lib/usePersistentSignature";
import { PlusIcon, CopyIcon } from "./icons";

type Props = {
  profiles: Profile[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function ProfileBar({ profiles, activeId, onSwitch, onAdd, onDuplicate, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(p: Profile) {
    setEditing(p.id);
    setDraft(p.name);
  }
  function commitEdit() {
    if (editing) onRename(editing, draft.trim() || "Untitled");
    setEditing(null);
  }

  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
      <div className="scroll-thin flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {profiles.map((p) => {
          const active = p.id === activeId;
          if (editing === p.id) {
            return (
              <input
                key={p.id}
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditing(null);
                }}
                className="w-28 shrink-0 rounded-lg border border-[var(--color-accent)] bg-[var(--color-bg-elevated)] px-2.5 py-1 text-[12px] text-[var(--color-fg)] outline-none"
              />
            );
          }
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSwitch(p.id)}
              onDoubleClick={() => startEdit(p)}
              title={active ? "Double-click to rename" : "Switch profile"}
              className={`group inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1 text-[12px] font-medium transition-colors duration-150 ${
                active ? "border-[var(--color-accent)] text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {p.name}
              {active && profiles.length > 1 && (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Delete profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  className="-mr-1 flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-fg)]"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => onDuplicate()} title="Duplicate profile" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]">
        <CopyIcon size={13} />
      </button>
      <button type="button" onClick={() => onAdd()} title="New profile" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]">
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
