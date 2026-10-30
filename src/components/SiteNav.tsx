"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { Icon } from "./Icon";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
}

/** Top bar links on tablet/desktop, hamburger menu on phones. */
export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg font-semibold">QM2027</span>
          <span className="font-mono text-xs tracking-wider text-muted uppercase">Jeju visitor guide</span>
        </Link>
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

      {menuOpen && (
        <nav id="site-menu" aria-label="Menu" className="border-t border-border bg-background md:hidden">
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
