export const dynamic = "force-static";

import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

function latestPostDate(posts: ReturnType<typeof getAllPosts>): Date {
  const latest = posts.reduce((max, post) => {
    const timestamp = new Date(post.lastModified || post.date || 0).getTime();
    return Number.isFinite(timestamp) ? Math.max(max, timestamp) : max;
  }, 0);
  return latest > 0 ? new Date(latest) : new Date();
}

function urlNode(url: string, lastModified: Date, changeFrequency: string, priority: string) {
  return [
    "  <url>",
    `    <loc>${url}</loc>`,
    `    <lastmod>${lastModified.toISOString()}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export function GET() {
  const posts = getAllPosts();
  const latest = latestPostDate(posts);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlNode(SITE_URL, latest, "weekly", "1.0"),
    urlNode(`${SITE_URL}/blog`, latest, "daily", "0.9"),
    ...posts.map((post) =>
      urlNode(
        `${SITE_URL}/blog/${post.slug}`,
        new Date(post.lastModified || post.date || Date.now()),
        "monthly",
        "0.75",
      ),
    ),
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
