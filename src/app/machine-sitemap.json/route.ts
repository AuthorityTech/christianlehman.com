export const dynamic = "force-static";
export const revalidate = 3600;

import { getAllPostRoutes, getStaticSiteRoutes, SITE_URL } from "@/lib/content-manifest.mjs";
import { machineAlternateHeaders } from "@/lib/machine-content";

type MachineLink = {
  label: string;
  url: string;
};

type MachineIssue = {
  field: string;
  action: string;
};

type RouteRepair = MachineIssue & {
  beforeLength?: number;
  afterLength?: number;
};

type BaseRoute = {
  title: string;
  seoDescription: string;
  url: string;
  path: string;
  lastModified?: string;
  repairs?: RouteRepair[];
};

type PostRoute = BaseRoute & {
  slug: string;
  markdownUrl: string;
  schemaId: string;
  date: string;
  tags: string[];
  content: string;
};

const SITE_CONCEPT: MachineLink = {
  label: "Christian Lehman",
  url: SITE_URL,
};

const BLOG_CONCEPT: MachineLink = {
  label: "Machine relations writing",
  url: `${SITE_URL}/blog`,
};

function conceptLink(label: string): MachineLink {
  return {
    label,
    url: `${SITE_URL}/blog`,
  };
}

function sourceLink(url: string): MachineLink {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return {
    label: hostname,
    url,
  };
}

function uniqueExternalUrls(content: string): string[] {
  const urls = new Set<string>();
  for (const match of content.matchAll(/\[[^\]]+]\((https?:\/\/[^)\s]+)\)|href=["'](https?:\/\/[^"']+)["']|(https?:\/\/[^\s)\]'"<>]+)/g)) {
    const rawUrl = match[1] || match[2] || match[3];
    if (!rawUrl) continue;
    const trimmed = rawUrl.replace(/[.,;:!?]+$/, "");
    try {
      const parsed = new URL(trimmed);
      if (parsed.origin !== SITE_URL) urls.add(parsed.toString());
    } catch {
      continue;
    }
  }
  return [...urls].slice(0, 5);
}

function repairIssues(repairs: RouteRepair[] = []): MachineIssue[] {
  return repairs.map((repair) => ({
    field: repair.field,
    action: repair.action,
  }));
}

function machinePageRoutes() {
  const posts = getAllPostRoutes() as PostRoute[];
  const relatedPages = posts.slice(0, 3).map((post) => ({
    label: post.title,
    url: post.url,
  }));

  return (getStaticSiteRoutes() as BaseRoute[]).map((route) => {
    const machineUrl = route.path === "/" ? `${SITE_URL}/index.md` : `${route.url}.md`;
    return {
      type: "page",
      title: route.title,
      description: route.seoDescription,
      summary: route.seoDescription,
      url: route.url,
      canonicalUrl: route.url,
      markdownUrl: machineUrl,
      machineUrl,
      primaryConcept: route.path === "/" ? SITE_CONCEPT : BLOG_CONCEPT,
      relatedConcepts: [SITE_CONCEPT, BLOG_CONCEPT],
      relatedPages,
      supportLinks: relatedPages,
      sourceUrls: [],
      issues: repairIssues(route.repairs),
      lastModified: route.lastModified,
    };
  });
}

function machinePostRoutes() {
  return (getAllPostRoutes() as PostRoute[]).map((post) => {
    const sourceUrls = uniqueExternalUrls(post.content);
    return {
      type: "post",
      title: post.title,
      description: post.seoDescription,
      summary: post.seoDescription,
      url: post.url,
      canonicalUrl: post.url,
      markdownUrl: post.markdownUrl,
      machineUrl: post.markdownUrl,
      primaryConcept: BLOG_CONCEPT,
      relatedConcepts: post.tags.length ? post.tags.map(conceptLink).slice(0, 5) : [BLOG_CONCEPT],
      relatedPages: [
        {
          label: "Blog index",
          url: `${SITE_URL}/blog`,
        },
      ],
      supportLinks: sourceUrls.length ? sourceUrls.map(sourceLink) : [BLOG_CONCEPT],
      sourceUrls,
      issues: repairIssues(post.repairs),
      schemaId: post.schemaId,
      datePublished: post.date,
      dateModified: post.lastModified || post.date,
      tags: post.tags,
    };
  });
}

export function GET() {
  const routes = [...machinePageRoutes(), ...machinePostRoutes()];
  const warnings = routes.reduce((count, route) => count + route.issues.length, 0);
  return Response.json(
    {
      version: 1,
      site: SITE_URL,
      generatedAt: new Date().toISOString(),
      count: routes.length,
      summary: {
        routes: routes.length,
        warnings,
      },
      routes,
    },
    {
      headers: [
        ["Cache-Control", "public, max-age=3600, s-maxage=86400"],
        ...machineAlternateHeaders(SITE_URL),
      ],
    },
  );
}
