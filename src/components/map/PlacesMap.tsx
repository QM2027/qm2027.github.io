"use client";

import { useMemo, useState } from "react";
import { PLACES } from "@/data/places";
import { LazyMap } from "./LazyMap";

/** A small read-only map of selected places, usable from Server Component pages. */
export function PlacesMap({ ids, connect = false }: { ids: string[]; connect?: boolean }) {
  const [selectedId, setSelectedId] = useState<string>();
  const places = useMemo(() => ids.map((id) => PLACES.find((p) => p.id === id)!).filter(Boolean), [ids]);
  const route = useMemo(() => (connect ? places : []), [connect, places]);
  return <LazyMap places={places} selectedId={selectedId} onSelect={setSelectedId} route={route} />;
}
