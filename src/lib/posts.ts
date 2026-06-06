import { getAllPostRoutes, getPostRoute } from "@/lib/content-manifest.mjs";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  lastModified?: string;
  description: string;
  tags?: string[];
  section?: string; // "essay" | "founderos" (defaults to "founderos")
  imageUrl?: string;
  imageAlt?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  return getAllPostRoutes().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    lastModified: post.lastModified,
    description: post.description,
    tags: post.tags,
    section: post.section,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
  }));
}

export function getPost(slug: string): Post | null {
  const post = getPostRoute(slug);
  if (!post) return null;
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    lastModified: post.lastModified,
    description: post.description,
    tags: post.tags,
    section: post.section,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    content: post.content,
  };
}
