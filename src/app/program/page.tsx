import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgramApp } from "@/components/program/ProgramApp";

export const metadata: Metadata = {
  title: "Program",
  description: "Searchable, offline copy of the Quark Matter 2027 timetable from Indico, with a personal schedule.",
};

export default function ProgramPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Program</h1>
      <div className="mt-4">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-border/40" />}>
          <ProgramApp />
        </Suspense>
      </div>
    </main>
  );
}
