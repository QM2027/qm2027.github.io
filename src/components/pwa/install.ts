"use client";

import { useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/**
 * How this browser installs the guide:
 * - "prompt": Chromium fired beforeinstallprompt, so a button can open the native dialog.
 * - "ios": iPhone/iPad have no prompt; the visitor adds it from the Share sheet.
 * - "mac-safari": Safari 17+ on macOS (Sonoma) adds web apps from File > Add to Dock.
 * - null: already installed, or the browser can't install it (or hasn't offered yet).
 */
export type InstallMode = "prompt" | "ios" | "mac-safari" | null;

type InstallState = { mode: InstallMode; helpOpen: boolean };

const SERVER: InstallState = { mode: null, helpOpen: false };
let state: InstallState = SERVER;
let deferred: InstallEvent | undefined;
const listeners = new Set<() => void>();

function set(next: Partial<InstallState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Listen at module load: beforeinstallprompt can fire before React has hydrated.
if (typeof window !== "undefined" && !isStandalone()) {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Add to Dock arrived with Safari 17 (macOS Sonoma 14); older Safari has no way to install.
  const safariMajor = Number(/Version\/(\d+)/.exec(ua)?.[1] ?? 0);
  const macSafari =
    !ios && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua) && safariMajor >= 17;
  if (ios) state = { ...state, mode: "ios" };
  else if (macSafari) state = { ...state, mode: "mac-safari" };

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    set({ mode: "prompt" });
  });
  window.addEventListener("appinstalled", () => {
    persistStorage();
    deferred = undefined;
    set({ mode: null, helpOpen: false });
  });
}

/**
 * Asks the browser not to clear the saved program and schedule when space runs low or the site
 * goes unused. Chromium and Safari decide silently (installed apps qualify); Firefox would show a
 * permission prompt, so there it is only asked from the installed app.
 */
export function persistStorage() {
  try {
    if (/Firefox\//.test(navigator.userAgent) && !isStandalone()) return;
    navigator.storage?.persist?.().catch(() => {});
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInstall() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/** Opens the native dialog where there is one, otherwise shows the how-to banner. */
export async function install() {
  if (state.mode === "prompt" && deferred) {
    const event = deferred;
    deferred = undefined;
    await event.prompt();
    const { outcome } = await event.userChoice;
    // A spent prompt can't be reused; Chromium offers a fresh one on a later visit.
    set({ mode: null, helpOpen: false });
    return outcome;
  }
  if (state.mode) set({ helpOpen: true });
}

export function closeInstallHelp() {
  set({ helpOpen: false });
}
