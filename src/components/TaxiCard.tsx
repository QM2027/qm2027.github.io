"use client";

import { useState } from "react";
import { ShowCard } from "./ShowCard";

const PRESETS = [
  { label: "ICC Jeju (conference)", ko: "제주국제컨벤션센터", addr: "서귀포시 중문관광로 224" },
  { label: "Jeju Airport", ko: "제주국제공항", addr: "제주시 공항로 2" },
  { label: "Seogwipo Medical Center", ko: "서귀포의료원", addr: "서귀포시 장수로 47" },
];

const LEAD = "기사님, 여기로 가주세요";
const ENGLISH = "Please take me here";

/** A full-screen card to show a taxi driver. Works offline once the page is cached. */
export function TaxiCard() {
  const [dest, setDest] = useState(PRESETS[0]);
  const [custom, setCustom] = useState("");
  const [open, setOpen] = useState(false);
  const ko = custom.trim() || dest.ko;

  return (
    // #taxi: linked from the app edition's home. scroll-mt clears the sticky header.
    // Brand look (?look=brand): a ruled section, heading left and the card right, with a preview of
    // what the driver will read. The two wrappers are display: contents outside it, so take no part
    // in the layout there.
    <div
      id="taxi"
      className="scroll-mt-24 rounded-md border border-border bg-surface p-4 sm:p-6 brand:rounded-none brand:border-x-0 brand:border-b-0 brand:border-foreground brand:bg-transparent brand:px-0 brand:pt-6 brand:pb-0 sm:brand:px-0 sm:brand:pt-6 sm:brand:pb-0 lg:brand:grid lg:brand:grid-cols-12 lg:brand:gap-x-12"
    >
      <div className="contents brand:block lg:brand:col-span-3">
        <h2 className="text-lg font-semibold brand:text-2xl sm:brand:text-3xl lg:brand:text-2xl xl:brand:text-3xl">Show-the-driver card</h2>
        <p className="mt-1 text-sm text-muted brand:mt-3 brand:text-base">
          Pick a destination or paste your hotel’s Korean name (it’s in your booking confirmation), then tap
          “Show”.
        </p>
      </div>
      <div className="contents brand:mt-8 brand:block lg:brand:col-span-9 lg:brand:mt-0">
        <div className="mt-4 flex flex-wrap gap-2 brand:mt-0">
          {PRESETS.map((p) => (
            <button
              key={p.ko}
              onClick={() => {
                setDest(p);
                setCustom("");
              }}
              aria-pressed={!custom && dest.ko === p.ko}
              className="min-h-11 rounded-md border border-border px-4 text-sm aria-pressed:border-sea aria-pressed:bg-sea aria-pressed:text-on-sea brand:min-h-12 brand:px-5 brand:text-base"
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or type a Korean name / address, e.g. 롯데호텔 제주"
          className="mt-3 min-h-11 w-full rounded-md border border-border bg-background px-3 brand:min-h-12"
          lang="ko"
        />
        <div className="mt-6 hidden bg-surface p-5 brand:block sm:p-8" aria-hidden="true">
          <p lang="ko" className="text-lg text-muted">{LEAD}</p>
          <p className="text-sm text-muted">{ENGLISH}</p>
          <p lang="ko" className="mt-6 text-4xl leading-tight font-semibold break-keep [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl">
            {ko}
          </p>
          {!custom && <p lang="ko" className="mt-3 text-lg text-muted sm:text-xl">{dest.addr}</p>}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="mt-3 min-h-12 w-full rounded-md bg-tangerine font-semibold text-background sm:w-auto sm:px-8 brand:mt-4 brand:min-h-14 brand:text-lg sm:brand:px-12"
        >
          Show
        </button>
      </div>

      {open && (
        <ShowCard
          lead={LEAD}
          main={ko}
          sub={custom ? undefined : dest.addr}
          english={ENGLISH}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
