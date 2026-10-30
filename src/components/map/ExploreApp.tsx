"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { GUIDES } from "@/data/guides";
import { CATEGORIES, COURSES, PLACES, placeById, type Category, type Place } from "@/data/places";
import {
  ICC,
  directionLinks,
  distanceKm,
  formatDistance,
  formatMinutes,
  travelMinutes,
  type LatLng,
} from "@/lib/geo";
import { LazyMap as MapView } from "./LazyMap";

const ALL_CATEGORIES = Object.keys(CATEGORIES) as Category[];

export function ExploreApp() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Everything shareable lives in the URL: ?cat=food,sight&place=udo&course=east-unesco&indoor=1
  const catParam = params.get("cat") ?? "";
  const cats = useMemo(
    () => catParam.split(",").filter((c): c is Category => c in CATEGORIES),
    [catParam],
  );
  const selectedId = params.get("place") ?? undefined;
  const course = COURSES.find((c) => c.id === params.get("course"));
  const indoorOnly = params.get("indoor") === "1";
  const photoOnly = params.get("photo") === "1";
  const tab = course || params.get("tab") === "courses" ? "courses" : "places";

  const [me, setMe] = useState<LatLng>();
  const [locError, setLocError] = useState<string>();
  const origin = me ?? ICC;

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleCategory(c: Category) {
    const set = new Set(cats);
    if (set.has(c)) set.delete(c);
    else set.add(c);
    update({ cat: [...set].join(",") || undefined, place: undefined });
  }

  function locate() {
    setLocError(undefined);
    if (!navigator.geolocation) return setLocError("Location is not available on this device.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError("Couldn't get your location. Distances are measured from ICC Jeju."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const places = useMemo(() => {
    const list = course
      ? course.stops.map(placeById).filter((p): p is Place => !!p)
      : PLACES.filter(
          (p) =>
            (cats.length === 0 || cats.includes(p.category)) &&
            (!indoorOnly || p.indoor) &&
            (!photoOnly || p.tags?.includes("photo")),
        );
    const withDist = list.map((p) => ({ place: p, km: distanceKm(origin, p) }));
    return course ? withDist : withDist.sort((a, b) => a.km - b.km);
  }, [cats, course, indoorOnly, photoOnly, origin]);

  const route = useMemo(() => (course ? places.map((x) => x.place) : []), [course, places]);
  const selected = selectedId ? placeById(selectedId) : undefined;

  return (
    <div className="flex h-[calc(100dvh-3.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col md:grid md:grid-cols-[minmax(320px,380px)_1fr] lg:grid-cols-[420px_1fr] max-md:landscape:flex-row">
      {/* Map: top on phones (portrait), right on tablet/desktop and phone landscape */}
      <div className="relative h-[42%] shrink-0 md:order-2 md:h-auto max-md:landscape:order-2 max-md:landscape:h-auto max-md:landscape:flex-1">
        <MapView
          places={places.map((x) => x.place)}
          selectedId={selectedId}
          onSelect={(id) => update({ place: id })}
          route={route}
          me={me}
        />
        <button
          type="button"
          onClick={locate}
          className="absolute right-3 bottom-3 z-[500] flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-md"
          aria-label="Show my location"
        >
          <Icon name="locate" />
        </button>
      </div>

      {/* Panel */}
      <aside className="flex min-h-0 flex-1 flex-col border-border md:order-1 md:border-r max-md:landscape:w-[45%] max-md:landscape:flex-none max-md:landscape:border-r">
        {selected ? (
          <PlaceDetail place={selected} origin={origin} fromMe={!!me} onClose={() => update({ place: undefined })} />
        ) : (
          <>
            <div className="border-b border-border px-4 pt-3">
              <nav aria-label="Guides" className="-mx-4 mb-2 flex gap-4 overflow-x-auto px-4 [scrollbar-width:none]">
                {GUIDES.map((g) => (
                  <Link key={g.href} href={g.href} className="flex min-h-9 shrink-0 items-center text-sm text-muted underline decoration-border underline-offset-4 hover:text-foreground">
                    {g.title}
                  </Link>
                ))}
              </nav>
              <div role="tablist" className="flex gap-6 border-b border-border text-sm">
                {(["places", "courses"] as const).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => update({ tab: t === "courses" ? "courses" : undefined, course: undefined })}
                    className="-mb-px min-h-10 border-b-2 border-transparent text-muted aria-selected:border-foreground aria-selected:text-foreground"
                  >
                    {t === "places" ? "Places" : "Suggested courses"}
                  </button>
                ))}
              </div>

              {tab === "places" && (
                <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] lg:flex-wrap">
                  {ALL_CATEGORIES.map((c) => {
                    const on = cats.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCategory(c)}
                        aria-pressed={on}
                        className="flex min-h-9 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background"
                      >
                        <span className="size-2.5 rounded-full" style={{ background: CATEGORIES[c].color }} />
                        {CATEGORIES[c].label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => update({ indoor: indoorOnly ? undefined : "1", place: undefined })}
                    aria-pressed={indoorOnly}
                    className="min-h-9 shrink-0 rounded-md border border-dashed border-border px-3 text-sm aria-pressed:border-solid aria-pressed:border-sea aria-pressed:text-sea"
                  >
                    Indoor only
                  </button>
                  <button
                    onClick={() => update({ photo: photoOnly ? undefined : "1", place: undefined })}
                    aria-pressed={photoOnly}
                    className="min-h-9 shrink-0 rounded-md border border-dashed border-border px-3 text-sm aria-pressed:border-solid aria-pressed:border-sea aria-pressed:text-sea"
                  >
                    Photo spots
                  </button>
                </div>
              )}
              {tab === "courses" && course && (
                <div className="flex items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-sm text-muted">{course.length}</p>
                  </div>
                  <button onClick={() => update({ course: undefined })} className="min-h-9 rounded-md border border-border px-3 text-sm">
                    All courses
                  </button>
                </div>
              )}
              {tab === "courses" && !course && <div className="h-3" />}
            </div>

            {locError && <p className="bg-surface px-4 py-2 text-sm">{locError}</p>}
            <p className="px-4 pt-3 text-xs text-muted">
              {course ? "Stops in order" : `${places.length} places · distance from ${me ? "you" : "ICC Jeju"}`}
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {tab === "courses" && !course ? (
                <ul className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-1">
                  {COURSES.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => update({ course: c.id, tab: undefined })}
                        className="w-full rounded-md border border-border bg-surface p-4 text-left transition hover:border-sea"
                      >
                        <p className="font-semibold">{c.title}</p>
                        <p className="text-xs font-medium text-tangerine">{c.length}</p>
                        <p className="mt-1 text-sm text-muted">{c.blurb}</p>
                        <p className="mt-2 text-xs text-muted">
                          {c.stops.map((s) => placeById(s)?.name).join(" → ")}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <ol className="divide-y divide-border">
                  {places.map(({ place, km }, i) => (
                    <li key={place.id}>
                      <button
                        onClick={() => update({ place: place.id })}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface"
                      >
                        <span
                          className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                          style={{ background: CATEGORIES[place.category].color }}
                        >
                          {course ? i + 1 : ""}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{place.name}</span>
                          <span className="block truncate text-sm text-muted">{place.summary}</span>
                          {place.march && (
                            <span className="mt-1 inline-block rounded border border-border px-1.5 text-xs">In season in March</span>
                          )}
                        </span>
                        <span className="shrink-0 text-right text-xs text-muted">
                          {formatDistance(km)}
                          <br />
                          {km < 2 ? `${formatMinutes(travelMinutes(km, "walk"))} walk` : `${formatMinutes(travelMinutes(km, "car"))} drive`}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function PlaceDetail({
  place,
  origin,
  fromMe,
  onClose,
}: {
  place: Place;
  origin: LatLng;
  fromMe: boolean;
  onClose: () => void;
}) {
  const km = distanceKm(origin, place);
  const links = directionLinks(place.nameKo, place);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: CATEGORIES[place.category].color }}>
            {CATEGORIES[place.category].label}
          </p>
          <h2 className="text-xl font-semibold">{place.name}</h2>
          <p className="text-muted" lang="ko">{place.nameKo}</p>
        </div>
        <button onClick={onClose} aria-label="Back to list" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
          <Icon name="close" />
        </button>
      </div>

      <p className="mt-3 leading-relaxed">{place.summary}</p>
      {place.march && <p className="mt-3 border-l-2 border-tangerine bg-surface p-3 text-sm">{place.march}</p>}
      {place.tags?.includes("photo") && (
        <p className="mt-3 text-sm text-muted">Photo spot. Share yours with <b className="text-foreground">#QM2027Jeju</b></p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-md bg-surface p-2">
          <dt className="text-xs text-muted">From {fromMe ? "you" : "ICC"}</dt>
          <dd className="font-semibold">{formatDistance(km)}</dd>
        </div>
        <div className="rounded-md bg-surface p-2">
          <dt className="text-xs text-muted">{km < 2 ? "Walk" : "Drive"}</dt>
          <dd className="font-semibold">~{formatMinutes(travelMinutes(km, km < 2 ? "walk" : "car"))}</dd>
        </div>
        <div className="rounded-md bg-surface p-2">
          <dt className="text-xs text-muted">Time there</dt>
          <dd className="font-semibold">{place.durationMin ? formatMinutes(place.durationMin) : "—"}</dd>
        </div>
      </dl>

      {place.tags && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {place.indoor && <li className="rounded-md bg-sea/10 px-2 py-0.5 text-xs text-sea">Indoor</li>}
          {place.tags.map((t) => (
            <li key={t} className="rounded-md bg-border/60 px-2 py-0.5 text-xs">{t}</li>
          ))}
        </ul>
      )}

      <p className="mt-5 text-sm font-medium">Directions</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
        <a href={links.kakao} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-foreground font-medium">
          <span className="size-2 rounded-full bg-[#fee500] ring-1 ring-black/20" aria-hidden />
          Kakao Map
        </a>
        <a href={links.naver} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-foreground font-medium">
          <span className="size-2 rounded-full bg-[#03c75a]" aria-hidden />
          Naver Map
        </a>
        <a href={links.google} target="_blank" rel="noreferrer" className="col-span-2 flex min-h-11 items-center justify-center rounded-md border border-border sm:col-span-1 md:col-span-2 lg:col-span-1">
          Google Maps
        </a>
      </div>
      <p className="mt-2 text-xs text-muted">
        Google Maps can’t give driving or walking directions in Korea. Kakao Map and Naver Map show buses and live traffic.
      </p>
      <p className="mt-4 text-xs text-muted">Times are rough estimates. Check opening hours before you go.</p>
    </div>
  );
}
