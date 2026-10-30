import type { Metadata } from "next";
import { GuideHeader } from "@/components/GuideNav";
import { HallasanGuide } from "@/components/guides/HallasanGuide";
import { INDICO_GROUPS } from "@/data/indico-links";

export const metadata: Metadata = {
  title: "Hallasan trails",
  description: "Compare Hallasan trails: distance, climb, elevation profiles, reservations and March conditions.",
};

const hallasanIndico = INDICO_GROUPS.flatMap((g) => g.links).find((l) => l.label === "Hallasan Summit Hiking")!;

export default function HallasanPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="South Korea's highest peak · 1,947 m" title="Hiking Hallasan">
        Four main trails climb Hallasan, a shield volcano at the heart of the UNESCO World Heritage site. Two reach
        the summit crater (reservation required); the other two make a shorter, spectacular half day. Conference-specific
        hiking information is on{" "}
        <a href={hallasanIndico.href} target="_blank" rel="noreferrer" className="text-sea underline">Indico</a>.
      </GuideHeader>
      <div className="mt-8">
        <HallasanGuide />
      </div>
    </main>
  );
}
