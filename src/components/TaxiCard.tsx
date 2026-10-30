"use client";

import { useState } from "react";
import { ShowCard } from "./ShowCard";

const PRESETS = [
  { label: "ICC Jeju (conference)", ko: "제주국제컨벤션센터", addr: "서귀포시 중문관광로 224" },
  { label: "Jeju Airport", ko: "제주국제공항", addr: "제주시 공항로 2" },
  { label: "Seogwipo Medical Center", ko: "서귀포의료원", addr: "서귀포시 장수로 47" },
];

/** A full-screen card to show a taxi driver. Works offline once the page is cached. */
export function TaxiCard() {
  const [dest, setDest] = useState(PRESETS[0]);
  const [custom, setCustom] = useState("");
  const [open, setOpen] = useState(false);
  const ko = custom.trim() || dest.ko;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <h2 className="text-lg font-semibold">🚕 Show-the-driver card</h2>
      <p className="mt-1 text-sm text-muted">
        Pick a destination or paste your hotel’s Korean name (it’s in your booking confirmation), then tap
        “Show”.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.ko}
            onClick={() => {
              setDest(p);
              setCustom("");
            }}
            aria-pressed={!custom && dest.ko === p.ko}
            className="min-h-11 rounded-full border border-border px-4 text-sm aria-pressed:border-sea aria-pressed:bg-sea aria-pressed:text-on-sea"
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder="Or type a Korean name / address, e.g. 롯데호텔 제주"
        className="mt-3 min-h-11 w-full rounded-xl border border-border bg-background px-3"
        lang="ko"
      />
      <button
        onClick={() => setOpen(true)}
        className="mt-3 min-h-12 w-full rounded-xl bg-tangerine font-semibold text-white sm:w-auto sm:px-8"
      >
        Show
      </button>

      {open && (
        <ShowCard
          lead="기사님, 여기로 가주세요"
          main={ko}
          sub={custom ? undefined : dest.addr}
          english="Please take me here"
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
