"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDES } from "@/data/guides";

export function GuideNav() {
  const pathname = usePathname();
  const links = [{ href: "/explore/", emoji: "🗺️", title: "Map" }, ...GUIDES];

  return (
    <nav aria-label="Guides" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {links.map((g) => (
        <Link
          key={g.href}
          href={g.href}
          aria-current={pathname === g.href.replace(/\/$/, "") || pathname === g.href ? "page" : undefined}
          className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm aria-[current=page]:border-sea aria-[current=page]:bg-sea aria-[current=page]:text-on-sea"
        >
          <span aria-hidden>{g.emoji}</span>
          {g.title}
        </Link>
      ))}
    </nav>
  );
}

export function GuideHeader({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <header>
      <GuideNav />
      <p className="mt-6 text-sm font-medium text-sea">{kicker}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-3xl text-muted">{children}</div>}
    </header>
  );
}
