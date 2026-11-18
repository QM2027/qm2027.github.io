"use client";

import "katex/dist/katex.min.css";
import { Fragment, useEffect, useMemo, useSyncExternalStore } from "react";

// Titles and abstracts from Indico use TeX: $p_T$, $\sqrt{s_{NN}}$, \( … \), $$ … $$. KaTeX is
// loaded on first use only, and text without maths never waits for it: until KaTeX arrives (or
// if it fails), the source text is shown as is. KaTeX output is safe for untrusted input with
// its defaults (`trust: false`). TeX that doesn't parse is shown as source.

type Katex = typeof import("katex").default;

let katex: Katex | undefined;
let loading: Promise<void> | undefined;
const listeners = new Set<() => void>();

function load() {
  loading ??= import("katex")
    .then((m) => {
      katex = m.default;
      listeners.forEach((l) => l());
    })
    .catch(() => {});
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// Display maths first, then inline. A single `$` needs a non-space right inside both
// delimiters, so prices like "$5 and $10" stay text.
const MATH = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^\s$](?:[^$\n]{0,300}?[^\s$\\])?)\$/g;

const hasMath = (s: string) => s.includes("$") || s.includes("\\(") || s.includes("\\[");

type Part = string | { html: string; display: boolean };

function render(k: Katex, text: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const m of text.matchAll(MATH)) {
    const display = m[1] !== undefined || m[2] !== undefined;
    const tex = m[1] ?? m[2] ?? m[3] ?? m[4] ?? "";
    if (m.index > last) parts.push(text.slice(last, m.index));
    try {
      parts.push({ html: k.renderToString(tex, { displayMode: display, throwOnError: true, strict: "ignore" }), display });
    } catch {
      parts.push(m[0]); // malformed TeX on Indico (about 1 in 400 in QM2025): keep the source
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Text that may contain TeX maths. */
export function TeX({ text }: { text: string }) {
  const math = hasMath(text);
  const k = useSyncExternalStore(subscribe, () => katex, () => undefined);
  useEffect(() => {
    if (math) load();
  }, [math]);
  const parts = useMemo(() => (math && k ? render(k, text) : undefined), [math, k, text]);

  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <span key={i} className={p.display ? "my-2 block overflow-x-auto" : undefined} dangerouslySetInnerHTML={{ __html: p.html }} />
        ),
      )}
    </>
  );
}
