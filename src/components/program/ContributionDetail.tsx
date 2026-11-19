"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { INDICO_TIMETABLE } from "@/data/indico-links";
import { fileFlag } from "@/lib/files-seen";
import { downloadIcs } from "@/lib/ics";
import { clock, dayLabel, dayOf, refreshProgram, type Abstracts, type Contribution, type Material, type Session } from "@/lib/program";
import { roomOf, shareLink, talkIcs, venueRoomId, venueRoomName } from "./shared";
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
/** Brand look: the panel opens on the logo blue, holding what the item is and when; the wrapper is
 *  display: contents in the other looks. Tokens are re-pointed so muted text and borders read on it. */
const FIELD =
  "brand:-mx-5 brand:-mt-[max(1.25rem,env(safe-area-inset-top))] brand:bg-brand-field brand:px-5 brand:pt-[max(1.25rem,env(safe-area-inset-top))] brand:pb-5 brand:text-on-brand-field brand:[--foreground:var(--on-brand-field)] brand:[--muted:var(--brand-field-muted)] brand:[--border:var(--brand-field-muted)]";
const onField = "brand:focus-visible:outline-2 brand:focus-visible:outline-offset-2 brand:focus-visible:outline-on-brand-field";

const KIND: Record<Material["kind"], string> = { pdf: "PDF", slides: "Slides", video: "Video", image: "Image", link: "Link", file: "File" };

function size(bytes?: number) {
  if (!bytes) return undefined;
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

type Props = {
  talk: Contribution;
  session?: Session;
  details?: Abstracts[string];
  abstractsLoaded: boolean;
  files?: Material[];
  /** The files as the visitor last saw them (url → modified), to mark new and replaced ones. */
  filesSeen?: Record<string, string>;
  onFilesSeen: (files: Material[]) => void;
  tz: string;
  starred: boolean;
  changed: boolean;
  onStar: () => void;
  onClose: () => void;
  /** Opens the floor plan over the panel, on this room (the venue room id) if it is known. */
  onShowMap: (room?: string) => void;
};

export function ContributionDetail({
  talk,
  session,
  details,
  abstractsLoaded,
  files,
  filesSeen,
  onFilesSeen,
  tz,
  starred,
  changed,
  onStar,
  onClose,
  onShowMap,
}: Props) {
  // Compare with what was seen before this opening; then record what is shown now.
  const [baseline] = useState(filesSeen);
  useEffect(() => {
    if (files) onFilesSeen(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- record when the list itself changes
  }, [files]);
  const [allAuthors, setAllAuthors] = useState(false);
  // Speakers replace files all week; a deleted and re-added file gets a new link. Re-check now.
  useEffect(() => {
    refreshProgram();
  }, [talk.id]);
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
      <div className={`contents brand:block ${FIELD}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm tabular-nums text-muted">
            {talk.poster ? `Poster${talk.board ? ` ${talk.board}` : ""}` : "Talk"} · {dayLabel(dayOf(talk.start))} · {clock(talk.start)}–
            {clock(talk.end)}
            {room && ` · ${room}`}
          </p>
          <button onClick={onClose} aria-label="Close" className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-border ${onField}`}>
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
      </div>
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
        <button onClick={() => onShowMap(venueId)} className={btn}>
          {venueId ? `${venueRoomName(venueId)} on floor plan` : "Floor plan"}
        </button>
        {talk.url && (
          <a href={talk.url} target="_blank" rel="noreferrer" className={btn}>
            Indico <Icon name="external" className="size-4" />
          </a>
        )}
        <button onClick={share} className={btn}>
          {shared ?? "Share"}
        </button>
      </div>

      {files && files.length > 0 && (
        <section className="mt-5">
          <h3 className="text-sm font-semibold">Files</h3>
          <ul className="mt-2 space-y-2 brand:space-y-0 brand:border-t brand:border-border">
            {files.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border px-4 text-sm hover:border-foreground brand:rounded-none brand:border-x-0 brand:border-t-0 brand:px-0 brand:hover:border-border brand:hover:underline">
                  <span className="min-w-0">
                    <span className="block truncate">{f.title}</span>
                    {fileFlag(baseline, f) && (
                      <span className="block text-xs font-semibold text-tangerine">
                        {fileFlag(baseline, f) === "new" ? "New" : "Updated"}
                        {f.modified && ` ${new Date(f.modified).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz })}`}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-muted">
                    {[KIND[f.kind], size(f.size)].filter(Boolean).join(" · ")}
                    <Icon name="external" className="size-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">If a file doesn&apos;t open, it was probably replaced: the Indico page has the latest.</p>
        </section>
      )}

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
      <div className={`flex items-start justify-between gap-3 ${FIELD}`}>
        <h2 className="text-xl font-semibold">Not in the current program</h2>
        <button onClick={onClose} aria-label="Close" className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-border ${onField}`}>
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
