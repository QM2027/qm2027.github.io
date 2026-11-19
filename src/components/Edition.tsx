"use client";

import { useLayoutEffect, useSyncExternalStore, type ReactNode } from "react";
import { LOOKS } from "@/lib/edition-script";

// The edition, notice and look switches are applied by PREFS_SCRIPT (src/lib/edition-script.ts) before
// the first paint. Most of the difference is CSS (.guide-only / .app-only); these helpers are for
// the parts that must not run at all in the other edition, such as the app home's data loading.

export type Edition = "guide" | "app";

const noop = () => () => {};
const read = (): Edition => (document.documentElement.dataset.edition === "app" ? "app" : "guide");

/** "guide" while hydrating (the static HTML is the same for both), then the real edition. */
export function useEdition(): Edition {
  return useSyncExternalStore(noop, read, () => "guide");
}

export function EditionOnly({ edition, children }: { edition: Edition; children: ReactNode }) {
  return useEdition() === edition ? children : null;
}

/** In development, Strict Mode's remount resets <html> to its JSX attributes; put the script's back. */
export function PrefsSync() {
  useLayoutEffect(() => {
    const prefs = new URLSearchParams((window as { __qmPrefs?: string }).__qmPrefs ?? "");
    const html = document.documentElement;
    if (prefs.get("edition") === "app") html.setAttribute("data-edition", "app");
    if (prefs.get("notice") === "off") html.setAttribute("data-notice", "off");
    const look = LOOKS.find((l) => l === prefs.get("look"));
    if (look) html.setAttribute("data-look", look);
  }, []);
  return null;
}
