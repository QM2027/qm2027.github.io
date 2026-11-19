/**
 * Brand look (?look=brand): a field of the logo's blue behind a block inside a page's padded
 * <main>, running the full width of the window. See field-bleed and field-ink in globals.css.
 */
export const BRAND_FIELD = "brand:bg-brand-field brand:field-bleed brand:field-ink";

/**
 * A page's h1 and the short line that introduces it. Current look: the line sits above the title
 * in mono caps. Plain look (?look=plain): a small label announcing a heading is the most common tell
 * of generated pages, so the line moves under the title as a subtitle in the body face, with commas
 * in place of middle dots. Brand look: as plain, on the blue field; the block cancels the page's
 * top padding (py-6 sm:py-10, as on every page that uses it) so the field meets the site bar.
 * `className` spaces the block from what comes before it.
 */
export function PageTitle({
  kicker,
  plainKicker,
  title,
  className = "",
  brandField = true,
}: {
  kicker: string;
  /** Wording for the plain look, when the kicker does not read as a subtitle. */
  plainKicker?: string;
  title: string;
  className?: string;
  /** Brand look: lay the blue field behind the title. False when the caller lays it (GuideHeader). */
  brandField?: boolean;
}) {
  const field = brandField
    ? `${BRAND_FIELD} brand:-mt-6 brand:mb-10 brand:pt-10 brand:pb-10 sm:brand:-mt-10 sm:brand:pt-14 lg:brand:mb-12 lg:brand:pt-16 lg:brand:pb-14`
    : "";
  return (
    <div className={[className, field].filter(Boolean).join(" ")}>
      <p className="font-mono text-xs tracking-widest text-muted uppercase plain:hidden">{kicker}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl plain:mt-0 brand:text-4xl brand:leading-[1.05] sm:brand:text-5xl">{title}</h1>
      <p className="mt-1 hidden text-lg text-muted plain:block brand:mt-3">{plainKicker ?? kicker.replaceAll(" · ", ", ")}</p>
    </div>
  );
}
