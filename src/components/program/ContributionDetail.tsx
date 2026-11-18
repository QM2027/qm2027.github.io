"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { INDICO_TIMETABLE } from "@/data/indico-links";
import { downloadIcs } from "@/lib/ics";
import { clock, dayLabel, dayOf, type Abstracts, type Contribution, type Session } from "@/lib/program";
import { roomOf, shareLink, talkIcs, venueRoomId } from "./shared";
import { TeX } from "./TeX";

const AUTHORS_SHOWN = 6;

function Panel({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end bg-black/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-y-auto bg-background p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:max-w-lg"
      >
        {children}
      </aside>
    </div>
  );
}

const btn = "flex min-h-11 items-center gap-1 rounded-md border border-border px-4 text-sm";

type Props = {
  talk: Contribution;
  session?: Session;
  details?: Abstracts[string];
  abstractsLoaded: boolean;
  starred: boolean;
  changed: boolean;
  onStar: () => void;
  onClose: () => void;
};

export function ContributionDetail({ talk, session, details, abstractsLoaded, starred, changed, onStar, onClose }: Props) {
  const [allAuthors, setAllAuthors] = useState(false);
  const [shared, setShared] = useState<string>();
  const room = roomOf(talk, session);
  const venueId = venueRoomId(room, talk.poster);
  const authors = details?.authors ?? [];

  async function share() {
    const result = await shareLink(talk.title, `${location.origin}${location.pathname}?talk=${talk.id}`);
    setShared(result === "copied" ? "Link copied" : result === "shared" ? "Shared" : undefined);
  }

  return (
    <Panel label={talk.title} onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm tabular-nums text-muted">
          {talk.poster ? `Poster${talk.board ? ` ${talk.board}` : ""}` : "Talk"} · {dayLabel(dayOf(talk.start))} · {clock(talk.start)}–
          {clock(talk.end)}
          {room && ` · ${room}`}
        </p>
        <button onClick={onClose} aria-label="Close" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
          <Icon name="close" />
        </button>
      </div>
      <h2 className="mt-2 text-xl font-semibold leading-snug">
        <TeX text={talk.title} />
      </h2>
      <p className="mt-1 text-sm text-muted">
        {[session?.title, talk.track, talk.friendlyId && `#${talk.friendlyId}`].filter(Boolean).join(" · ")}
      </p>
      {talk.poster && <p className="mt-1 text-sm text-muted">Up all week; the presenter is at the board during the session.</p>}
      {changed && <p className="mt-3 rounded-md bg-tangerine/10 p-3 text-sm text-tangerine">This item&apos;s time, room or speaker changed recently.</p>}

      {talk.speakers.length > 0 && (
        <ul className="mt-4 space-y-1">
          {talk.speakers.map((s) => (
            <li key={s.name} className="text-sm">
              <b>{s.name}</b>
              {s.affiliation && <span className="text-muted"> · {s.affiliation}</span>}
            </li>
          ))}
        </ul>
      )}
      {authors.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          With {(allAuthors ? authors : authors.slice(0, AUTHORS_SHOWN)).join(", ")}
          {!allAuthors && authors.length > AUTHORS_SHOWN && (
            <>
              {" "}
              <button onClick={() => setAllAuthors(true)} className="text-sea underline">
                and {authors.length - AUTHORS_SHOWN} more
              </button>
            </>
          )}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onStar} aria-pressed={starred} className={`${btn} aria-pressed:border-tangerine aria-pressed:text-tangerine`}>
          {starred ? "★ In my schedule" : "☆ Add to my schedule"}
        </button>
        {!talk.poster && (
          <button onClick={() => downloadIcs(`qm2027-${talk.id}.ics`, [talkIcs(talk, session)])} className={btn}>
            Add to calendar
          </button>
        )}
        <Link href={venueId ? `/venue/?room=${venueId}` : "/venue/"} className={btn}>
          {venueId ? "Show on floor plan" : "Floor plan"}
        </Link>
        {talk.url && (
          <a href={talk.url} target="_blank" rel="noreferrer" className={btn}>
            Indico <Icon name="external" className="size-4" />
          </a>
        )}
        <button onClick={share} className={btn}>
          {shared ?? "Share"}
        </button>
      </div>

      {details?.abstract ? (
        <div className="mt-5 leading-relaxed whitespace-pre-line">
          <TeX text={details.abstract} />
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">{abstractsLoaded ? "No abstract on Indico." : "Loading abstract…"}</p>
      )}
    </Panel>
  );
}

/** A shared link to something that has since left the program. */
export function MissingDetail({ onClose }: { onClose: () => void }) {
  return (
    <Panel label="Not in the program" onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">Not in the current program</h2>
        <button onClick={onClose} aria-label="Close" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
          <Icon name="close" />
        </button>
      </div>
      <p className="mt-3 text-muted">This talk or poster was removed or renumbered on Indico. Check the timetable there.</p>
      <a href={INDICO_TIMETABLE} target="_blank" rel="noreferrer" className={`${btn} mt-4 self-start`}>
        Indico timetable <Icon name="external" className="size-4" />
      </a>
    </Panel>
  );
}
