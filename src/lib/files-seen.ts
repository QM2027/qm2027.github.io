"use client";

import { useCallback, useMemo } from "react";
import type { Material, Materials } from "./program";
import { useLocalString } from "./use-local-set";

// Which files a visitor has seen, per contribution, so the program can mark new and replaced
// slides or posters. Indico doesn't allow cross-origin requests, so the site can't probe the
// files themselves; program-data's materials list (with each file's modified time) is the source.

const KEY = "qm2027:files-seen";

/** Contribution id → file url → its modified time when seen ("" if Indico gave none). */
type Seen = Record<string, Record<string, string>>;

export type FileFlag = "new" | "updated" | undefined;

/** Nothing to compare with until the visitor has seen the contribution's files once. */
export function fileFlag(seen: Record<string, string> | undefined, f: Material): FileFlag {
  if (!seen) return undefined;
  if (!(f.url in seen)) return "new";
  const was = seen[f.url];
  return was && f.modified && was !== f.modified ? "updated" : undefined;
}

const parse = (raw: string | null | undefined): Seen => {
  try {
    return raw ? (JSON.parse(raw) as Seen) : {};
  } catch {
    return {};
  }
};

export function useFilesSeen() {
  const [raw, setRaw] = useLocalString(KEY);
  const seen = useMemo(() => parse(raw), [raw]);

  /** Record these files as seen for this contribution. */
  const mark = useCallback(
    (id: string, files: Material[]) => {
      const current = parse(raw);
      const next = Object.fromEntries(files.map((f) => [f.url, f.modified ?? ""]));
      if (JSON.stringify(current[id]) === JSON.stringify(next)) return;
      setRaw(JSON.stringify({ ...current, [id]: next }));
    },
    [raw, setRaw],
  );

  return { seen, mark };
}

/** Saved contributions whose files are new or replaced since the visitor last looked. */
export function changedFiles(ids: Iterable<string>, materials: Materials | undefined, seen: Seen): Set<string> {
  const out = new Set<string>();
  if (!materials) return out;
  for (const id of ids) if (materials[id]?.some((f) => fileFlag(seen[id], f))) out.add(id);
  return out;
}
