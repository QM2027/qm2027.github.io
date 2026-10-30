import type { Metadata } from "next";
import { GuideHeader } from "@/components/GuideNav";
import { RunGuide } from "@/components/guides/RunGuide";

export const metadata: Metadata = {
  title: "Morning runs",
  description: "Running and walking routes from ICC Jeju along the Jungmun coast, with GPX downloads.",
};

export default function RunPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="Before the first plenary" title="Morning runs & walks">
        The Olle coastal trail runs right past the venue. Pick a route, load the GPX on your watch, and be back
        in time for coffee.
      </GuideHeader>
      <div className="mt-8">
        <RunGuide />
      </div>
    </main>
  );
}
