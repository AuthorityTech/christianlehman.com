export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { getStaticSiteRoutes } from "@/lib/content-manifest.mjs";

export default function sitemap(): MetadataRoute.Sitemap {
  return getStaticSiteRoutes().map((route) => ({
    url: route.url,
    lastModified: new Date(route.lastModified || Date.now()),
    changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: Number(route.priority),
  }));
}
