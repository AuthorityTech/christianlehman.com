export const dynamic = "force-static";
import { getAllPosts } from "@/lib/posts";
import type { MetadataRoute } from "next";

const BASE = "https://christianlehman.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPostTimestamp = posts.reduce((max, post) => {
    const ts = new Date(post.lastModified || post.date || 0).getTime();
    return Number.isFinite(ts) ? Math.max(max, ts) : max;
  }, 0);
  const latestPostDate = latestPostTimestamp > 0 ? new Date(latestPostTimestamp) : new Date();

  const postEntries = posts.map((p) => ({
    url: BASE + "/blog/" + p.slug,
    lastModified: new Date(p.lastModified || p.date || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));
  return [
    { url: BASE, lastModified: latestPostDate, changeFrequency: "weekly", priority: 1.0 },
    { url: BASE + "/blog", lastModified: latestPostDate, changeFrequency: "daily", priority: 0.9 },
    ...postEntries,
  ];
}