"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDES } from "@/data/guides";
import { PageTitle } from "./PageTitle";

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
    <header>
      {/* Cancel the page's top padding so the tabs sit right under the site bar, as on the map. */}
      <GuideNav className="-mt-6 sm:-mt-10" />
      <PageTitle kicker={kicker} title={title} className="mt-8" />
      {children && <div className="mt-3 max-w-3xl text-muted">{children}</div>}
    </header>
  );
}
