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

/** Draws a shareable badge image: a page of rubber stamps, black on white. */
function badgeImage(count: number, badge: (typeof BADGES)[number], stamped: ReadonlySet<string>) {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1080;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 1080, 1080);
  g.fillStyle = "#111";
  g.textAlign = "left";
  g.font = "500 30px ui-monospace, monospace";
  g.fillText("QUARK MATTER 2027 · JEJU PASSPORT", 80, 120);
  g.font = "600 92px Georgia, serif";
  g.fillText(badge.title, 80, 230);
  g.font = "36px system-ui, sans-serif";
  g.fillText(`${count} of ${STAMPS.length} stamps`, 80, 290);
  STAMPS.forEach((s, i) => {
    const x = 170 + (i % 4) * 247;
    const y = 450 + Math.floor(i / 4) * 210;
    const on = stamped.has(s.id);
    g.strokeStyle = on ? "#d9480f" : "#ddd";
    g.fillStyle = on ? "#d9480f" : "#ccc";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(x, y, 85, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(x, y, 74, 0, Math.PI * 2);
    g.stroke();
    g.textAlign = "center";
    g.font = "500 30px ui-monospace, monospace";
    g.fillText(String(i + 1).padStart(2, "0"), x, y - 12);
    g.font = "600 30px system-ui, sans-serif";
    g.fillText(s.ko, x, y + 30);
  });
  g.textAlign = "left";
  g.fillStyle = "#111";
  g.font = "500 32px ui-monospace, monospace";
  g.fillText("#QM2027Jeju", 80, 1020);
  return new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
}

/** A rubber-stamp mark: double ring, number and Korean place name. */
function StampMark({ n, ko, on }: { n: number; ko: string; on: boolean }) {
  return (
    <span
      className={`flex size-20 flex-col items-center justify-center rounded-full border-2 outline-1 outline-offset-[-7px] ${
        on ? "-rotate-6 border-tangerine text-tangerine outline outline-tangerine" : "border-dashed border-border text-muted"
      }`}
    >
      <span className="font-mono text-xs">{String(n).padStart(2, "0")}</span>
      <span className="text-sm font-semibold" lang="ko">{ko}</span>
    </span>
  );
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
    const blob = await badgeImage(count, badge, stamped);
    if (!blob) return;
    const file = new File([blob], "qm2027-jeju-passport.png", { type: "image/png" });
    const text = `${badge.title}: ${count}/${STAMPS.length} Jeju stamps at Quark Matter 2027 #QM2027Jeju`;
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
        <div className="flex flex-wrap items-end justify-between gap-3 border-y border-foreground py-4">
          <div>
            <p className="font-mono text-xs tracking-wider text-muted uppercase">Your passport</p>
            <p className="mt-1 font-serif text-2xl font-semibold">{badge ? badge.title : "No stamps yet"}</p>
            <p className="text-sm text-muted">
              {count} of {STAMPS.length} stamps{next ? `. ${next.min - count} more for “${next.title}”.` : ". Complete."}
            </p>
          </div>
          {badge && (
            <button onClick={share} className="min-h-11 rounded-md bg-foreground px-4 font-medium text-background">
              Share badge
            </button>
          )}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {STAMPS.map((s, i) => {
            const done = stamped.has(s.id);
            const c = check?.id === s.id ? check : undefined;
            return (
              <li key={s.id} className="flex flex-col items-center border-b border-border py-4 text-center">
                <button onClick={() => setSelectedId(s.id)} className="flex flex-col items-center">
                  <StampMark n={i + 1} ko={s.ko} on={done} />
                  <span className="mt-2 text-sm font-medium leading-tight">{s.name}</span>
                </button>
                {done ? (
                  <span className="mt-2 font-mono text-xs text-tangerine">Stamped</span>
                ) : (
                  <button
                    onClick={() => checkIn(s)}
                    disabled={c?.status === "checking"}
                    className="mt-2 min-h-9 rounded-md border border-border px-3 text-xs hover:border-sea"
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

      <div className="h-80 overflow-hidden rounded-md border border-border lg:sticky lg:top-20 lg:h-[34rem]">
        <LazyMap places={STAMP_PLACES} selectedId={selectedId} onSelect={setSelectedId} route={NO_ROUTE} />
      </div>
    </div>
  );
}
