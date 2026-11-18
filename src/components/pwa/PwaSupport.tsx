"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { withBase } from "@/lib/paths";
import { closeInstallHelp, install, persistStorage, useInstall } from "./install";

const DISMISS_KEY = "qm2027:install-dismissed";
const BANNER =
  "fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem+var(--bottom-bar,0px)+var(--app-bottom,0px))] z-[1500] mx-auto flex max-w-md items-start gap-3 rounded-md bg-sea p-4 text-on-sea shadow-xl md:bottom-6";

type PeriodicSync = { register: (tag: string, options: { minInterval: number }) => Promise<void> };

/** Where the browser allows it (an installed Chromium app), fetch the program hourly even while closed. */
async function registerProgramSync() {
  try {
    const registration = (await navigator.serviceWorker.ready) as ServiceWorkerRegistration & { periodicSync?: PeriodicSync };
    if (!registration.periodicSync) return;
    const status = await navigator.permissions.query({ name: "periodic-background-sync" as PermissionName });
    if (status.state === "granted") await registration.periodicSync.register("program", { minInterval: 60 * 60_000 });
  } catch {}
}

/** How often an open guide asks the server for a new service worker. */
const UPDATE_CHECK_MS = 30 * 60_000;

/**
 * Registers the service worker and reports a new version waiting to take over. The browser only
 * checks on navigation, so an app left open also checks when it returns to the foreground.
 */
function useServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker;
    let registration: ServiceWorkerRegistration | undefined;
    let lastCheck = Date.now();

    // Only an update has a waiting worker next to an active one; a first install activates itself.
    const track = (worker: ServiceWorker | null) => {
      if (!worker) return;
      const ready = () => {
        if (worker.state === "installed" && sw.controller) setWaiting(worker);
      };
      ready();
      worker.addEventListener("statechange", ready);
    };

    sw.register(withBase("/sw.js"), { scope: withBase("/") })
      .then((reg) => {
        registration = reg;
        track(reg.waiting ?? reg.installing);
        reg.addEventListener("updatefound", () => track(reg.installing));
      })
      .catch(() => {});
    registerProgramSync();

    const check = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastCheck < 60_000) return;
      lastCheck = Date.now();
      registration?.update().catch(() => {});
    };
    const id = setInterval(check, UPDATE_CHECK_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  function update() {
    if (!waiting) return;
    // Reload once the new worker controls the page, so pages and scripts come from the same deploy.
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    waiting.postMessage({ type: "skip-waiting" });
  }

  return { waiting: !!waiting, update, dismiss: () => setWaiting(null) };
}

/**
 * Registers the service worker, offers a new version when one is ready, and offers "add to home
 * screen" once per device. The header's Install button reopens the same banner where there is no
 * native prompt.
 */
export function PwaSupport() {
  const { mode, helpOpen } = useInstall();
  const [auto, setAuto] = useState(false);
  const updater = useServiceWorker();

  useEffect(() => {
    persistStorage();
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

  if (updater.waiting) {
    return (
      <div role="status" aria-label="Update available" className={BANNER}>
        <div className="flex-1 text-sm">
          <p className="font-semibold">A new version is ready</p>
          <p className="mt-1 text-on-sea/75">Reload the guide to get the latest version.</p>
          <button onClick={updater.update} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-background px-4 font-semibold text-foreground">
            <Icon name="refresh" />
            Update
          </button>
        </div>
        <button onClick={updater.dismiss} aria-label="Later" className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-sea/75 hover:bg-on-sea/10 hover:text-on-sea">
          <Icon name="close" />
        </button>
      </div>
    );
  }

  if (!mode || !(auto || helpOpen)) return null;

  return (
    <div role="dialog" aria-label="Install the guide" className={BANNER}>
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
