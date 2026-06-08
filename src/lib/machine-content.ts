import { getPostRoute } from "@/lib/content-manifest.mjs";
import {
  buildBlogIndexMarkdown,
  buildHomePageMarkdown,
} from "@/lib/site-manifest";
import { SITE_URL } from "@/lib/site";

export function machineAlternateHeaders(canonicalUrl?: string): Array<[string, string]> {
  return [
    ...(canonicalUrl ? [["Link", `<${canonicalUrl}>; rel="canonical"`] as [string, string]] : []),
    ["X-Robots-Tag", "googlebot: noindex, follow"],
    ["X-Robots-Tag", "bingbot: noindex, follow"],
  ];
}

export function markdownResponse(body: string, canonicalUrl?: string): Response {
  return new Response(body, {
    headers: [
      ["Content-Type", "text/markdown; charset=utf-8"],
      ["Cache-Control", "public, max-age=3600, s-maxage=86400"],
      ...machineAlternateHeaders(canonicalUrl),
    ],
  });
}

export function homePageMarkdown(): string {
  return buildHomePageMarkdown();
}

export function blogIndexMarkdown(): string {
  return buildBlogIndexMarkdown();
}

export function blogPostMarkdown(slug: string): string | null {
  const post = getPostRoute(slug);
  if (!post) return null;

  return `# ${post.title}

> ${post.seoDescription}

- Published: ${post.date || ""}
- URL: ${post.url}
- Canonical: ${post.canonical}
- Machine URL: ${post.markdownUrl}

---

${post.content.trim()}

## Machine-readable related links

- [Canonical article](${post.url})
- [Blog index](${SITE_URL}/blog)
- [Machine sitemap](${SITE_URL}/machine-sitemap.json)
- [LLM instructions](${SITE_URL}/llms.txt)

---

*Machine-readable version of [${post.title}](${post.url})*
`;
}
