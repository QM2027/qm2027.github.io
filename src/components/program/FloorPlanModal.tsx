"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { FloorPlan, KindTag, Legend } from "@/components/venue/FloorPlan";
import { DEFAULT_FLOOR, FLOORS } from "@/data/venue";

/**
 * The floor plan over the program, so checking a room never leaves the page. Opens on the
 * room's floor with the room selected; other rooms and floors can be tapped around.
 */
export function FloorPlanModal({ roomId, onClose }: { roomId?: string; onClose: () => void }) {
  const home = FLOORS.find((f) => f.rooms.some((r) => r.id === roomId)) ?? FLOORS.find((f) => f.id === DEFAULT_FLOOR) ?? FLOORS[0];
  const [floorId, setFloorId] = useState(home.id);
  const [selected, setSelected] = useState(roomId);
  const floor = FLOORS.find((f) => f.id === floorId) ?? home;
  const room = floor.rooms.find((r) => r.id === selected);

  useEffect(() => {
    // Capture phase, so Escape closes only the map and not the contribution panel under it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Floor plan"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:max-w-2xl sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Brand look: the room first, where it is underneath. */}
          <div className="brand:flex brand:flex-col-reverse">
            <p className="text-xs font-medium uppercase tracking-wide text-muted brand:text-sm">ICC Jeju · {floor.label}</p>
            <h2 className="text-lg font-semibold">{room?.name ?? "Floor plan"}</h2>
          </div>
          <button onClick={onClose} aria-label="Close floor plan" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-3 flex gap-2" role="group" aria-label="Floor">
          {FLOORS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFloorId(f.id)}
              aria-pressed={f.id === floor.id}
              className="min-h-10 rounded-md border border-border px-4 text-sm aria-pressed:border-sea aria-pressed:bg-sea aria-pressed:text-on-sea"
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-3 overflow-hidden rounded-md border border-border bg-surface p-2">
          <FloorPlan floor={floor} selected={room?.id} highlight={null} onSelect={setSelected} spotlight />
        </div>
        <div className="mt-2">
          <Legend />
        </div>

        {room && (
          <div className="mt-3 text-sm">
            <KindTag kind={room.kind}>
              {room.estimated && <span className="ml-1 font-medium normal-case text-muted">planned</span>}
            </KindTag>
            {room.note && <p className="mt-1 leading-relaxed">{room.note}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
