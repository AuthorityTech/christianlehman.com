export const dynamic = "force-static";
export const revalidate = 3600;

import { getAllPostRoutes, getStaticSiteRoutes, SITE_URL } from "@/lib/content-manifest.mjs";

function machinePageRoutes() {
  return getStaticSiteRoutes().map((route) => ({
    type: "page",
    title: route.title,
    description: route.seoDescription,
    canonicalUrl: route.url,
    machineUrl: route.path === "/" ? `${SITE_URL}/index.md` : `${route.url}.md`,
    lastModified: route.lastModified,
  }));
}

function machinePostRoutes() {
  return getAllPostRoutes().map((post) => ({
    type: "post",
    title: post.title,
    description: post.seoDescription,
    canonicalUrl: post.url,
    machineUrl: post.markdownUrl,
    schemaId: post.schemaId,
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    tags: post.tags,
  }));
}

export function GET() {
  const routes = [...machinePageRoutes(), ...machinePostRoutes()];
  return Response.json(
    {
      version: 1,
      site: SITE_URL,
      generatedAt: new Date().toISOString(),
      count: routes.length,
      routes,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
