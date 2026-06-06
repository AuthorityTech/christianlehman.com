export const dynamic = "force-static";

import { getAllPostRoutes, getStaticSiteRoutes } from "@/lib/content-manifest.mjs";

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
  const pages = getStaticSiteRoutes();
  const posts = getAllPostRoutes();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map((page) =>
      urlNode(page.url, new Date(page.lastModified || Date.now()), page.changeFrequency, page.priority),
    ),
    ...posts.map((post) =>
      urlNode(
        post.url,
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
