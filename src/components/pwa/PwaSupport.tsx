"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { closeInstallHelp, install, persistStorage, useInstall } from "./install";
import { applyUpdate, dismissUpdate, registerServiceWorker, useUpdate } from "./update";

const DISMISS_KEY = "qm2027:install-dismissed";
const BANNER =
  "pin-bottom fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem+var(--bottom-bar,0px)+var(--app-bottom,0px))] z-[1500] mx-auto flex max-w-md items-start gap-3 rounded-md bg-sea p-4 text-on-sea shadow-xl md:bottom-6";

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

/**
 * Registers the service worker, offers a new version when one is ready, and offers "add to home
 * screen" once per device. After "Later", the header keeps a small Update button (see SiteNav).
 * The header's Install button reopens the install banner where there is no native prompt.
 */
export function PwaSupport() {
  const { mode, helpOpen } = useInstall();
  const [auto, setAuto] = useState(false);
  const update = useUpdate();

  useEffect(() => {
    registerServiceWorker().then(() => {
      if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") registerProgramSync();
    });
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

  if (update.ready && !update.dismissed) {
    return (
      <div role="status" aria-label="Update available" className={BANNER}>
        <div className="flex-1 text-sm">
          <p className="font-semibold">A new version is ready</p>
          <p className="mt-1 text-on-sea/75">Reload the guide to get the latest version.</p>
          <button
            onClick={applyUpdate}
            disabled={update.updating}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-background px-4 font-semibold text-foreground disabled:opacity-75"
          >
            <Icon name="refresh" className={update.updating ? "animate-spin" : undefined} />
            {update.updating ? "Updating…" : "Update"}
          </button>
        </div>
        <button onClick={dismissUpdate} aria-label="Later" className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-sea/75 hover:bg-on-sea/10 hover:text-on-sea">
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
