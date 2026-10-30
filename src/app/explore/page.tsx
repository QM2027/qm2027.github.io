import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreApp } from "@/components/map/ExploreApp";

export const metadata: Metadata = {
  title: "Explore Jeju",
  description: "Interactive map of sights, food, transport and suggested courses around ICC Jeju.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex-1 animate-pulse bg-border/30" />}>
      <ExploreApp />
    </Suspense>
  );
}
