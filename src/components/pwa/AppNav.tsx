"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import mark from "@/assets/brand/qm2027-mark.png";
import { Icon } from "@/components/Icon";
import { GUIDES } from "@/data/guides";
import { NAV, NAV_APP, SITE, type NavItem } from "@/lib/site";
import { useViewportPin } from "./viewport";

const trim = (path: string) => path.replace(/\/$/, "") || "/";

export function isActive(pathname: string, href: string) {
  return href === "/" ? trim(pathname) === "/" : trim(pathname).startsWith(trim(href));
}

/** Also true on the paths a tab stands for (the app edition's Jeju tab covers the map and travel pages). */
export const isActiveItem = (pathname: string, item: NavItem) =>
  isActive(pathname, item.href) || !!item.also?.some((href) => isActive(pathname, href));

/** The tabs of the edition being shown; read at event time, after the preview script has run. */
const currentNav = (): readonly NavItem[] => (document.documentElement.dataset.edition === "app" ? NAV_APP : NAV);

const TITLES: Record<string, string> = {
  ...Object.fromEntries(NAV.map((n) => [trim(n.href), n.label])),
  ...Object.fromEntries(GUIDES.map((g) => [trim(g.href), g.title])),
  "/": `${SITE.shortName} Jeju`,
  "/getting-there": "Airport to venue",
  "/jeju": "Jeju",
  "/info": "Information",
};

/** What the installed app's title bar shows, and where its back button leads (none on a tab's own page). */
export function screenOf(pathname: string) {
  const path = trim(pathname);
  const isTab = [...NAV, ...NAV_APP].some((n) => trim(n.href) === path);
  const parent = path.split("/").slice(0, -1).join("/") || "/";
  return {
    title: TITLES[path] ?? SITE.shortName,
    back: isTab ? undefined : parent === "/" ? "/" : `${parent}/`,
  };
}

/** Re-tapping the tab you're on scrolls back to the top, as in native apps. */
function onTabClick(pathname: string, href: string) {
  if (trim(pathname) === trim(href)) window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Navigation for the installed app only (both are hidden in a browser tab, which keeps the site's
 * own header menu): a tab bar at the bottom on phones, an icon rail on the left on wide windows.
 * Pure CSS decides which one shows, so nothing flashes while the page hydrates.
 */
export function AppNav() {
  const pathname = usePathname();
  useTabShortcuts();
  useViewportPin();

  return (
    <>
      <nav
        aria-label="Sections"
        className="app-chrome pin-bottom fixed inset-x-0 bottom-0 z-[950] hidden border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur standalone:max-lg:block"
      >
        <ul className="guide-only mx-auto grid h-(--tabbar) max-w-xl grid-cols-5">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => onTabClick(pathname, item.href)}
                aria-current={isActiveItem(pathname, item) ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-0.5 text-[11px] text-muted active:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              >
                <Icon name={item.icon} className="size-6" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="app-only mx-auto grid h-(--tabbar) max-w-xl grid-cols-5">
          {NAV_APP.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => onTabClick(pathname, item.href)}
                aria-current={isActiveItem(pathname, item) ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-0.5 text-[11px] text-muted active:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              >
                <Icon name={item.icon} className="size-6" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-label="Sections"
        className="app-chrome fixed inset-y-0 left-0 z-[1010] hidden w-(--rail) flex-col items-center border-r border-border bg-background py-3 standalone:lg:flex"
      >
        <Link href="/" className="mb-4 flex size-12 items-center justify-center" title={SITE.guideName}>
          <Image src={mark} alt="Quark Matter 2027, home" loading="eager" className="h-auto w-11" />
        </Link>
        <ul className="guide-only flex flex-col gap-1">
          {NAV.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => onTabClick(pathname, item.href)}
                aria-current={isActiveItem(pathname, item) ? "page" : undefined}
                title={`${item.label} (${i + 1})`}
                className="flex w-16 flex-col items-center gap-1 rounded-md py-2 text-[11px] text-muted hover:bg-surface hover:text-foreground aria-[current=page]:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="app-only flex flex-col gap-1">
          {NAV_APP.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => onTabClick(pathname, item.href)}
                aria-current={isActiveItem(pathname, item) ? "page" : undefined}
                title={`${item.label} (${i + 1})`}
                className="flex w-16 flex-col items-center gap-1 rounded-md py-2 text-[11px] text-muted hover:bg-surface hover:text-foreground aria-[current=page]:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={SITE.indico}
          target="_blank"
          rel="noreferrer"
          title="Official site on Indico"
          className="mt-auto flex w-16 flex-col items-center gap-1 rounded-md py-2 text-[11px] text-muted hover:bg-surface hover:text-foreground"
        >
          <Icon name="external" className="size-5" />
          Indico
        </a>
      </nav>
    </>
  );
}

/** In the installed app, keys 1–5 switch sections (not while typing, and not with modifier keys). */
function useTabShortcuts() {
  const router = useRouter();
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    function onKey(e: KeyboardEvent) {
      if (!standalone.matches || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
      if (document.querySelector("[role=dialog], [aria-modal=true]")) return;
      const item = currentNav()[Number(e.key) - 1];
      if (!item) return;
      e.preventDefault();
      router.push(item.href);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);
}
