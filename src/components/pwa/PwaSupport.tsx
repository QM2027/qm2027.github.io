"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { withBase } from "@/lib/paths";
import { closeInstallHelp, install, useInstall } from "./install";

const DISMISS_KEY = "qm2027:install-dismissed";

/**
 * Registers the service worker and offers "add to home screen" once per device.
 * The header's Install button reopens the same banner where there is no native prompt.
 */
export function PwaSupport() {
  const { mode, helpOpen } = useInstall();
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register(withBase("/sw.js"), { scope: withBase("/") }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (mode !== "prompt" && mode !== "ios") return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {}
    // Deferred on iOS so the banner doesn't flash during hydration.
    const id = setTimeout(() => setAuto(true), mode === "ios" ? 1500 : 0);
    return () => clearTimeout(id);
  }, [mode]);

  function dismiss() {
    setAuto(false);
    closeInstallHelp();
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  if (!mode || !(auto || helpOpen)) return null;

  return (
    <div
      role="dialog"
      aria-label="Install the guide"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem+var(--bottom-bar,0px))] z-[1500] mx-auto flex max-w-md items-start gap-3 rounded-md bg-sea p-4 text-on-sea shadow-xl md:bottom-6"
    >
      <div className="flex-1 text-sm">
        <p className="font-semibold">Use the guide offline</p>
        {mode === "ios" ? (
          <p className="mt-1 text-on-sea/75">Tap the Share button, then “Add to Home Screen”. Maps you&apos;ve viewed and all guides will work without signal.</p>
        ) : mode === "mac-safari" ? (
          <p className="mt-1 text-on-sea/75">In Safari, choose File › Add to Dock. Guides and maps you&apos;ve viewed work without signal.</p>
        ) : (
          <>
            <p className="mt-1 text-on-sea/75">Install it on this device. Guides and maps you&apos;ve viewed work without signal.</p>
            <button
              onClick={async () => {
                await install();
                dismiss();
              }}
              className="mt-3 min-h-10 rounded-md bg-background px-4 font-semibold text-foreground"
            >
              Install
            </button>
          </>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-sea/75 hover:bg-on-sea/10 hover:text-on-sea">
        <Icon name="close" />
      </button>
    </div>
  );
}
