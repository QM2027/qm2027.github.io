/**
 * A page's h1 and the short line that introduces it. Current look: the line sits above the title
 * in mono caps. Plain look (?look=plain): a small label announcing a heading is the most common tell
 * of generated pages, so the line moves under the title as a subtitle in the body face, with commas
 * in place of middle dots. `className` spaces the block from what comes before it.
 */
export function PageTitle({
  kicker,
  plainKicker,
  title,
  className = "",
}: {
  kicker: string;
  /** Wording for the plain look, when the kicker does not read as a subtitle. */
  plainKicker?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-mono text-xs tracking-widest text-muted uppercase plain:hidden">{kicker}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl plain:mt-0">{title}</h1>
      <p className="mt-1 hidden text-lg text-muted plain:block">{plainKicker ?? kicker.replaceAll(" · ", ", ")}</p>
    </div>
  );
}
