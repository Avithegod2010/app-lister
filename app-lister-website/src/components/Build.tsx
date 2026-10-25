"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { BUILD_SCRIPT } from "@/lib/content";
import { REPO } from "@/lib/links";
import { useCopy } from "./shell";

type WatchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

function Block({
  label,
  lines,
}: {
  label: string;
  lines: { prompt?: string; text: string }[];
}) {
  const [copied, copy] = useCopy();
  const plain = lines.map((l) => l.text).join("\n");

  return (
    <div className="border border-paper/25">
      <div className="flex items-center justify-between gap-3 border-b border-paper/25 bg-paper/[0.06] px-3 py-2">
        <span className="label text-paper/70">{label}</span>
        <button
          type="button"
          onClick={() => copy(plain)}
          className="label inline-flex items-center gap-1.5 border border-paper/30 px-2 py-1 text-paper/70 transition-colors hover:border-stamp hover:bg-stamp hover:text-paper"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} strokeWidth={2.5} />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <div className="space-y-1.5 px-3 py-3">
        {lines.map((line, i) => (
          <p key={i} className="font-mono text-[13px] leading-relaxed">
            {line.prompt ? (
              <span className="mr-2 text-stamp">{line.prompt}</span>
            ) : null}
            <span className="text-paper/90">{line.text}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function WatchForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<WatchState>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // Static hosting: no server register exists, so hand the visitor to
    // GitHub's own release notifications — the same outcome, no middleman.
    setState({ kind: "loading" });
    try {
      window.open(
        "https://github.com/Avithegod2010/app-lister/releases.atom",
        "_blank",
        "noopener",
      );
      setState({
        kind: "done",
        message:
          "GitHub's release feed opened in a new tab — subscribe with any RSS reader, or tap Watch on the repository.",
      });
      setEmail("");
    } catch {
      setState({
        kind: "error",
        message: "Could not open the feed. Use Watch on the repository page.",
      });
    }
  };

  return (
    <form onSubmit={submit} className="mt-6">
      <label className="label block text-graphite" htmlFor="watch-email">
        RELEASE REGISTER — GET A NOTE WHEN A NEW APK LANDS
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="watch-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 border-2 border-ribbon bg-paper px-3 py-3 font-mono text-[13px] text-ribbon placeholder:text-graphite/60 focus:outline-none focus:ring-0 focus:border-stamp"
        />
        <button
          type="submit"
          disabled={state.kind === "loading"}
          className="label border-2 border-ribbon bg-ribbon px-5 py-3 text-paper transition-all hover:-translate-y-0.5 hover:border-stamp hover:bg-stamp disabled:opacity-50"
        >
          {state.kind === "loading" ? "WRITING…" : "ADD ME"}
        </button>
      </div>

      <p
        className={`label mt-2 min-h-[16px] ${
          state.kind === "error"
            ? "text-stamp"
            : state.kind === "done"
              ? "text-ink"
              : "text-graphite/70"
        }`}
        role="status"
        aria-live="polite"
      >
        {state.kind === "idle"
          ? "ONE ADDRESS · ONE PURPOSE · REMOVE IT ANY TIME"
          : state.kind === "loading"
            ? "WRITING TO REGISTER…"
            : state.message}
      </p>
    </form>
  );
}

export default function Build() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ribbon pb-2">
          <span className="label flex items-center gap-2 text-ink">
            <Terminal size={13} strokeWidth={2.5} /> BUILD SESSION
          </span>
          <span className="label text-graphite">ZSH · 80 COLS</span>
        </div>

        <div className="border-2 border-ribbon bg-ribbon p-3 shadow-[6px_6px_0_rgba(21,23,15,0.16)]">
          <div className="space-y-3">
            {BUILD_SCRIPT.map((block) => (
              <Block key={block.label} label={block.label} lines={block.lines} />
            ))}
          </div>
          <p className="mt-3 font-mono text-[12.5px] text-paper/55">
            <span className="text-stamp">$</span> _
            <span className="caret ml-0.5 inline-block">▊</span>
          </p>
        </div>

        <p className="label text-graphite">
          THE <span className="text-ink">preview</span> PROFILE IN eas.json PRODUCES
          AN INSTALLABLE APK · <span className="text-ink">production</span> PRODUCES
          AN AAB FOR THE PLAY STORE
        </p>
      </div>

      {/* side rail */}
      <div className="space-y-4">
        <div className="border-2 border-ribbon bg-bar/70 p-5">
          <span className="label text-stamp">NO PLAY STORE REQUIRED</span>
          <p className="mt-3 text-[15.5px] leading-relaxed text-graphite">
            Install the signed APK straight from the Releases page. Minimum
            Android 5.0 (Lollipop). One permission, read-only, used to build the
            list and nothing else.
          </p>
          <a
            href={REPO.releases}
            target="_blank"
            rel="noreferrer"
            className="label mt-4 inline-flex w-full items-center justify-center border-2 border-stamp bg-stamp px-4 py-3 text-paper transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(21,23,15,0.9)]"
          >
            ⬇ DOWNLOAD LATEST APK
          </a>
        </div>

        <div className="border-2 border-ribbon p-5">
          <span className="label text-ink">REPORT A FAULT</span>
          <p className="mt-3 text-[15px] leading-relaxed text-graphite">
            Two issues are open. Feature requests and pull requests are welcome —
            the repository accepts PRs from anyone.
          </p>
          <div className="mt-4 grid gap-2">
            <a
              href={REPO.issues}
              target="_blank"
              rel="noreferrer"
              className="label border border-ribbon/40 px-3 py-2.5 text-center text-ribbon transition-colors hover:bg-ribbon hover:text-paper"
            >
              OPEN AN ISSUE ↗
            </a>
            <a
              href={REPO.website}
              target="_blank"
              rel="noreferrer"
              className="label border border-ribbon/40 px-3 py-2.5 text-center text-ribbon transition-colors hover:bg-ribbon hover:text-paper"
            >
              PROJECT SITE ↗
            </a>
          </div>
        </div>

        <WatchForm />
      </div>
    </div>
  );
}
