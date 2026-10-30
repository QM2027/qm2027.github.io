"use client";

import { useState } from "react";
import { LazyMap } from "@/components/map/LazyMap";
import { BADGES, STAMPS, type Stamp } from "@/data/passport";
import { PLACES } from "@/data/places";
import { distanceKm, formatDistance, type LatLng } from "@/lib/geo";
import { useLocalSet } from "@/lib/use-local-set";

// The ICC has its own marker on every map, so only the other stamp spots are listed.
const STAMP_PLACES = PLACES.filter((p) => STAMPS.some((s) => s.id === p.id));
const NO_ROUTE: LatLng[] = [];

type Check = { id: string; status: "checking" | "ok" | "far" | "error"; km?: number };

function locate(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("unavailable"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}

/** Draws a shareable badge image. */
function badgeImage(count: number, badge: (typeof BADGES)[number], stamps: Stamp[]) {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1080;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, "#0b5c72");
  grad.addColorStop(1, "#0e7490");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1080, 1080);
  g.textAlign = "center";
  g.fillStyle = "#fff";
  g.font = "160px system-ui, sans-serif";
  g.fillText(badge.emoji, 540, 300);
  g.font = "700 84px system-ui, sans-serif";
  g.fillText(badge.title, 540, 430);
  g.font = "48px system-ui, sans-serif";
  g.fillStyle = "#ffffffcc";
  g.fillText(`${count} of ${STAMPS.length} Jeju stamps`, 540, 510);
  g.font = "72px system-ui, sans-serif";
  stamps.forEach((s, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    g.fillText(s.emoji, 540 + (col - 2.5) * 130, 650 + row * 130);
  });
  g.fillStyle = "#eab308";
  g.font = "600 52px system-ui, sans-serif";
  g.fillText("#QM2027Jeju", 540, 980);
  return new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
}

export function PassportApp() {
  const [stamped, toggle] = useLocalSet("qm2027:stamps");
  const [check, setCheck] = useState<Check>();
  const [selectedId, setSelectedId] = useState<string>();

  const count = STAMPS.filter((s) => stamped.has(s.id)).length;
  const badge = [...BADGES].reverse().find((b) => count >= b.min);
  const next = BADGES.find((b) => count < b.min);

  async function checkIn(s: Stamp) {
    setCheck({ id: s.id, status: "checking" });
    try {
      const here = await locate();
      const km = distanceKm(here, s);
      if (km * 1000 <= s.radius) {
        if (!stamped.has(s.id)) toggle(s.id);
        setCheck({ id: s.id, status: "ok" });
      } else {
        setCheck({ id: s.id, status: "far", km });
      }
    } catch {
      setCheck({ id: s.id, status: "error" });
    }
  }

  async function share() {
    if (!badge) return;
    const blob = await badgeImage(count, badge, STAMPS.filter((s) => stamped.has(s.id)));
    if (!blob) return;
    const file = new File([blob], "qm2027-jeju-passport.png", { type: "image/png" });
    const text = `${badge.emoji} ${badge.title}: ${count}/${STAMPS.length} Jeju stamps at Quark Matter 2027 #QM2027Jeju`;
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text }).catch(() => {});
    } else {
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: file.name }).click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0e7490] p-5 text-white">
          <div>
            <p className="text-sm text-white/80">Your passport</p>
            <p className="text-2xl font-semibold">
              {badge ? `${badge.emoji} ${badge.title}` : "No stamps yet"}
            </p>
            <p className="text-sm text-white/80">
              {count} / {STAMPS.length} stamps{next ? ` · ${next.min - count} more for ${next.emoji} ${next.title}` : " · complete!"}
            </p>
          </div>
          {badge && (
            <button onClick={share} className="min-h-11 rounded-xl bg-canola px-4 font-semibold text-black">
              Share badge
            </button>
          )}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {STAMPS.map((s) => {
            const done = stamped.has(s.id);
            const c = check?.id === s.id ? check : undefined;
            return (
              <li key={s.id} className={`flex flex-col items-center rounded-2xl border p-3 text-center ${done ? "border-sea bg-sea/5" : "border-border bg-surface"}`}>
                <button onClick={() => setSelectedId(s.id)} className="flex flex-col items-center">
                  <span className={`flex size-16 items-center justify-center rounded-full border-2 border-dashed text-3xl ${done ? "border-sea bg-surface" : "border-border opacity-40 grayscale"}`}>
                    {s.emoji}
                  </span>
                  <span className="mt-2 text-sm font-medium leading-tight">{s.name}</span>
                </button>
                {done ? (
                  <span className="mt-2 text-xs font-semibold text-sea">✓ Stamped</span>
                ) : (
                  <button
                    onClick={() => checkIn(s)}
                    disabled={c?.status === "checking"}
                    className="mt-2 min-h-9 rounded-full border border-border px-3 text-xs hover:border-sea"
                  >
                    {c?.status === "checking" ? "Locating…" : "I'm here"}
                  </button>
                )}
                {c?.status === "far" && <span className="mt-1 text-xs text-tangerine">{formatDistance(c.km!)} away</span>}
                {c?.status === "error" && <span className="mt-1 text-xs text-tangerine">Location unavailable</span>}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Stamps are checked against your phone&apos;s location and saved only on this device. Nothing is sent anywhere.
        </p>
      </div>

      <div className="h-80 overflow-hidden rounded-2xl border border-border lg:sticky lg:top-20 lg:h-[34rem]">
        <LazyMap places={STAMP_PLACES} selectedId={selectedId} onSelect={setSelectedId} route={NO_ROUTE} />
      </div>
    </div>
  );
}
