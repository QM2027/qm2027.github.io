import type { Metadata } from "next";
import { Suspense } from "react";
import { VenueApp } from "@/components/venue/VenueApp";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Venue",
  description: "Interactive floor plan of ICC Jeju: session rooms, posters, coffee, restrooms and facilities.",
};

export default function VenuePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">{SITE.venue}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Venue floor plan</h1>
      <div className="mt-6">
        {/* At least a screen tall, so the footer stays out of view until the plan replaces this. */}
        <Suspense
          fallback={
            <div className="min-h-svh">
              <div className="aspect-[3/2] animate-pulse rounded-md bg-border/40" />
            </div>
          }
        >
          <VenueApp />
        </Suspense>
      </div>
    </main>
  );
}
