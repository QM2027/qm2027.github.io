"use client";

import { useSyncExternalStore } from "react";
import { withBase } from "@/lib/paths";

/**
 * A new deploy's service worker waits until the visitor taps Update (see public/sw.js).
 * - ready: a new version is installed and waiting.
 * - dismissed: the visitor chose "Later"; the banner hides, the header keeps a small Update button.
 */
type UpdateState = { ready: boolean; dismissed: boolean };

const SERVER: UpdateState = { ready: false, dismissed: false };
let state: UpdateState = SERVER;
let waiting: ServiceWorker | undefined;
let registration: ServiceWorkerRegistration | undefined;
const listeners = new Set<() => void>();

function set(next: Partial<UpdateState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

/** How often an open guide asks the server for a new service worker. */
const CHECK_MS = 30 * 60_000;
let lastCheck = 0;

/** The browser only checks on navigation, so an app left open also checks on returning to the foreground. */
function check() {
  if (document.visibilityState !== "visible" || Date.now() - lastCheck < 60_000) return;
  lastCheck = Date.now();
  registration?.update().catch(() => {});
}

/** Only an update has a waiting worker next to an active one; a first install activates itself. */
function track(worker: ServiceWorker | null) {
  if (!worker) return;
  const ready = () => {
    if (worker.state !== "installed" || !navigator.serviceWorker.controller) return;
    waiting = worker;
    set({ ready: true, dismissed: false });
  };
  ready();
  worker.addEventListener("statechange", ready);
}

let started = false;

/** Registers the service worker once and starts watching for new versions. */
export async function registerServiceWorker() {
  if (started || process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  started = true;
  lastCheck = Date.now();
  try {
    registration = await navigator.serviceWorker.register(withBase("/sw.js"), { scope: withBase("/") });
    track(registration.waiting ?? registration.installing);
    registration.addEventListener("updatefound", () => track(registration!.installing));
    setInterval(check, CHECK_MS);
    document.addEventListener("visibilitychange", check);
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUpdate() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/** Hands control to the waiting worker, then reloads so pages and scripts come from the same deploy. */
export function applyUpdate() {
  if (!waiting) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
  waiting.postMessage({ type: "skip-waiting" });
}

export function dismissUpdate() {
  set({ dismissed: true });
}
