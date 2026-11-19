// Class sets for the plain look (?look=plain, see src/lib/edition-script.ts), shared where several
// components change the same way. Each is added beside the current classes and only acts in plain.

/** A boxed panel (rounded, filled, padded) opens up into a section under a rule, as on the home
 *  page, so whatever it holds is the only box: one layer of containment instead of cards in cards. */
export const PLAIN_OPEN_PANEL =
  "plain:rounded-none plain:border-0 plain:border-t plain:border-foreground plain:bg-transparent plain:p-0 plain:pt-3";

/** A tile inside a panel that was filled with the page background: fill it with the surface
 *  instead, since the panel around it no longer is. */
export const PLAIN_TILE = "plain:bg-surface";
