import type { MetadataRoute } from "next";
import { GUIDES } from "@/data/guides";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const PATHS = ["/", "/explore/", "/venue/", "/travel/", "/getting-there/", "/program/", ...GUIDES.map((g) => g.href)];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
