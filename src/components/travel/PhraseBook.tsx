"use client";

import Link from "next/link";
import { useState } from "react";
import { ShowCard } from "@/components/ShowCard";
import { PLAIN_OPEN_PANEL } from "@/lib/look";

const GROUPS = [
  {
    title: "Getting around",
    phrases: [
      { en: "Please take me to the Jeju International Convention Center.", ko: "제주국제컨벤션센터로 가 주세요." },
      { en: "Please take me to the airport.", ko: "제주공항으로 가 주세요." },
      { en: "Can I pay by card?", ko: "카드로 계산할 수 있나요?" },
      { en: "Please stop here.", ko: "여기서 세워 주세요." },
    ],
  },
  {
    title: "Help",
    phrases: [
      { en: "Please call an ambulance.", ko: "구급차를 불러 주세요." },
      { en: "Where is the nearest pharmacy?", ko: "가까운 약국이 어디예요?" },
      { en: "Where is the restroom?", ko: "화장실이 어디예요?" },
      { en: "I lost my way. Can you help me?", ko: "길을 잃었어요. 도와주시겠어요?" },
    ],
  },
  {
    title: "Shopping",
    phrases: [
      { en: "How much is this?", ko: "이거 얼마예요?" },
      { en: "Tax refund, please (I'm a tourist).", ko: "택스 리펀드 해 주세요. 관광객이에요." },
      { en: "Could you pack this for a flight?", ko: "비행기로 가져갈 수 있게 포장해 주세요." },
    ],
  },
];

export function PhraseBook() {
  const [shown, setShown] = useState<{ en: string; ko: string }>();

  // Brand look (?look=brand): heading and note in three of twelve columns, the three groups in the
  // other nine, each card a ruled row rather than a box.
  return (
    <section className={`rounded-md border border-border bg-surface p-5 ${PLAIN_OPEN_PANEL} brand:pt-6 brand:lg:grid brand:lg:grid-cols-12 brand:lg:gap-x-12`}>
      <div className="brand:lg:col-span-3">
        <h2 className="font-semibold plain:text-xl">Show-in-Korean cards</h2>
        <p className="mt-1 text-sm text-muted brand:mt-2">
          Tap to show full screen. Food and allergy phrases are in the <Link href="/explore/food/" className="text-sea underline">food guide</Link>.
        </p>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 brand:mt-6 brand:gap-x-8 brand:gap-y-8 brand:lg:col-span-9 brand:lg:mt-0 brand:lg:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase brand:text-base brand:text-foreground">{g.title}</h3>
            <ul className="mt-2 space-y-2 brand:mt-3 brand:space-y-0 brand:border-b brand:border-border">
              {g.phrases.map((p) => (
                <li key={p.ko}>
                  <button
                    onClick={() => setShown(p)}
                    className="w-full rounded-md border border-border px-3 py-2 text-left hover:border-sea brand:rounded-none brand:border-0 brand:border-t brand:px-0 brand:py-3 brand:hover:border-border brand:hover:text-tangerine"
                  >
                    <span className="block text-sm font-medium">{p.en}</span>
                    <span className="block text-sm text-muted" lang="ko">{p.ko}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {shown && <ShowCard main={shown.ko} english={shown.en} onClose={() => setShown(undefined)} />}
    </section>
  );
}
