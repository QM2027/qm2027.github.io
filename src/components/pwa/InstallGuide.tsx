"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

/**
 * Where there is no install button to press (Safari), a step-by-step guide with an arrow toward the
 * browser control to use. The page can't tell where iPhone Safari keeps its address bar, so the
 * guide shows both layouts; either way the first tap is at the bottom of the screen.
 */
type Variant = "iphone" | "ipad" | "ios-other" | "mac";

function variantOf(mode: "ios" | "mac-safari"): Variant {
  if (mode === "mac-safari") return "mac";
  const ua = navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return "ios-other";
  if (/iPhone|iPod/.test(ua)) return "iphone";
  return "ipad";
}

const PLACE: Record<Variant, string> = {
  iphone: "inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.25rem)] mx-auto max-w-md items-center",
  "ios-other": "inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] mx-auto max-w-md",
  ipad: "right-4 top-[calc(env(safe-area-inset-top)+0.25rem)] w-[min(26rem,calc(100%-2rem))] items-end",
  mac: "left-4 top-1 w-[min(26rem,calc(100%-2rem))] items-start",
};

export function InstallGuide({ mode, onClose }: { mode: "ios" | "mac-safari"; onClose: () => void }) {
  const variant = variantOf(mode);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-[1600] bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        onClick={(e) => e.stopPropagation()}
        className={`absolute flex flex-col ${PLACE[variant]}`}
      >
        {variant === "ipad" && <Arrow up className="mr-10" />}
        {variant === "mac" && <Arrow up className="ml-8" />}
        <div className="w-full rounded-md border border-border bg-background p-5 text-foreground shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <h2 id="install-guide-title" className="text-xl">
              {variant === "mac" ? "Add to Dock" : "Add to Home Screen"}
            </h2>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="-mt-2 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground"
            >
              <Icon name="close" />
            </button>
          </div>
          <ol className="mt-4 space-y-4 text-sm">{variant === "mac" ? <MacSteps /> : <IosSteps variant={variant} />}</ol>
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
            {variant === "mac" ? "It then opens in its own window from the Dock, Spotlight or your Applications folder." : "It then opens from your Home Screen like an app."}{" "}
            Guides and maps you&apos;ve viewed work without signal.
          </p>
        </div>
        {variant === "iphone" && <Arrow />}
      </div>
    </div>
  );
}

function IosSteps({ variant }: { variant: Exclude<Variant, "mac"> }) {
  return (
    <>
      {variant === "iphone" ? (
        <Step n={1}>
          <p>Open Safari&apos;s Share menu. How depends on where your address bar is:</p>
          <div className="mt-2 divide-y divide-border rounded-md border border-border">
            <Layout bar="top">
              <b>Address bar at the top</b>
              <br />
              Tap <Ui icon="share">Share</Ui> in the toolbar at the bottom of the screen.
            </Layout>
            <Layout bar="bottom">
              <b>Address bar at the bottom</b>
              <br />
              Touch and hold the address bar, then tap <Ui icon="share">Share</Ui>.
            </Layout>
          </div>
        </Step>
      ) : variant === "ipad" ? (
        <Step n={1}>
          Tap <Ui icon="share">Share</Ui> at the top right of Safari.
        </Step>
      ) : (
        <Step n={1}>
          Open your browser&apos;s <Ui icon="share">Share</Ui> menu. If Add to Home Screen isn&apos;t offered, open this page in Safari.
        </Step>
      )}
      <Step n={2}>
        <p>
          Tap <Ui icon="addSquare">Add to Home Screen</Ui>.
        </p>
        <p className="mt-1 text-muted">
          Not in the list? Tap <b className="text-foreground">View More</b> under Add to Favorites, and it&apos;s there.
        </p>
      </Step>
      <Step n={3}>
        Tap <b>Add</b>.
      </Step>
    </>
  );
}

function MacSteps() {
  return (
    <>
      <Step n={1}>
        <p>
          In the menu bar at the top of the screen, choose <b className="whitespace-nowrap">File › Add to Dock…</b>
        </p>
        {/* A sketch of the menu, so the item is easy to spot. */}
        <div aria-hidden className="mt-2 w-48 overflow-hidden rounded-md border border-border text-xs">
          <p className="bg-surface px-3 py-1 font-semibold">File</p>
          <p className="px-3 py-1 text-muted">New Window</p>
          <p className="px-3 py-1 text-muted">…</p>
          <p className="bg-sea px-3 py-1 font-medium text-on-sea">Add to Dock…</p>
        </div>
        <p className="mt-2 text-muted">
          Or click <Ui icon="share">Share</Ui> in Safari&apos;s toolbar, then <b className="text-foreground">Add to Dock</b>.
        </p>
      </Step>
      <Step n={2}>
        Keep or change the name, then click <b>Add</b>.
      </Step>
      <p className="text-xs text-muted">Needs macOS Sonoma 14 or later.</p>
    </>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="w-4 shrink-0 font-mono text-base leading-5 font-semibold text-sea">{n}</span>
      <div className="min-w-0 flex-1 leading-5">{children}</div>
    </li>
  );
}

/** A browser control named the way the browser shows it, with its symbol. */
function Ui({ icon, children }: { icon: "share" | "addSquare"; children: ReactNode }) {
  return (
    <b className="whitespace-nowrap">
      {children}
      <Icon name={icon} className="ml-1 inline size-4 -translate-y-px align-middle" />
    </b>
  );
}

/** One iPhone Safari layout, with a sketch of a phone marking the part to tap. */
function Layout({ bar, children }: { bar: "top" | "bottom"; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <svg viewBox="0 0 20 32" className="h-10 w-auto shrink-0 text-muted" fill="none" aria-hidden>
        <rect x="1" y="1" width="18" height="30" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
        {bar === "top" && <rect x="4" y="4.5" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.5" />}
        {/* Top layout: the toolbar with Share. Bottom layout: the address bar. Either way, the target. */}
        <rect x="4" y="24.5" width="12" height="3" rx="1.5" className="fill-sea" />
      </svg>
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  );
}

/** Points past the page's edge, toward the browser control to use first. */
function Arrow({ up = false, className = "" }: { up?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 48"
      className={`my-1 h-14 w-7 shrink-0 text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)] motion-safe:animate-bounce ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={up ? "M12 45V5m-8 8 8-8 8 8" : "M12 3v40m-8-8 8 8 8-8"} />
    </svg>
  );
}
