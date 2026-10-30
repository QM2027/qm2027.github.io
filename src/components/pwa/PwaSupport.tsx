"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { withBase } from "@/lib/paths";

type InstallEvent = Event & { prompt: () => Promise<void> };

const DISMISS_KEY = "qm2027:install-dismissed";

/** Registers the service worker and offers "add to home screen" once per device. */
export function PwaSupport() {
  const [deferred, setDeferred] = useState<InstallEvent>();
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register(withBase("/sw.js"), { scope: withBase("/") }).catch(() => {});
    }

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (dismissed || standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari has no install prompt; show instructions instead.
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIos) {
      // Deferred so the banner doesn't flash during hydration.
      const id = setTimeout(() => {
        setIos(true);
        setHidden(false);
      }, 1500);
      return () => {
        clearTimeout(id);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  if (hidden) return null;

  return (
    <div
      role="dialog"
      aria-label="Install the guide"
      className="fixed inset-x-3 bottom-[calc(var(--tab-height)+env(safe-area-inset-bottom)+0.75rem)] z-[1500] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-lg md:bottom-6"
    >
      <span className="text-2xl" aria-hidden>📲</span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">Use the guide offline</p>
        {ios ? (
          <p className="mt-1 text-muted">Tap the Share button, then “Add to Home Screen”. Maps you&apos;ve viewed and all guides will work without signal.</p>
        ) : (
          <>
            <p className="mt-1 text-muted">Install it on this device. Guides and maps you&apos;ve viewed work without signal.</p>
            <button
              onClick={async () => {
                await deferred?.prompt();
                dismiss();
              }}
              className="mt-2 min-h-10 rounded-xl bg-sea px-4 font-semibold text-on-sea"
            >
              Install
            </button>
          </>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-background">
        <Icon name="close" />
      </button>
    </div>
  );
}
