import type { MetadataRoute } from "next";
import { withBase } from "@/lib/paths";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.guideName,
    short_name: "QM2027 Jeju",
    description: `Offline visitor guide to Jeju for ${SITE.name} participants.`,
    id: withBase("/"),
    start_url: withBase("/"),
    scope: withBase("/"),
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111111",
    icons: [
      // New file names when the artwork changes: the service worker serves /icons/ cache-first.
      { src: withBase("/icons/qm2027-192.png"), sizes: "192x192", type: "image/png" },
      { src: withBase("/icons/qm2027-512.png"), sizes: "512x512", type: "image/png" },
      { src: withBase("/icons/qm2027-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Long-press the app icon (Android) or right-click it in the dock/taskbar (desktop).
    shortcuts: [
      { name: "Program Book", short_name: "Program", url: withBase("/program/") },
      { name: "My schedule", short_name: "Mine", url: withBase("/program/?view=mine") },
      { name: "Map of Jeju", short_name: "Map", url: withBase("/explore/") },
      { name: "Venue plan", short_name: "Venue", url: withBase("/venue/") },
    ],
  };
}
