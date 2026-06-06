export const dynamic = "force-static";

import { getAllPostRoutes } from "@/lib/content-manifest.mjs";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostRoutes();
  const latest = posts.reduce((max, p) => {
    const ts = new Date(p.lastModified || p.date || 0).getTime();
    return Number.isFinite(ts) ? Math.max(max, ts) : max;
  }, 0);
  const latestDate = latest > 0 ? new Date(latest) : new Date();
  return [
    { url: `${SITE_URL}/blog`, lastModified: latestDate, changeFrequency: "daily", priority: 0.9 },
    ...posts.map(p => ({
      url: p.url,
      lastModified: new Date(p.lastModified || p.date || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
