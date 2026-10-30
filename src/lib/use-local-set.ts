"use client";

import { useCallback, useSyncExternalStore } from "react";

// A string set persisted in localStorage, shared across components and tabs.
// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: ReadonlySet<string> }>();
const EMPTY: ReadonlySet<string> = new Set();

function read(key: string): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {}
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  let value: ReadonlySet<string> = EMPTY;
  try {
    value = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {}
  cache.set(key, { raw, value });
  return value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLocalSet(key: string) {
  const value = useSyncExternalStore(subscribe, () => read(key), () => EMPTY);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(read(key));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(key, JSON.stringify([...next]));
      } catch {}
      listeners.forEach((l) => l());
    },
    [key],
  );

  return [value, toggle] as const;
}
