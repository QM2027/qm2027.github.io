import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/PageTitle";
import { VenueApp } from "@/components/venue/VenueApp";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Venue",
  description: "Interactive floor plan of ICC Jeju: session rooms, posters, coffee, restrooms and facilities.",
};

export default function VenuePage() {
  return (
    // Brand look (?look=brand): the page opens on the logo's blue across the window, holding the
    // title and, from VenueApp, the floor tabs; main drops its padding so the field can span it.
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8 brand:max-w-none brand:px-0 brand:pt-0 brand:pb-16 sm:brand:pt-0 lg:brand:px-0 lg:brand:pb-24">
      <header className="hidden bg-brand-field text-on-brand-field brand:block">
        {/* Columns as VenueApp's below, so the hint lines up with the side panels. */}
        <div className="mx-auto max-w-7xl gap-x-12 px-4 pt-12 pb-8 sm:pt-16 lg:grid lg:grid-cols-[1fr_340px] lg:items-end lg:px-8 lg:pt-20 lg:pb-10">
          <div>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl">Venue floor plan</h1>
            <p className="mt-3 text-lg text-brand-field-muted">{SITE.venue}</p>
          </div>
          <p className="mt-6 text-brand-field-muted lg:mt-0">Tap a room or marker for details.</p>
        </div>
      </header>
      <PageTitle kicker={SITE.venue} title="Venue floor plan" className="brand:hidden" />
      <div className="mt-6 brand:mt-0">
        {/* At least a screen tall, so the footer stays out of view until the plan replaces this. */}
        <Suspense
          fallback={
            <div className="min-h-svh">
              {/* Brand: the field's floor-tab strip, at the height VenueApp gives it. */}
              <div className="hidden h-14 bg-brand-field brand:block" />
              <div className="brand:mx-auto brand:mt-8 brand:max-w-7xl brand:px-4 lg:brand:px-8">
                <div className="aspect-[3/2] animate-pulse rounded-md bg-border/40 brand:rounded-none" />
              </div>
            </div>
          }
        >
          <VenueApp />
        </Suspense>
      </div>
    </main>
  );
}
