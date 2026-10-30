import type { Metadata } from "next";
import { GuideHeader } from "@/components/GuideNav";
import { PassportApp } from "@/components/guides/PassportApp";

export const metadata: Metadata = {
  title: "Jeju Passport",
  description: "Collect location stamps around Jeju during Quark Matter 2027 and share your badge.",
};

export default function PassportPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="Stamp tour" title="Jeju Passport">
        Visit the spots, tap “I&apos;m here” to collect a stamp, and unlock badges along the way. Your first stamp is
        waiting at the venue.
      </GuideHeader>
      <div className="mt-8">
        <PassportApp />
      </div>
    </main>
  );
}
