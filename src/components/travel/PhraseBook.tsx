"use client";

import Link from "next/link";
import { useState } from "react";
import { ShowCard } from "@/components/ShowCard";

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

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <h2 className="font-semibold">Show-in-Korean cards</h2>
      <p className="mt-1 text-sm text-muted">
        Tap to show full screen. Food and allergy phrases are in the <Link href="/explore/food/" className="text-sea underline">food guide</Link>.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{g.title}</h3>
            <ul className="mt-2 space-y-2">
              {g.phrases.map((p) => (
                <li key={p.ko}>
                  <button onClick={() => setShown(p)} className="w-full rounded-md border border-border px-3 py-2 text-left hover:border-sea">
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
