import type { Metadata } from "next";
import { Suspense } from "react";
import { GuideHeader } from "@/components/GuideNav";
import { PlannerApp } from "@/components/guides/PlannerApp";

export const metadata: Metadata = {
  title: "Free-time planner",
  description: "Tell us how much time you have and how you're getting around; get a plan from ICC Jeju and back.",
};

export default function PlanPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="Got a free afternoon?" title="Free-time planner">
        Pick how long you have and how you&apos;ll get around. The planner builds a loop from the venue and back,
        and switches to indoor options when the live forecast shows rain or strong wind.
      </GuideHeader>
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-border/40" />}>
          <PlannerApp />
        </Suspense>
      </div>
    </main>
  );
}
