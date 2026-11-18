"use client";

import { useFetchJson } from "./use-fetch-json";

// Published weekly by QM2027/tour-data from data.go.kr (Korea Tourism Organization). Photos are
// copied to its Pages site, so visitors' browsers never call a third party for them.
export const TOUR_DATA_BASE =
  process.env.NEXT_PUBLIC_TOUR_DATA_BASE ??
  (process.env.NODE_ENV === "development" ? "https://qm2027.github.io/tour-data" : "/tour-data");

export type TourPhoto = {
  /** Relative to TOUR_DATA_BASE. */
  src: string;
  srcSmall: string;
  width: number;
  height: number;
  title: string;
  photographer: string | null;
  month: string | null;
  galContentId: string;
  license: string;
};

export const photoUrl = (path: string) => `${TOUR_DATA_BASE}/${path}`;
/** KOGL Type 1 asks for the source next to the work: the gallery (PhotoKorea) and the photographer. */
export const photoCredit = (p: TourPhoto) =>
  `Photo: Korea Tourism Organization, PhotoKorea${p.photographer ? ` (${p.photographer})` : ""} · KOGL Type 1`;

/** Photos keyed by place id; empty while loading or when unavailable. */
export function useTourPhotos(): Record<string, TourPhoto[]> {
  const res = useFetchJson<Record<string, TourPhoto[]>>(`${TOUR_DATA_BASE}/photos.json`);
  return res.status === "ok" ? res.data : {};
}
