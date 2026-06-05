import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  lastModified?: string;
  description: string;
  tags?: string[];
  section?: string; // "essay" | "founderos" (defaults to "founderos")
}

export interface Post extends PostMeta {
  content: string;
}

function toText(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map((item) => toText(item)).filter(Boolean).join(", ");
  if (typeof value === "object") return fallback;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text || fallback;
}

function toTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => toText(tag)).filter(Boolean);
}

function toIsoDate(value: unknown): string | undefined {
  const text = toText(value);
  if (!text) return undefined;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function toDateOnly(value: unknown): string {
  const iso = toIsoDate(value);
  return iso ? iso.slice(0, 10) : "";
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();
  return files.map((filename) => {
    const filepath = path.join(POSTS_DIR, filename);
    const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const raw = fs.readFileSync(filepath, "utf8");
    const { data } = matter(raw);
    const lastModified =
      toIsoDate(data.lastModified) ??
      toIsoDate(data.lastmod) ??
      toIsoDate(data.updated) ??
      undefined;
    return {
      slug,
      title: toText(data.title, slug),
      date: toDateOnly(data.date),
      lastModified,
      description: toText(data.description),
      tags: toTags(data.tags),
      section: toText(data.section, "founderos"),
    };
  });
}

export function getPost(slug: string): Post | null {
  if (!fs.existsSync(POSTS_DIR)) return null;
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const filename = files.find(
    (f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "") === slug
  );
  if (!filename) return null;
  const filepath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  const lastModified =
    toIsoDate(data.lastModified) ??
    toIsoDate(data.lastmod) ??
    toIsoDate(data.updated) ??
    undefined;
  return {
    slug,
    title: toText(data.title, slug),
    date: toDateOnly(data.date),
    lastModified,
    description: toText(data.description),
    tags: toTags(data.tags),
    section: toText(data.section, "founderos"),
    content,
  };
}
