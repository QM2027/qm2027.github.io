import { SITE } from "@/lib/site";

/**
 * Not dismissible: this guide may stop being maintained, and visitors must still see the warning then.
 * `?notice=off` hides it for demos and screenshots (remembered; `?notice=on` brings it back).
 */
export function DevNotice() {
  return (
    <div role="note" className="dev-notice shrink-0 bg-alert text-white">
      <p className="guide-only mx-auto max-w-7xl px-4 py-2.5 text-sm font-medium lg:px-8">
        <strong className="font-semibold uppercase tracking-wide">Not fully developed.</strong> Information here may be
        incomplete or out of date. Always cross-check with the{" "}
        <a href={SITE.indico} target="_blank" rel="noreferrer" className="font-semibold underline">
          official Indico site
        </a>
        .
      </p>
      <p className="app-only mx-auto max-w-7xl px-4 py-2.5 text-sm font-medium lg:px-8">
        <strong className="font-semibold uppercase tracking-wide">Preview.</strong> The conference-app edition, under
        discussion and not fully developed.{" "}
        {/* A full load, so the inline script applies the switch. */}
        <a href="?edition=guide" className="font-semibold underline">
          Back to the visitor guide
        </a>
      </p>
    </div>
  );
}
