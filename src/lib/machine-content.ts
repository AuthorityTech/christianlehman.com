import { getPost } from "@/lib/posts";
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
  const post = getPost(slug);
  if (!post) return null;

  return `# ${post.title}

> ${post.description}

- Published: ${post.date || ""}
- URL: ${SITE_URL}/blog/${slug}

---

${post.content.trim()}

---

*Machine-readable version of [${SITE_URL}/blog/${slug}](${SITE_URL}/blog/${slug})*
`;
}
