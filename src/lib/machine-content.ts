import { getAllPosts, getPost } from "./posts";

export const BASE_URL = "https://christianlehman.com";

function absoluteUrl(href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  return `${BASE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

function clean(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function mdLink(label: string, href: string): string {
  return `[${label}](${absoluteUrl(href)})`;
}

export function markdownResponse(markdown: string): Response {
  return new Response(`${markdown.trim()}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export function homePageMarkdown(): string {
  const posts = getAllPosts().slice(0, 5);

  const lines = [
    "# Christian Lehman",
    "",
    "Co-Founder & CGO of AuthorityTech, the world's first AI-native Machine Relations agency. Brand-facing architect and operator of Machine Relations execution across growth and client delivery.",
    "",
    `Canonical URL: ${BASE_URL}`,
    "",
    "## Who Christian Lehman Is",
    "",
    "- Co-Founder & CGO of AuthorityTech (authoritytech.io) — the world's first AI-native Machine Relations agency",
    "- Previously rose from entry-level to VP at AT&T, generating over $50M in revenue",
    "- Brand-facing architect who operationalizes the Machine Relations framework across revenue, client acquisition, and category growth",
    "- Publishes the Invisible Shortlist — daily AI shortlist intelligence across SaaS, fintech, healthtech, and marketing verticals",
    "",
    "## Recent Writing",
    "",
  ];

  if (posts.length > 0) {
    posts.forEach((p) => {
      lines.push(`- ${mdLink(p.title, `/blog/${p.slug}`)}: ${clean(p.description).slice(0, 140)}`);
    });
  } else {
    lines.push("- Writing coming soon.");
  }

  lines.push(
    "",
    "## Entity & Social Links",
    "",
    `- ${mdLink("Blog", "/blog.md")}`,
    `- ${mdLink("LinkedIn", "https://www.linkedin.com/in/christianhlehman")}`,
    `- ${mdLink("X / Twitter", "https://x.com/ChristianLehman")}`,
    `- ${mdLink("AuthorityTech", "https://authoritytech.io")}`,
    `- ${mdLink("Machine Relations", "https://machinerelations.ai")}`,
    "",
  );

  return lines.join("\n");
}

export function blogIndexMarkdown(): string {
  const posts = getAllPosts();

  const lines = [
    "# Christian Lehman — Writing",
    "",
    "AI shortlist intelligence, publication citation data, and Machine Relations strategy for CMOs and growth leaders.",
    "",
    `Canonical URL: ${BASE_URL}/blog`,
    "",
    "## Posts",
    "",
  ];

  if (posts.length > 0) {
    posts.forEach((p) => {
      const date = p.date ? ` (${p.date.slice(0, 10)})` : "";
      lines.push(`- ${mdLink(p.title, `/blog/${p.slug}.md`)}${date}: ${clean(p.description).slice(0, 140)}`);
    });
  } else {
    lines.push("- No posts yet.");
  }

  lines.push(
    "",
    "## Also Published",
    "",
    `- ${mdLink("AuthorityTech Blog", "https://authoritytech.io/blog")}`,
    `- ${mdLink("Medium", "https://medium.com/@christian-lehman")}`,
    "",
    "## Links",
    "",
    `- ${mdLink("Home", "/index.md")}`,
    `- ${mdLink("llms.txt", "/llms.txt")}`,
    "",
  );

  return lines.join("\n");
}

export function blogPostMarkdown(slug: string): string | null {
  const post = getPost(slug);
  if (!post) return null;

  const lines = [
    `# ${post.title}`,
    "",
    post.description,
    "",
    `Canonical URL: ${BASE_URL}/blog/${slug}`,
    `Author: Christian Lehman`,
  ];

  if (post.date) lines.push(`Published: ${post.date.slice(0, 10)}`);
  if (post.lastModified) lines.push(`Last modified: ${post.lastModified.slice(0, 10)}`);
  if (post.tags && post.tags.length > 0) lines.push(`Tags: ${post.tags.join(", ")}`);

  lines.push(
    "",
    post.content.trim(),
    "",
    "## About the Author",
    "",
    "Christian Lehman is Co-Founder & CGO of AuthorityTech — the world's first AI-native Machine Relations agency. He writes AI shortlist intelligence from live B2B buying queries: which brands surface, which sources get cited, and where visibility breaks.",
    "",
    "## Links",
    "",
    `- ${mdLink("All writing", "/blog.md")}`,
    `- ${mdLink("AuthorityTech", "https://authoritytech.io")}`,
    `- ${mdLink("Machine Relations", "https://machinerelations.ai")}`,
    "",
  );

  return lines.join("\n");
}
