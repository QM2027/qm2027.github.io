"use client";

import { Icon } from "@/components/Icon";
import { setPref } from "@/lib/edition-script";
import { SITE } from "@/lib/site";

/**
 * Not dismissible in a browser tab: this guide may stop being maintained, and visitors must still
 * see the warning then. The installed app has a close button, for people who have read it and use
 * the app daily; it sets the same remembered switch as `?notice=off` (`?notice=on` brings it back).
 */
export function DevNotice() {
  return (
    <div role="note" className="dev-notice shrink-0 bg-alert text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 lg:px-8">
        <p className="guide-only flex-1 py-2.5 text-sm font-medium">
          <strong className="font-semibold uppercase tracking-wide">Not fully developed.</strong> Information here may be
          incomplete or out of date. Always cross-check with the{" "}
          <a href={SITE.indico} target="_blank" rel="noreferrer" className="font-semibold underline">
            official Indico site
          </a>
          .
        </p>
        <p className="app-only flex-1 py-2.5 text-sm font-medium">
          <strong className="font-semibold uppercase tracking-wide">Preview.</strong> The conference-app edition, under
          discussion and not fully developed.{" "}
          {/* A full load, so the inline script applies the switch. */}
          <a href="?edition=guide" className="font-semibold underline">
            Back to the visitor guide
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            document.documentElement.setAttribute("data-notice", "off");
            setPref("notice", "off");
          }}
          aria-label="Hide this notice"
          className="-mr-2 hidden size-10 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white standalone:flex"
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
}
