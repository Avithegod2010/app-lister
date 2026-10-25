"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownToLine } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NAV, REPO, REPO_URL_FALLBACK } from "@/lib/links";

/* ------------------------------------------------------------------ rail */

export function Rail() {
  return (
    <div
      aria-hidden
      className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-stretch border-r border-ribbon/20 bg-paper-deep lg:flex"
    >
      <div className="sprocket absolute inset-y-0 left-1.5 w-4" />
      <div className="mt-32 ml-7 flex-1">
        <span className="label block whitespace-nowrap text-ink/70 [writing-mode:vertical-rl]">
          AVITHEGOD2010&nbsp;/&nbsp;APP-LISTER · MAIN
        </span>
      </div>
      <div className="sprocket absolute inset-y-0 left-1.5 w-4" />
      <span className="label mb-6 ml-7 block text-stamp [writing-mode:vertical-rl]">
        MIT
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ nav */

export function TopBar() {
  const [active, setActive] = useState("cover");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.3, 0.6] },
    );

    NAV.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-paper/95 backdrop-blur-[2px] transition-shadow ${
        scrolled ? "border-ribbon/25 shadow-[0_1px_0_rgba(21,23,15,0.18)]" : "border-ribbon/15"
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-2 sm:px-8">
        <a
          href="#cover"
          className="label flex shrink-0 items-center gap-2 text-ribbon transition-colors hover:text-stamp"
        >
          <span className="inline-block size-2 rounded-full bg-stamp" />
          <span className="hidden sm:inline">AVITHEGOD2010 /</span>
          <span className="font-bold">APP-LISTER</span>
        </a>

        <nav
          aria-label="Sheet navigation"
          className="thin-scroll -mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1"
        >
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`label shrink-0 border px-2.5 py-1.5 transition-colors ${
                active === item.id
                  ? "border-ribbon bg-ribbon text-paper"
                  : "border-transparent text-graphite hover:border-ribbon/30 hover:text-ribbon"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={REPO.releases}
          download
          className="label group shrink-0 border border-stamp bg-stamp px-3 py-1.5 text-paper transition-colors hover:border-ribbon hover:bg-ribbon"
        >
          <span className="inline-block transition-transform group-hover:translate-y-0.5">
            ↓
          </span>{" "}
          APK
        </a>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ float dock */

export function Dock({ size }: { size: number }) {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      // Visible once past the cover, hidden again over the dispatch sheet.
      const el = document.getElementById("download");
      const inDispatch =
        el !== null &&
        y + window.innerHeight > el.offsetTop &&
        y < el.offsetTop + el.offsetHeight;
      setShow(y > window.innerHeight * 0.9 && !inDispatch && y < max - 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.a
          href={REPO.releases}
          download
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="label fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 border-2 border-stamp bg-stamp px-4 py-3.5 text-paper shadow-[5px_5px_0_rgba(21,23,15,0.55)] transition-colors hover:border-ribbon hover:bg-ribbon"
        >
          <motion.span
            animate={reduce ? undefined : { y: [0, 3, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ArrowDownToLine size={15} strokeWidth={2.6} />
          </motion.span>
          GET APK
          <span className="tnum border-l border-paper/40 pl-2.5 text-paper/75">
            {(size / (1024 * 1024)).toFixed(0)} MB
          </span>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------- section */

export function Section({
  id,
  index,
  kicker,
  title,
  lede,
  children,
  tone = "paper",
  backdrop,
}: {
  id: string;
  index: string;
  kicker: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
  tone?: "paper" | "dark";
  backdrop?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const dark = tone === "dark";

  return (
    <section
      id={id}
      className={`relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-8 sm:py-24 ${
        dark ? "bg-ribbon" : ""
      }`}
    >
      {backdrop ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {backdrop}
        </div>
      ) : null}
      <div className="relative mx-auto max-w-[1500px] lg:grid lg:grid-cols-[5rem_minmax(0,1fr)] lg:gap-10">
        <div className="hidden lg:block">
          <div className="sticky top-28 text-right">
            <span
              className={`display block text-4xl ${dark ? "text-stamp" : "text-stamp"}`}
            >
              {index}
            </span>
            <span
              className={`label mt-3 block [writing-mode:vertical-rl] ml-auto ${
                dark ? "text-paper/45" : "text-graphite/70"
              }`}
            >
              {kicker}
            </span>
          </div>
        </div>

        <div>
          <motion.header
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
            className="mb-8"
          >
            <div
              className={`flex items-baseline gap-4 border-b-2 pb-3 ${
                dark ? "border-paper/70" : "border-ribbon"
              }`}
            >
              <span className="label text-stamp lg:hidden">{index}</span>
              <h2
                className={`display impact text-[clamp(1.9rem,4.6vw,3.5rem)] ${
                  dark ? "text-paper" : "text-ribbon"
                }`}
              >
                {title}
              </h2>
              <span
                className={`label ml-auto hidden shrink-0 sm:block ${
                  dark ? "text-paper/50" : "text-graphite"
                }`}
              >
                {kicker}
              </span>
            </div>
            {lede ? (
              <p
                className={`mt-4 max-w-[62ch] text-[17px] leading-relaxed ${
                  dark ? "text-paper/75" : "text-graphite"
                }`}
              >
                {lede}
              </p>
            ) : null}
          </motion.header>

          {children}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ small bits */

export function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="label border border-ribbon/30 bg-paper-deep px-2 py-1 text-ink"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    };
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      done();
    }
  };
  return [copied, copy];
}

export { REPO_URL_FALLBACK };
