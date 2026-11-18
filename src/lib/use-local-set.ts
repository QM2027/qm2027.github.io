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

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
  listeners.forEach((l) => l());
}

export function useLocalSet(key: string) {
  const value = useSyncExternalStore(subscribe, () => read(key), () => EMPTY);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(read(key));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      write(key, JSON.stringify([...next]));
    },
    [key],
  );

  const addAll = useCallback((ids: Iterable<string>) => write(key, JSON.stringify([...new Set([...read(key), ...ids])])), [key]);

  return [value, toggle, addAll] as const;
}

function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** A single string in localStorage. `undefined` during server rendering, `null` when unset. */
export function useLocalString(key: string) {
  const value = useSyncExternalStore<string | null | undefined>(subscribe, () => readString(key), () => undefined);
  const set = useCallback((v: string) => write(key, v), [key]);
  return [value, set] as const;
}
