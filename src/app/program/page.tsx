import type { Metadata } from "next";
import { INDICO_GROUPS, INDICO_TIMETABLE } from "@/data/indico-links";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Program" };

// Placeholder until the Indico timetable sync lands; links out to Indico for now.
export default function ProgramPage() {
  const program = INDICO_GROUPS.find((g) => g.title === "Abstracts & Program")!;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Program</h1>
      <p className="mt-3 text-muted">
        An offline program with a personal schedule is coming. For now, the timetable is on Indico.
      </p>
      <a
        href={INDICO_TIMETABLE}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-sea px-6 font-semibold text-on-sea"
      >
        Open timetable on Indico <Icon name="external" className="size-4" />
      </a>
      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
        {program.links.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between px-4">
              {l.label} <Icon name="external" className="size-4 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
