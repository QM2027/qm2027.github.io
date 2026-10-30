import type { Metadata } from "next";
import { GuideHeader } from "@/components/GuideNav";
import { SeasonTimeline } from "@/components/guides/SeasonTimeline";

export const metadata: Metadata = {
  title: "March in Jeju",
  description: "Canola, cherry blossoms, festivals and citrus: what's in season during Quark Matter 2027.",
};

export default function SeasonPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="Seasonal spotlight" title="March in Jeju">
        Late March is when Jeju turns yellow with canola and the king cherry trees begin to open. Here is what
        overlaps the conference week.
      </GuideHeader>
      <div className="mt-8">
        <SeasonTimeline />
      </div>
    </main>
  );
}
