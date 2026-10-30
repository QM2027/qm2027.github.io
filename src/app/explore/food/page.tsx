import type { Metadata } from "next";
import Link from "next/link";
import { GuideHeader } from "@/components/GuideNav";
import { FoodGuide } from "@/components/guides/FoodGuide";

export const metadata: Metadata = {
  title: "Food guide",
  description: "Jeju dishes to try, filtered by diet, with Korean phrases to order safely.",
};

export default function FoodPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="Eat like a local" title="Jeju food guide">
        Black pork, hairtail, abalone and citrus are Jeju classics. Filter by diet, tick off what you&apos;ve tried
        (it&apos;s saved on this device), and use the phrase cards to order. Markets are on the{" "}
        <Link href="/explore/?cat=food" className="text-sea underline">map</Link>.
      </GuideHeader>
      <div className="mt-8">
        <FoodGuide />
      </div>
    </main>
  );
}
