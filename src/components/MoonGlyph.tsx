const SYNODIC = 29.530588853;

/**
 * Moon phase drawn from its age: the lit part is bounded by the limb and a terminator
 * ellipse whose width follows cos(phase angle). Waxing is lit on the right (northern hemisphere).
 */
export function MoonGlyph({ age, label, className }: { age: number; label: string; className?: string }) {
  const phase = (age / SYNODIC) * 2 * Math.PI;
  const waxing = age < SYNODIC / 2;
  const r = 10;
  const k = Math.cos(phase) * r; // terminator half-width; > 0 means crescent, < 0 gibbous
  const limb = waxing ? 1 : 0; // sweep for the lit limb side
  const lit = `M12,${12 - r} A${r},${r} 0 0 ${limb} 12,${12 + r} A${Math.abs(k)},${r} 0 0 ${(k > 0) === waxing ? 0 : 1} 12,${12 - r} Z`;

  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label={label}>
      <title>{label}</title>
      <circle cx="12" cy="12" r={r} fill="var(--border)" />
      <path d={lit} fill="currentColor" />
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeOpacity="0.4" />
    </svg>
  );
}
