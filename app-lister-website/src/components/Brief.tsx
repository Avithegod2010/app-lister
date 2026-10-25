"use client";

import {
  BarChart3,
  ClipboardList,
  Grid2x2,
  Heading,
  Info,
  Palette,
  Rocket,
  Save,
  Search,
  Share2,
  SortAsc,
  Tag,
  Wand2,
} from "lucide-react";
import { FEATURES } from "@/lib/content";

const ICONS: Record<string, typeof ClipboardList> = {
  list: ClipboardList,
  palette: Palette,
  search: Search,
  tag: Tag,
  sort: SortAsc,
  heading: Heading,
  grid: Grid2x2,
  info: Info,
  chart: BarChart3,
  rocket: Rocket,
  share: Share2,
  wand: Wand2,
  save: Save,
};

const PARAGRAPHS = [
  {
    n: "01",
    text: (
      <>
        App Lister does <strong className="font-semibold text-ribbon">exactly one thing</strong>:
        it shows you every app installed on your Android phone — user apps and
        system apps — in one fast, fluid, gorgeous list. Inspired by the{" "}
        <em>List apps</em> page of Inure App Manager, but stripped down to its
        purest form: no managers, no killers, no analytics, no clutter.
      </>
    ),
  },
  {
    n: "02",
    text: (
      <>
        Grab the latest APK from the Releases page and install it on your phone —
        no Play Store needed. Minimum Android <span className="tnum">5.0</span>{" "}
        (Lollipop). The only permission it asks for is{" "}
        <code className="bg-bar px-1 font-mono text-[13px] text-ink">
          QUERY_ALL_PACKAGES
        </code>
        , required to read the list of installed apps and used for nothing else.
      </>
    ),
  },
  {
    n: "03",
    text: (
      <>
        Exported lists go wherever you send them — share sheet or clipboard, as
        text, CSV or JSON. Everything else stays on the handset, including the
        icons it caches to disk while scanning.
      </>
    ),
  },
];

export default function Brief() {
  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* editorial measure */}
        <div className="lg:col-span-7">
          <div className="space-y-6">
            {PARAGRAPHS.map((p) => (
              <div key={p.n} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3">
                <span className="tnum pt-1 font-mono text-[11px] font-semibold text-stamp">
                  {p.n}
                </span>
                <p className="text-[17px] leading-[1.65] text-graphite">{p.text}</p>
              </div>
            ))}
          </div>

          <figure className="mt-8 border-l-4 border-stamp bg-bar/60 px-5 py-4">
            <blockquote className="font-display text-[clamp(1.35rem,2.6vw,2rem)] font-bold uppercase leading-[1.05] tracking-tight text-ribbon">
              No managers, no killers, no analytics, no clutter.
            </blockquote>
            <figcaption className="label mt-2 text-graphite">
              README · INTRODUCTION
            </figcaption>
          </figure>
        </div>

        {/* privacy statement */}
        <aside className="lg:col-span-5">
          <div className="border-2 border-ribbon">
            <div className="flex items-center justify-between bg-ink px-4 py-2.5">
              <span className="label text-paper">PRIVACY STATEMENT</span>
              <span className="label text-paper/60">FORM P-1</span>
            </div>
            <div className="bg-paper-deep/60 p-5">
              <p className="text-[15.5px] leading-relaxed text-graphite">
                App Lister works entirely offline. It contains{" "}
                <strong className="font-semibold text-ribbon">
                  no ads, no trackers, no analytics, and no network access of any
                  kind
                </strong>
                . The only permission it holds is used to read the list of
                installed apps, which never leaves the device.
              </p>

              <dl className="mt-5 space-y-0 border-t border-ribbon/25">
                {[
                  ["NETWORK CALLS", "0"],
                  ["THIRD-PARTY SDKS", "0"],
                  ["PERMISSIONS", "1"],
                  ["ANALYTICS", "NONE"],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className={`flex items-baseline justify-between border-b border-ribbon/15 py-2 ${
                      i % 2 ? "bg-bar/60" : ""
                    }`}
                  >
                    <dt className="label text-graphite">{k}</dt>
                    <dd className="tnum font-mono text-[13px] font-semibold text-stamp">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <a
                href="https://github.com/Avithegod2010/app-lister/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="label mt-5 inline-flex w-full items-center justify-center gap-2 border-2 border-ribbon bg-ribbon px-4 py-3 text-paper transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(196,54,28,0.9)]"
              >
                ⬇ LATEST APK
              </a>
              <p className="label mt-2 text-center text-graphite">
                SIGNED BUILD · NO PLAY STORE
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------------------------------------------- feature index */}
      <div className="mt-14">
        <div className="mb-1 flex items-baseline justify-between border-b-2 border-ribbon pb-2">
          <span className="label text-ink">FEATURE INDEX</span>
          <span className="label text-graphite">
            {FEATURES.length} ITEMS · README TABLE
          </span>
        </div>

        <ul className="grid sm:grid-cols-2 sm:gap-x-10">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[f.icon] ?? ClipboardList;
            return (
              <li
                key={f.title}
                className="group flex items-start gap-4 border-b border-ribbon/15 py-4 transition-colors hover:bg-bar/50"
              >
                <span className="tnum w-7 shrink-0 pt-1 font-mono text-[11px] text-graphite/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 shrink-0 text-ink transition-colors group-hover:text-stamp">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[17px] font-bold uppercase tracking-tight text-ribbon">
                    {f.title}
                  </span>
                  <span className="mt-0.5 block text-[14.5px] leading-snug text-graphite">
                    {f.detail}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
