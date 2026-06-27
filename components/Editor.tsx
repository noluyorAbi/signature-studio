"use client";

import { SOCIAL_ORDER, SOCIAL_LABELS, type SignatureData, type SocialKey } from "@/lib/types";
import { deriveAccent } from "@/lib/accent";
import { ResetIcon } from "./icons";

const ACCENTS = ["#4d7dff", "#6e56cf", "#2dd4bf", "#f97316", "#ec4899", "#22c55e"];

type EditorProps = {
  data: SignatureData;
  update: <K extends keyof SignatureData>(key: K, value: SignatureData[K]) => void;
  updateSocial: (key: SocialKey, value: string) => void;
  reset: () => void;
};

export function Editor({ data, update, updateSocial, reset }: EditorProps) {
  return (
    <div className="flex flex-col gap-7">
      <Section title="Identity" hint="Who you are">
        <Field label="Full name" value={data.name} onChange={(v) => update("name", v)} placeholder="Alperen Adatepe" />
        <Field label="Title" value={data.title} onChange={(v) => update("title", v)} placeholder="Full-Stack Developer" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company" value={data.company} onChange={(v) => update("company", v)} placeholder="optional" />
          <Field label="Brand wordmark" value={data.brand} onChange={(v) => update("brand", v)} placeholder="adatepe.dev" />
        </div>
        <Field label="Tagline" value={data.tagline} onChange={(v) => update("tagline", v)} placeholder="A short line about your work" />
      </Section>

      <Section title="Contact" hint="How to reach you">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" value={data.email} onChange={(v) => update("email", v)} placeholder="you@domain.com" type="email" />
          <Field label="Phone" value={data.phone} onChange={(v) => update("phone", v)} placeholder="optional" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Website" value={data.website} onChange={(v) => update("website", v)} placeholder="adatepe.dev" />
          <Field label="Location" value={data.location} onChange={(v) => update("location", v)} placeholder="optional" />
        </div>
      </Section>

      <Section title="Links" hint="Only filled links appear">
        {SOCIAL_ORDER.map((k) => (
          <Field
            key={k}
            label={SOCIAL_LABELS[k]}
            value={data.socials[k]}
            onChange={(v) => updateSocial(k, v)}
            placeholder={`https://… (${SOCIAL_LABELS[k].toLowerCase()})`}
          />
        ))}
      </Section>

      <Section title="Appearance" hint="Look and feel">
        <div>
          <FieldLabel>Accent</FieldLabel>
          <div className="flex items-center gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Accent ${c}`}
                onClick={() => update("accentColor", c)}
                className="h-7 w-7 rounded-full ring-offset-2 ring-offset-[var(--color-panel)] transition-transform duration-150 hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: c,
                  boxShadow: data.accentColor.toLowerCase() === c ? `0 0 0 2px var(--color-panel), 0 0 0 4px ${c}` : "none",
                }}
              />
            ))}
            <label className="relative ml-1 h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-[var(--color-border-strong)]">
              <span
                className="block h-full w-full"
                style={{ background: "conic-gradient(from 0deg, #ff5d5d, #ffd166, #5bff9b, #4d7dff, #b06bff, #ff5d5d)" }}
              />
              <input
                type="color"
                value={data.accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Custom accent colour"
              />
            </label>
          </div>
          {deriveAccent(data.accentColor).warning && (
            <p className="mt-2 text-[11px] leading-relaxed text-amber-400/90">
              {deriveAccent(data.accentColor).warning}
            </p>
          )}
        </div>

        <Field
          label="Profile photo URL"
          value={data.photoUrl}
          onChange={(v) => update("photoUrl", v)}
          placeholder="https://…/photo.jpg (square, hosted)"
          hint="Empty shows a monogram tile"
        />

        <Field
          label="Animated photo URL (GIF)"
          value={data.animatedPhotoUrl}
          onChange={(v) => update("animatedPhotoUrl", v)}
          placeholder="https://…/portrait.gif (optional)"
          hint="A hosted GIF animates the portrait in email. Generate one in the Export panel."
        />

        <div className="flex flex-col gap-1">
          <Toggle label="Show portrait" checked={data.showAvatar} onChange={(v) => update("showAvatar", v)} />
          <Toggle label="Verification badge" checked={data.showVerifiedBadge} onChange={(v) => update("showVerifiedBadge", v)} />
        </div>
      </Section>

      <button
        type="button"
        onClick={reset}
        className="group inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-fg-muted)] transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
      >
        <ResetIcon size={15} className="transition-transform duration-300 group-hover:-rotate-180" />
        Reset to defaults
      </button>
    </div>
  );
}

/* ---- primitives ---- */

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
        <h2 className="font-display text-sm font-semibold tracking-wide text-[var(--color-fg)]">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">{hint}</span>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">{children}</label>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]"
      />
      {hint && <p className="mt-1 text-[11px] text-[var(--color-fg-subtle)]">{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-lg px-1 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
    >
      <span>{label}</span>
      <span
        className="relative h-5 w-9 rounded-full transition-colors duration-200"
        style={{ backgroundColor: checked ? "var(--color-accent)" : "var(--color-border-strong)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </span>
    </button>
  );
}
