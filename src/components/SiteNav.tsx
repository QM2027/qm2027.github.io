"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { Icon } from "./Icon";
import { isActive, screenOf } from "./pwa/AppNav";
import { install, useInstall } from "./pwa/install";
import { applyUpdate, useUpdate } from "./pwa/update";

/**
 * In a browser: top bar links on tablet/desktop, hamburger menu on phones.
 * In the installed app: a title bar with a back button, since sections live in the app's own nav.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { mode: installMode } = useInstall();
  const update = useUpdate();
  // After "Later" on the update banner, a small Update button stays in the bar until it is used.
  const updateLater = update.ready && update.dismissed;

  // Escape closes the menu; widening past md hides it, so reset it there too.
  useEffect(() => {
    if (!menuOpen) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", close);
    };
  }, [menuOpen]);

  return (
    <header className="app-chrome sticky top-0 z-[1000] border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <AppTitleBar pathname={pathname} updateLater={updateLater} />
      <div className="mx-auto flex h-14 standalone:hidden max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg font-semibold">QM2027</span>
          {/* Narrow phones can't fit the subtitle beside the Install button. */}
          <span className={`font-mono text-xs tracking-wider text-muted uppercase ${installMode || updateLater ? "max-[399px]:hidden" : ""}`}>
            Jeju visitor guide
          </span>
        </Link>
        <div className="flex h-full items-center gap-2 md:gap-6">
          <nav className="hidden h-full items-stretch gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="flex items-center border-b-2 border-transparent text-sm text-muted hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={SITE.indico}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
            >
              Official site <Icon name="external" className="size-4" />
            </a>
          </nav>
          {/* A pending update takes the Install button's place; installing can wait a visit. */}
          {updateLater ? (
            <UpdateButton />
          ) : installMode && (
            <button
              type="button"
              onClick={() => install()}
              className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-surface"
            >
              <Icon name="download" className="size-4" />
              {/* Icon only between md and lg, where the nav links already fill the bar. */}
              <span className="md:max-lg:sr-only">
                Install<span className="max-md:hidden">&nbsp;app</span>
              </span>
            </button>
          )}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="-mr-2 flex size-11 items-center justify-center text-foreground md:hidden"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="size-6" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="site-menu" aria-label="Menu" className="border-t border-border bg-background md:hidden standalone:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="flex items-center gap-3 py-3 text-muted hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:font-medium"
                >
                  <Icon name={item.icon} className="size-5" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-border">
              <a
                href={SITE.indico}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 py-3 text-muted hover:text-foreground"
              >
                <Icon name="external" className="size-5" />
                Official site
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/**
 * Pages open with their own large heading, so the app's title bar starts empty and takes the
 * heading's text only once it has scrolled up under the bar (as native apps do). Pages without one
 * (the Explore map) show the section name straight away.
 */
function useCollapsedTitle(pathname: string) {
  const [seen, setSeen] = useState<{ path: string; shown: boolean; text?: string }>();

  useEffect(() => {
    const h1 = document.querySelector("main h1");
    const header = document.querySelector("header");
    if (!h1 || !header) {
      const id = requestAnimationFrame(() => setSeen({ path: pathname, shown: true }));
      return () => cancelAnimationFrame(id);
    }
    const text = h1.textContent?.trim();
    const top = Math.round(header.getBoundingClientRect().height);
    const observer = new IntersectionObserver(
      ([e]) => setSeen({ path: pathname, text, shown: !e.isIntersecting && e.boundingClientRect.top < top }),
      { rootMargin: `-${top}px 0px 0px 0px` },
    );
    observer.observe(h1);
    return () => observer.disconnect();
  }, [pathname]);

  // Until measured, guess from the route so the bar doesn't flash a title over the heading.
  if (seen?.path !== pathname) return { shown: pathname.replace(/\/$/, "") === "/explore", text: undefined };
  return seen;
}

/** Applies a new version the visitor put off with "Later". */
function UpdateButton() {
  const { updating } = useUpdate();
  return (
    <button
      type="button"
      onClick={applyUpdate}
      disabled={updating}
      aria-label="Update to the new version"
      className="relative flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-surface disabled:opacity-75"
    >
      <Icon name="refresh" className={updating ? "size-4 animate-spin" : "size-4"} />
      {updating ? "Updating…" : "Update"}
      {/* The one accent: marks it as pending, like a notification badge. */}
      <span aria-hidden className="absolute -top-1 -right-1 size-2.5 rounded-full bg-tangerine ring-2 ring-background" />
    </button>
  );
}

function AppTitleBar({ pathname, updateLater }: { pathname: string; updateLater: boolean }) {
  const router = useRouter();
  const screen = screenOf(pathname);
  const { back } = screen;
  const collapsed = useCollapsedTitle(pathname);
  // Home's heading is the dates, not a name; elsewhere echo the heading the bar replaces.
  const title = (pathname !== "/" && collapsed.text) || screen.title;
  // While the title fades out, keep the words that were showing: after a navigation the new page's
  // heading isn't measured yet, and swapping the text mid-fade flashes the wrong name.
  const [lastShown, setLastShown] = useState(title);
  if (collapsed.shown && lastShown !== title) setLastShown(title);
  const shownTitle = collapsed.shown ? title : lastShown;

  function goBack() {
    if (!back) return;
    // Launched straight into a sub-page (from a shortcut or link) there is nothing to go back to.
    const nav = (window as Window & { navigation?: { canGoBack?: boolean } }).navigation;
    if (nav?.canGoBack ?? window.history.length > 1) router.back();
    else router.push(back);
  }

  return (
    <div className="mx-auto hidden h-12 max-w-7xl items-center gap-1 px-2 standalone:flex lg:px-6">
      {back ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-foreground active:bg-surface lg:hover:bg-surface"
        >
          <Icon name="chevron" className="size-6 rotate-180" />
        </button>
      ) : (
        <span className="w-2 shrink-0" />
      )}
      <p
        aria-hidden={!collapsed.shown}
        className={`min-w-0 truncate text-base font-semibold transition-opacity duration-150 ${collapsed.shown ? "" : "opacity-0"}`}
      >
        {shownTitle}
      </p>
      {updateLater && (
        <div className="ml-auto pl-2 pr-2">
          <UpdateButton />
        </div>
      )}
    </div>
  );
}
