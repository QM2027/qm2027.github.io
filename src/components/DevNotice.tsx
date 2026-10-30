import { SITE } from "@/lib/site";

/** Not dismissible: this guide may stop being maintained, and visitors must still see the warning then. */
export function DevNotice() {
  return (
    <div role="note" className="shrink-0 bg-alert text-white">
      <p className="mx-auto max-w-7xl px-4 py-2.5 text-sm font-medium lg:px-8">
        <strong className="font-semibold uppercase tracking-wide">Not fully developed.</strong> Information here may be
        incomplete or out of date. Always cross-check with the{" "}
        <a href={SITE.indico} target="_blank" rel="noreferrer" className="font-semibold underline">
          official Indico site
        </a>
        .
      </p>
    </div>
  );
}
