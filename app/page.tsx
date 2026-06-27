"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TEMPLATES, renderTemplate } from "@/lib/templates";
import { DEFAULT_SIGNATURE } from "@/lib/defaults";
import { SparkleIcon, GithubIcon, CheckIcon, CopyIcon, CodeIcon, ExternalIcon, MailIcon } from "@/components/icons";

const REPO = "https://github.com/noluyorAbi/signature-studio";

/* Reveal-on-scroll: adds .is-in when the element enters the viewport. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app-bg min-h-screen overflow-x-hidden">
      {/* NAV */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200 ${
          scrolled ? "border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-[0_6px_18px_-6px_var(--color-accent)]">
              <SparkleIcon size={17} />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-[var(--color-fg)]">Signature Studio</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-[var(--color-fg-muted)] lg:flex">
            <a href="#features" className="transition-colors hover:text-[var(--color-fg)]">Features</a>
            <a href="#templates" className="transition-colors hover:text-[var(--color-fg)]">Templates</a>
            <a href="#how" className="transition-colors hover:text-[var(--color-fg)]">How it works</a>
            <a href="#compatibility" className="transition-colors hover:text-[var(--color-fg)]">Compatibility</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href={REPO} target="_blank" rel="noopener" className="hidden text-[13px] text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] sm:inline">GitHub</a>
            <Link
              href="/studio"
              prefetch
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_-12px_var(--color-accent)] transition-[transform,background-color] duration-150 hover:bg-[var(--color-accent-hot)] active:scale-[0.97]"
            >
              Build your signature
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto grid min-h-[92vh] max-w-[1200px] grid-cols-1 items-center gap-12 px-6 pt-28 pb-16 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-16">
        <div
          className="pointer-events-none absolute -z-0 right-[-10%] top-[-6%] h-[520px] w-[520px] rounded-full opacity-60 blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(77,125,255,0.22), transparent 60%)" }}
        />
        <div className="relative max-w-[36rem]">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--color-fg-subtle)]" style={{ animationDelay: "0ms" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" /> Free &middot; No signup &middot; Open source
          </div>
          <h1 className="rise mt-6 font-display text-[clamp(2.6rem,5.5vw,4.4rem)] font-extrabold leading-[1.03] tracking-[-0.02em] text-[var(--color-fg)]" style={{ animationDelay: "90ms" }}>
            Email signatures that{" "}
            <span style={{ backgroundImage: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hot))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>move</span>.
            <br />
            And never break.
          </h1>
          <p className="rise mt-5 max-w-[46ch] font-sans text-[17px] leading-relaxed text-[var(--color-fg-muted)]" style={{ animationDelay: "200ms" }}>
            Design a clean, animated signature right in your browser, then export email-safe HTML in
            one click. It tells you exactly what each client supports, so it lands right in Apple
            Mail, Gmail, and Outlook.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
            <Link
              href="/studio"
              prefetch
              className="group inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_var(--color-accent)] transition-[transform,background-color] duration-150 hover:bg-[var(--color-accent-hot)] active:scale-[0.98]"
            >
              Build your signature
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">-&gt;</span>
            </Link>
            <a href={REPO} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] px-5 py-3 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]">
              <GithubIcon size={16} /> View on GitHub
            </a>
          </div>
          <div className="rise mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-[var(--color-fg-subtle)]" style={{ animationDelay: "400ms" }}>
            {["No backend", "Email-safe HTML", "Open source, MIT"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><CheckIcon size={12} className="text-[var(--color-accent)]" /> {t}</span>
            ))}
          </div>
        </div>

        {/* showcase */}
        <div className="rise relative" style={{ animationDelay: "300ms" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/app.png" alt="" aria-hidden className="pointer-events-none absolute -right-6 -top-10 w-[115%] max-w-none rotate-[-3deg] rounded-2xl opacity-30 blur-[2px] [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]" />
          <div className="relative overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)] motion-safe:animate-[float_6s_ease-in-out_infinite]">
            <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-[#f6f7f9] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-sans text-[12px] text-[#9aa0ad]">New Message</span>
            </div>
            <div className="px-6 py-5">
              <p className="font-sans text-[13px] text-[#3a3f4a]">Hi there,</p>
              <p className="mt-1 font-sans text-[13px] text-[#9aa0ad]">Thanks for reaching out. Happy to jump on a call this week.</p>
              <p className="mt-3 font-sans text-[13px] text-[#3a3f4a]">Best,</p>
              <div className="my-4 h-px w-full bg-black/[0.06]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/signature-card.gif" alt="Animated email signature" className="w-full max-w-[460px]" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="border-y border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-5 font-mono text-[12px] text-[var(--color-fg-muted)]">
          {["No signup", "Runs in your browser", "Open source, MIT", "~3 KB export"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5"><CheckIcon size={12} className="text-[var(--color-accent)]" /> {t}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <Section id="features" eyebrow="What's inside" heading="Everything that makes it land">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 transition-colors duration-200 hover:border-[var(--color-border-strong)]">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/12 text-[var(--color-accent-hot)]">{f.icon}</div>
                <h3 className="font-display text-[15px] font-semibold text-[var(--color-fg)]">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* TEMPLATES GALLERY */}
      <Section id="templates" eyebrow="Templates" heading="Ten templates. Pick your starting point.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 60}>
              <Link href="/studio" prefetch className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] transition-colors duration-200 hover:border-[var(--color-border-strong)]">
                <div className="flex h-[150px] items-center justify-center overflow-hidden bg-white p-4">
                  <div
                    className="origin-center scale-[0.64]"
                    dangerouslySetInnerHTML={{ __html: renderTemplate({ ...DEFAULT_SIGNATURE, templateId: t.id }) }}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
                  <div>
                    <div className="font-display text-[13px] font-semibold text-[var(--color-fg)]">{t.name}</div>
                    <div className="text-[11px] text-[var(--color-fg-subtle)]">{t.oneLiner}</div>
                  </div>
                  <span className="text-[11px] font-medium text-[var(--color-accent-hot)] opacity-0 transition-opacity group-hover:opacity-100">Use -&gt;</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" eyebrow="How it works" heading="Three steps to a signature that renders everywhere.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
                <div className="font-mono text-[28px] font-bold text-[var(--color-accent)]/40">0{i + 1}</div>
                <h3 className="mt-3 font-display text-[15px] font-semibold text-[var(--color-fg)]">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* COMPATIBILITY */}
      <Section id="compatibility" eyebrow="Compatibility" heading="Honesty is the feature.">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
            {COMPAT.map((row, i) => (
              <div key={row.client} className={`grid grid-cols-[140px_1fr] gap-4 px-5 py-4 sm:grid-cols-[200px_1fr] ${i % 2 ? "bg-[var(--color-panel)]" : "bg-[var(--color-bg-elevated)]"}`}>
                <div className="font-display text-[14px] font-semibold text-[var(--color-fg)]">{row.client}</div>
                <div className="text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{row.behavior}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[12px] text-[var(--color-fg-subtle)]">No signup. No tracking pixels. Clean, table-based HTML built for deliverability.</p>
        </Reveal>
      </Section>

      {/* CLOSING CTA */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] px-8 py-16 text-center">
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(77,125,255,0.16), transparent 60%)" }} />
            <h2 className="relative font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tight text-[var(--color-fg)]">Build a signature your inbox respects.</h2>
            <p className="relative mx-auto mt-3 max-w-[44ch] text-[15px] text-[var(--color-fg-muted)]">Free, open source, no signup. From blank to copied in under a minute.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/studio" prefetch className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_44px_-16px_var(--color-accent)] transition-[transform,background-color] duration-150 hover:bg-[var(--color-accent-hot)] active:scale-[0.98]">
                Build your signature -&gt;
              </Link>
              <a href={REPO} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] px-6 py-3.5 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]">
                <GithubIcon size={16} /> Star on GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)] text-white"><SparkleIcon size={15} /></span>
            <span className="font-display text-[13px] font-semibold text-[var(--color-fg)]">Signature Studio</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-[var(--color-fg-muted)]">
            <Link href="/studio" prefetch className="transition-colors hover:text-[var(--color-fg)]">Builder</Link>
            <a href={REPO} target="_blank" rel="noopener" className="transition-colors hover:text-[var(--color-fg)]">GitHub</a>
            <a href="https://adatepe.dev" target="_blank" rel="noopener" className="transition-colors hover:text-[var(--color-fg)]">adatepe.dev</a>
            <span className="text-[var(--color-fg-subtle)]">MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, eyebrow, heading, children }: { id: string; eyebrow: string; heading: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-[1200px] scroll-mt-20 px-6 py-24">
      <Reveal>
        <div className="mb-12 max-w-[600px]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)]/80">{eyebrow}</div>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold tracking-tight text-[var(--color-fg)]">{heading}</h2>
        </div>
      </Reveal>
      {children}
    </section>
  );
}

