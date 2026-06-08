export const dynamic = "force-static";

import { getAllPostRoutes, getStaticSiteRoutes } from "@/lib/content-manifest.mjs";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlNode(url: string, lastModified: Date, changeFrequency: string, priority: string, image?: { imageUrl: string; alt: string; caption: string }) {
  const imageLines = image
    ? [
        "    <image:image>",
        `      <image:loc>${escapeXml(image.imageUrl)}</image:loc>`,
        `      <image:caption>${escapeXml(image.caption)}</image:caption>`,
        `      <image:title>${escapeXml(image.alt)}</image:title>`,
        "    </image:image>",
      ]
    : [];
  return [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    `    <lastmod>${lastModified.toISOString()}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority}</priority>`,
    ...imageLines,
    "  </url>",
  ].join("\n");
}

export function GET() {
  const pages = getStaticSiteRoutes();
  const posts = getAllPostRoutes();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...pages.map((page) =>
      urlNode(page.url, new Date(page.lastModified || Date.now()), page.changeFrequency, page.priority),
    ),
    ...posts.map((post) =>
      urlNode(
        post.url,
        new Date(post.lastModified || post.date || Date.now()),
        "monthly",
        "0.75",
        post.primaryImage.sitemapEligible
          ? {
              imageUrl: post.primaryImage.imageUrl,
              alt: post.primaryImage.alt,
              caption: post.primaryImage.caption,
            }
          : undefined,
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
