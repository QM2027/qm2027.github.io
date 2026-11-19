import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgramApp } from "@/components/program/ProgramApp";

export const metadata: Metadata = {
  title: "Program Book",
  description: "Searchable, offline Quark Matter 2027 program book from Indico: talks, posters and your own schedule.",
};

export default function ProgramPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8 brand:max-w-none brand:px-0 brand:pt-0 sm:brand:pt-0 lg:brand:px-0">
      {/* Brand look: the title sits on a strip of the logo blue, full width and no taller than the
          title itself, so the working screen below keeps its room. The wrappers are display:
          contents elsewhere, leaving the other looks' layout as it was. */}
      <div className="contents brand:block brand:bg-brand-field brand:text-on-brand-field">
        <div className="contents brand:mx-auto brand:block brand:max-w-7xl brand:px-4 brand:pt-5 brand:pb-4 sm:brand:pt-8 sm:brand:pb-6 lg:brand:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Program Book</h1>
        </div>
      </div>
      <div className="mt-4 brand:mx-auto brand:mt-3 brand:max-w-7xl brand:px-4 sm:brand:mt-6 lg:brand:px-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-border/40" />}>
          <ProgramApp />
        </Suspense>
      </div>
    </main>
  );
}
