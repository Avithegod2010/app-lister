import { REPO } from "@/lib/links";

const LINKS: [string, string][] = [
  ["REPOSITORY", REPO.url],
  ["RELEASES", REPO.releases],
  ["ISSUES", REPO.issues],
  ["PROJECT SITE", REPO.website],
  ["INURE (INSPIRATION)", "https://github.com/Hamza417/Inure"],
  ["EXPO", "https://expo.dev"],
];

export default function Footer({ pushedAt }: { pushedAt: string }) {
  return (
    <footer className="px-4 pb-14 sm:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="rule-double" />

        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="label mb-3 text-stamp">COLOPHON</p>
            <p className="text-[14.5px] leading-relaxed text-graphite">
              Set in IBM Plex Sans Condensed, IBM Plex Sans and IBM Plex Mono.
              Printed on continuous-form stock, 132 columns, in the manner of a
              line-printer run.
            </p>
          </div>

          <div>
            <p className="label mb-3 text-stamp">DOCUMENT CONTROL</p>
            <ul className="space-y-1 font-mono text-[13px] text-graphite">
              <li>FORM No. 1432005543</li>
              <li>BRANCH main · HEAD 14ee7d4</li>
              <li>LICENCE MIT · © 2026 Avithegod2010</li>
              <li>LAST PUSH {pushedAt || "—"}</li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label mb-3 text-stamp">INDEX</p>
            <ul className="grid grid-cols-2 gap-x-6">
              {LINKS.map(([label, href]) => (
                <li key={label} className="border-b border-ribbon/15 py-2">
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="label flex items-center justify-between text-ribbon transition-colors hover:text-stamp"
                  >
                    {label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-ribbon/25 pt-5 sm:flex-row sm:justify-between">
          <span className="label text-graphite">
            FREE TO USE, STUDY, MODIFY AND SHARE
          </span>
          <span className="label text-ink">— SHEET 8 OF 8 —</span>
          <span className="label text-graphite">
            NO TRACKERS ON THIS PAGE EITHER
          </span>
        </div>
      </div>
    </footer>
  );
}
