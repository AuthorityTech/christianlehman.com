import { getPostRoute } from "@/lib/content-manifest.mjs";
import {
  buildBlogIndexMarkdown,
  buildHomePageMarkdown,
} from "@/lib/site-manifest";
import { SITE_URL } from "@/lib/site";

export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
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

---

*Machine-readable version of [${post.url}](${post.url})*
`;
}
