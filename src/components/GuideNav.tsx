"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDES } from "@/data/guides";
import { BRAND_FIELD, PageTitle } from "./PageTitle";

export function GuideNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const links = [{ href: "/explore/", title: "Map" }, ...GUIDES];

  return (
    <nav aria-label="Guides" className={`-mx-4 flex gap-5 overflow-x-auto border-b border-border px-4 [scrollbar-width:none] ${className}`}>
      {links.map((g) => (
        <Link
          key={g.href}
          href={g.href}
          aria-current={pathname === g.href.replace(/\/$/, "") || pathname === g.href ? "page" : undefined}
          className="flex min-h-10 shrink-0 items-center border-b-2 border-transparent px-1 text-sm text-muted hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground"
        >
          {g.title}
        </Link>
      ))}
    </nav>
  );
}

export function GuideHeader({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    // Brand look: the tabs, title and introduction share one blue field; the header takes over
    // cancelling the page's top padding, and keeps a sliver above the tabs for their focus ring.
    <header
      className={`${BRAND_FIELD} brand:-mt-6 brand:mb-12 brand:pt-1 brand:pb-10 sm:brand:-mt-10 lg:brand:mb-14 lg:brand:pb-14`}
    >
      {/* Cancel the page's top padding so the tabs sit right under the site bar, as on the map. */}
      <GuideNav className="-mt-6 sm:-mt-10 brand:mt-0 brand:border-brand-field-muted/40 sm:brand:mt-0" />
      <PageTitle kicker={kicker} title={title} brandField={false} className="mt-8 brand:mt-10 lg:brand:mt-14" />
      {children && <div className="mt-3 max-w-3xl text-muted brand:mt-5">{children}</div>}
    </header>
  );
}
