"use client";

import { useEffect, useState } from "react";

type State<T> = { status: "loading" } | { status: "ok"; data: T } | { status: "error" };

/** Fetch a keyless public JSON API on the client. Pages must render fine when it fails. */
export function useFetchJson<T>(url: string | null): State<T> {
  const [state, setState] = useState<{ url: string | null; value: State<T> }>({ url, value: { status: "loading" } });

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: T) => setState({ url, value: { status: "ok", data } }))
      .catch(() => {
        if (!ctrl.signal.aborted) setState({ url, value: { status: "error" } });
      });
    return () => ctrl.abort();
  }, [url]);

  return state.url === url ? state.value : { status: "loading" };
}
