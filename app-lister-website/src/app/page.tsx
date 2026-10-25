import QRCode from "qrcode";
import Cover from "@/components/Cover";
import Download from "@/components/Download";
import Manifest from "@/components/Manifest";
import Brief from "@/components/Brief";
import Screens from "@/components/Screens";
import Spec from "@/components/Spec";
import Telemetry from "@/components/Telemetry";
import Build from "@/components/Build";
import Footer from "@/components/Footer";
import { Dock, Rail, Section, TopBar } from "@/components/shell";
import { Marquee, ScrollProgress } from "@/components/motion";
import Plate from "@/components/Plate";
import { getHistory, getRepoFacts } from "@/lib/github";
import { getLatestApk } from "@/lib/release";
import { stamp } from "@/lib/format";
import { REPO, TICKER } from "@/lib/links";

async function buildQr(): Promise<string> {
  try {
    return await QRCode.toString(REPO.website, {
      type: "svg",
      margin: 1,
      width: 220,
      errorCorrectionLevel: "M",
      color: { dark: "#15170f", light: "#f5f2e9" },
    });
  } catch {
    return "";
  }
}

export default async function HomePage() {
  const facts = await getRepoFacts();
  const history = await getHistory();
  const asset = await getLatestApk();
  const qrSvg = await buildQr();

  return (
    <>
      <ScrollProgress />
      <Rail />
      <Dock size={asset.size} />

      <div className="lg:pl-16">
        <TopBar />

        <main>
          <Cover facts={facts} apkSize={asset.size} tag={asset.tag} />

          <Marquee items={TICKER} />

          <Section
            id="download"
            index="02"
            kicker="DISPATCH"
            title="GET THE APK"
            lede={
              <>
                The real <span className="font-mono text-ink">{asset.name}</span>{" "}
                from release {asset.tag}, streamed straight through this page —
                no redirect, no sign-in, no store. Watch the bytes arrive.
              </>
            }
          >
            <Download asset={asset} qrSvg={qrSvg} initialLocal={asset.githubDownloads} />
          </Section>

          <Plate />

          <Section
            id="manifest"
            index="03"
            kicker="MANIFEST"
            title="THE LISTING"
            lede={
              <>
                Every path on <span className="text-ink">main</span> at commit{" "}
                <span className="font-mono text-ink">{REPO.head}</span>, with byte
                sizes read from the Git tree. Two screens and one Kotlin module
                hold nearly all of the code.
              </>
            }
          >
            <Manifest />
          </Section>

          <Section
            id="brief"
            index="04"
            kicker="PURPOSE"
            title="THE BRIEF"
            lede="Taken from the repository’s own README: what the app does, and what it deliberately refuses to do."
          >
            <Brief />
          </Section>

          <Section
            id="screens"
            index="05"
            kicker="PLATES"
            title="SCREENS"
            lede="Three plates from docs/screenshots — the list in light, the list in AMOLED black, and the details sheet."
          >
            <Screens />
          </Section>

          <Section
            id="spec"
            index="06"
            kicker="SPEC"
            title="SPECIFICATION"
            lede="The stack end to end, from the Expo toolchain down to the Android PackageManager query."
          >
            <Spec />
          </Section>

          <Section
            id="telemetry"
            index="07"
            kicker="REGISTER"
            title="TELEMETRY"
            tone="dark"
            lede="Live figures pulled from the public GitHub API and written into this site’s own Postgres register — a reading at most every ten minutes, so the sparkline grows a little on every visit."
            backdrop={
              <>
                <img
                  src="images/printer.jpg"
                  alt=""
                  className="h-full w-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ribbon via-ribbon/92 to-ribbon/78" />
                <div className="absolute inset-0 bg-ribbon/45" />
              </>
            }
          >
            <Telemetry initialFacts={facts} initialHistory={history} />
          </Section>

          <Marquee items={TICKER} tone="dark" speed={46} />

          <Section
            id="build"
            index="08"
            kicker="BUILD"
            title="BUILD IT YOURSELF"
            lede="Three exits from the repository: clone and install, a cloud EAS build, or a fully local Gradle assemble."
          >
            <Build />
          </Section>
        </main>

        <Footer pushedAt={facts.pushedAt ? stamp(facts.pushedAt) : ""} />
      </div>
    </>
  );
}
