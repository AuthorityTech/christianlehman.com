import { blogPostMarkdown } from "@/lib/machine-content";
import { createSlugMarkdownRouteHandlers } from "@/lib/markdown-route";
import { getAllPostRoutes, getPostRoute } from "@/lib/content-manifest.mjs";

export const { dynamic, revalidate, generateStaticParams, GET } =
  createSlugMarkdownRouteHandlers({
    getSlugs: () => getAllPostRoutes().map((post) => post.slug),
    getMarkdown: blogPostMarkdown,
    getCanonicalUrl: (slug) => getPostRoute(slug)?.url,
  });
