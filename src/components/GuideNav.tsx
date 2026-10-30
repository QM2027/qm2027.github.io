"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDES } from "@/data/guides";

export function GuideNav() {
  const pathname = usePathname();
  const links = [{ href: "/explore/", title: "Map" }, ...GUIDES];

  return (
    <nav aria-label="Guides" className="-mx-4 flex gap-5 overflow-x-auto border-b border-border px-4 [scrollbar-width:none]">
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
      <GuideNav />
      <p className="mt-8 font-mono text-xs tracking-widest text-muted uppercase">{kicker}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-3xl text-muted">{children}</div>}
    </header>
  );
}