const FEATURES = [
  { title: "Live editor", body: "Every field updates an instant preview. Sensible defaults, nothing blank.", icon: <SparkleIcon size={18} /> },
  { title: "Ten templates", body: "Distinct, professional layouts. Pick one and make it yours.", icon: <CodeIcon size={18} /> },
  { title: "Animated portrait", body: "A diagonal strip-reveal, drawn on canvas and encoded as a GIF.", icon: <SparkleIcon size={18} /> },
  { title: "Clickable card", body: "Every region a real link: icons, email, website. Apple Mail ready.", icon: <ExternalIcon size={18} /> },
  { title: "Email-safe export", body: "Table-based, inline-styled, Outlook-safe. Around three kilobytes.", icon: <MailIcon size={18} /> },
  { title: "Copy in one click", body: "Paste straight into Gmail, Outlook, or Apple Mail. No backend.", icon: <CopyIcon size={18} /> },
];

const STEPS = [
  { title: "Fill in your details", body: "Name, role, links, photo, accent colour. Watch the preview update live." },
  { title: "Pick a template", body: "Choose from ten layouts and tune the look until it feels like you." },
  { title: "Copy and install", body: "Copy the signature or a GIF, then paste it into your mail client." },
];

const COMPAT = [
  { client: "Apple Mail / iOS", behavior: "Embedded GIF and icons animate instantly, links stay clickable. No hosting needed." },
  { client: "Gmail", behavior: "The static signature is tiny and safe; host a GIF and the portrait animates there too." },
  { client: "Outlook desktop", behavior: "Shows the first frame, a clean static signature. Nothing breaks." },
];
