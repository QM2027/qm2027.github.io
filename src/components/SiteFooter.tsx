"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  // The explore map fills the viewport; a footer under it would only add scrolling.
  const pathname = usePathname();
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/explore") return null;

  // The installed app keeps the disclaimer on Home only; elsewhere a footer reads as a web page.
  return (
    <footer className={`mt-auto border-t border-border ${path === "/" ? "" : "standalone:hidden"}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted lg:px-8">
        <p>
          {SITE.guideName} is a companion travel guide prepared by the {SITE.shortName} organizing committee. For
          registration, the program, deadlines and official announcements, see the{" "}
          <a href={SITE.indico} target="_blank" rel="noreferrer" className="text-sea underline">
            official Indico site
          </a>
          , which takes precedence if anything here differs.
        </p>
        <p className="mt-2 text-xs">
          Travel details (fares, opening hours, seasons) are for orientation only. Check them before you go. Map data ©
          OpenStreetMap contributors.
        </p>
        <p className="mt-4 border-t border-border pt-4 text-xs">
          Minjae Isaac Kwon (Università degli Studi di Torino) as QM2027 LOC Member / Built with AI - Claude Opus 5.5
        </p>
      </div>
    </footer>
  );
}
