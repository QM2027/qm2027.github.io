"use client";

import dynamic from "next/dynamic";

/** Leaflet needs `window`, so the map only renders on the client. */
export const LazyMap = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-border/40" />,
});
