import type { MetadataRoute } from "next";
import { withBase } from "@/lib/paths";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.guideName,
    short_name: "QM2027 Jeju",
    description: `Offline visitor guide to Jeju for ${SITE.name} participants.`,
    start_url: withBase("/"),
    scope: withBase("/"),
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#0e7490",
    icons: [
      { src: withBase("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: withBase("/icons/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: withBase("/icons/maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
