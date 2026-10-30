"use client";

import { Icon } from "./Icon";

/** Full-screen, high-contrast Korean text to show someone (taxi driver, waiter). */
export function ShowCard({
  lead,
  main,
  sub,
  english,
  onClose,
}: {
  lead?: string;
  main: string;
  sub?: string;
  english?: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label={english ?? main}
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-6 bg-white p-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-center text-black"
      onClick={onClose}
    >
      {lead && <p className="text-lg text-neutral-500" lang="ko">{lead}</p>}
      <p lang="ko" className="max-w-4xl text-[clamp(2rem,8vw,5rem)] leading-tight font-bold break-keep">
        {main}
      </p>
      {sub && <p lang="ko" className="text-xl text-neutral-600 sm:text-2xl">{sub}</p>}
      <p lang="ko" className="text-xl sm:text-2xl">감사합니다</p>
      {english && <p className="text-sm text-neutral-400">{english}</p>}
      <button
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex size-12 items-center justify-center rounded-full bg-neutral-100"
        aria-label="Close"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}
