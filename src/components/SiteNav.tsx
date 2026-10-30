"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/site";
import { Icon } from "./Icon";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
}

/** Top bar on tablet/desktop, bottom tab bar on phones. */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-baseline gap-2 font-semibold tracking-tight">
            <span><span className="text-sea">QM</span>2027</span>
            <span className="text-sm font-normal text-muted">Jeju Visitor Guide</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground aria-[current=page]:bg-sea aria-[current=page]:text-on-sea"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={SITE.indico}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-sea"
            >
              Official site <Icon name="external" className="size-4" />
            </a>
          </nav>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid h-[var(--tab-height)] grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-[10px] leading-tight text-center ${
                    active ? "text-sea" : "text-muted"
                  }`}
                >
                  <Icon name={item.icon} className="size-6" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
