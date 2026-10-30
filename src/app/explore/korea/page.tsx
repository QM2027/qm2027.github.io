import type { Metadata } from "next";
import { GuideHeader } from "@/components/GuideNav";
import { KoreaTrips } from "@/components/guides/KoreaTrips";

export const metadata: Metadata = {
  title: "Beyond Jeju",
  description: "Combine Quark Matter 2027 with Seoul, Daejeon, Busan or Gyeongju, satellite meetings and your flight home.",
};

export default function KoreaPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="Before & after the conference" title="Beyond Jeju">
        Short domestic flights connect Jeju to the rest of Korea. Here is how to combine the conference with a
        satellite meeting, a few days in Seoul or the old capital Gyeongju, and the trip home.
      </GuideHeader>
      <div className="mt-8">
        <KoreaTrips />
      </div>
    </main>
  );
}
