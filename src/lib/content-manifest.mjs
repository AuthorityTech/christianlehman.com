// @ts-check
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SITE_URL } from "./site-constants.mjs";
import {
  buildSeoDescription,
  buildSeoTitle,
  normalizeSeoText,
  BLOG_SEO_DESCRIPTION,
  BLOG_SEO_TITLE,
  SEO_LIMITS,
  SITE_SEO_DESCRIPTION,
  SITE_SEO_TITLE,
  trimAtWordBoundary,
} from "./seo-policy.mjs";

export const POSTS_DIR = path.join(process.cwd(), "content/posts");
export const POST_DIRS = [
  POSTS_DIR,
  path.join(process.cwd(), "src/content/posts"),
];
const DISPLAY_DESCRIPTION_MAX = 220;

export { SITE_URL };

/**
 * @param {unknown} value
 * @param {string} [fallback]
 * @returns {string}
 */
function toText(value, fallback = "") {
  if (value == null) return fallback;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map((item) => toText(item)).filter(Boolean).join(", ");
  if (typeof value === "object") return fallback;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text || fallback;
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function toTags(value) {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => toText(tag)).filter(Boolean);
}

/**
 * @param {string} filename
 * @returns {string}
 */
function slugFromFilename(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

/**
 * @param {string} filename
 * @returns {string}
 */
function dateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-/);
  return match?.[1] || "";
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function parseDate(value) {
  const text = toText(value);
  if (!text) return "";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : text;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

/**
 * @param {unknown} value
 * @returns {string | undefined}
 */
function parseIsoDate(value) {
  const text = toText(value);
  if (!text) return undefined;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : text;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/**
 * @param {Record<string, unknown>} data
 * @returns {unknown}
 */
function primaryDateValue(data) {
  return data.date ?? data.pubDate ?? data.publishedAt;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function imageUrlFromFrontmatter(value) {
  if (typeof value === "string") return toText(value);
  if (value && typeof value === "object" && "url" in value) return toText(value.url);
  return "";
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function imageAltFromFrontmatter(value) {
  if (value && typeof value === "object" && "alt" in value) return toText(value.alt);
  return "";
}

/**
 * @param {string} content
 * @param {string} fallback
 * @returns {string}
 */
function excerptFromContent(content, fallback) {
  const text = content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.match(/\[([^\]]+)]/)?.[1] || " ")
    .replace(/[#*_>`|[\]-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

/**
 * @param {unknown} value
 * @param {string} content
 * @param {string} fallback
 * @returns {string}
 */
function buildDisplayDescription(value, content, fallback) {
  const text = toText(value) || excerptFromContent(content, fallback);
  return trimAtWordBoundary(text, DISPLAY_DESCRIPTION_MAX);
}

/**
 * @param {{
 *   title: string;
 *   seoTitle: string;
 *   rawDescription: unknown;
 *   visibleDescription: string;
 *   seoDescription: string;
 *   rawDate: unknown;
 *   date: string;
 *   frontmatterDate: string;
 *   filenameDate: string;
 *   rawTags: unknown;
 *   tags: string[];
 * }} input
 * @returns {Array<{ field: string; action: string; beforeLength: number; afterLength: number }>}
 */
function createRepairs({
  title,
  seoTitle,
  rawDescription,
  visibleDescription,
  seoDescription,
  rawDate,
  date,
  frontmatterDate,
  filenameDate,
  rawTags,
  tags,
}) {
  const repairs = [];
  const rawDescriptionText = normalizeSeoText(rawDescription);
  if (title !== seoTitle || title.length > SEO_LIMITS.titleMax) {
    repairs.push({
      field: "seoTitle",
      action: "bounded",
      beforeLength: title.length,
      afterLength: seoTitle.length,
    });
  }
  if (!rawDescriptionText) {
    repairs.push({
      field: "description",
      action: "derived",
      beforeLength: 0,
      afterLength: visibleDescription.length,
    });
  }
  if (rawDescriptionText && rawDescriptionText !== visibleDescription) {
    repairs.push({
      field: "description",
      action: "bounded",
      beforeLength: rawDescriptionText.length,
      afterLength: visibleDescription.length,
    });
  }
  if (
    visibleDescription !== seoDescription ||
    visibleDescription.length > SEO_LIMITS.descriptionMax ||
    visibleDescription.length < SEO_LIMITS.descriptionMin
  ) {
    repairs.push({
      field: "seoDescription",
      action: "bounded",
      beforeLength: visibleDescription.length,
      afterLength: seoDescription.length,
    });
  }
  if (filenameDate && frontmatterDate !== filenameDate) {
    repairs.push({
      field: "date",
      action: frontmatterDate ? "repaired-from-filename" : "derived-from-filename",
      beforeLength: toText(rawDate).length,
      afterLength: date.length,
    });
  }
  if (rawDate && !date) {
    repairs.push({ field: "date", action: "omitted-invalid", beforeLength: toText(rawDate).length, afterLength: 0 });
  }
  if (Array.isArray(rawTags) && rawTags.length !== tags.length) {
    repairs.push({ field: "tags", action: "normalized", beforeLength: rawTags.length, afterLength: tags.length });
  }
  return repairs;
}

/**
 * @param {string} sourcePath
 * @param {string} filename
 */
function postRouteFromFile(sourcePath, filename) {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = matter(raw);
  const data = /** @type {Record<string, unknown>} */ (parsed.data);
  const slug = slugFromFilename(filename);
  const title = toText(data.title, slug);
  const rawDescription = data.description;
  const visibleDescription = buildDisplayDescription(rawDescription, parsed.content, title);
  const seoTitle = buildSeoTitle(title);
  const seoDescription = buildSeoDescription(visibleDescription);
  const rawDate = primaryDateValue(data);
  const frontmatterDate = parseDate(rawDate);
  const filenameDate = parseDate(dateFromFilename(filename));
  const date = frontmatterDate || filenameDate;
  const lastModified =
    parseIsoDate(data.lastModified) ??
    parseIsoDate(data.lastmod) ??
    parseIsoDate(data.updated) ??
    undefined;
  const tags = toTags(data.tags);
  const section = toText(data.section, "founderos");
  const pathValue = `/blog/${slug}`;
  const url = `${SITE_URL}${pathValue}`;
  const markdownPath = `/blog/${slug}.md`;
  const markdownRoutePath = `/blog-md/${slug}`;
  const imagePath = `/images/${slug}.png`;
  const frontmatterImageUrl = imageUrlFromFrontmatter(data.image);
  const frontmatterImageAlt = imageAltFromFrontmatter(data.image);

  return {
    kind: "post",
    sourcePath,
    slug,
    path: pathValue,
    url,
    canonical: url,
    markdownPath,
    markdownRoutePath,
    markdownUrl: `${SITE_URL}${markdownPath}`,
    imagePath,
    imageUrl: frontmatterImageUrl || `${SITE_URL}${imagePath}`,
    imageAlt: frontmatterImageAlt,
    schemaId: `${url}#article`,
    rssGuid: `${url}#article`,
    title,
    seoTitle,
    description: visibleDescription,
    seoDescription,
    date,
    lastModified,
    tags,
    section,
    content: parsed.content,
    repairs: createRepairs({
      title,
      seoTitle,
      rawDescription,
      visibleDescription,
      seoDescription,
      rawDate,
      date,
      frontmatterDate,
      filenameDate,
      rawTags: data.tags,
      tags,
    }),
  };
}

export function getAllPostRoutes() {
  const files = POST_DIRS.flatMap((dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter((filename) => filename.endsWith(".md"))
      .sort()
      .map((filename) => ({ dir, filename }));
  });
  const routes = files
    .map(({ dir, filename }) => postRouteFromFile(path.join(dir, filename), filename))
    .sort((a, b) => {
      const dateCompare = (b.date || "").localeCompare(a.date || "");
      return dateCompare || b.slug.localeCompare(a.slug);
    });

  const seen = new Map();
  for (const route of routes) {
    const existing = seen.get(route.slug);
    if (existing) {
      throw new Error(`Duplicate post slug "${route.slug}" from ${existing.sourcePath} and ${route.sourcePath}`);
    }
    seen.set(route.slug, route);
  }

  return routes;
}

/**
 * @param {string} slug
 */
export function getPostRoute(slug) {
  return getAllPostRoutes().find((route) => route.slug === slug) || null;
}

export function getStaticSiteRoutes() {
  const posts = getAllPostRoutes();
  const latest = posts.reduce((max, post) => {
    const timestamp = new Date(post.lastModified || post.date || 0).getTime();
    return Number.isFinite(timestamp) ? Math.max(max, timestamp) : max;
  }, 0);
  const lastModified = latest > 0 ? new Date(latest).toISOString() : new Date().toISOString();

  return [
    {
      kind: "page",
      path: "/",
      url: SITE_URL,
      canonical: SITE_URL,
      title: "Christian Lehman",
      seoTitle: SITE_SEO_TITLE,
      description: SITE_SEO_DESCRIPTION,
      seoDescription: SITE_SEO_DESCRIPTION,
      lastModified,
      changeFrequency: "weekly",
      priority: "1.0",
      repairs: [],
    },
    {
      kind: "page",
      path: "/blog",
      url: `${SITE_URL}/blog`,
      canonical: `${SITE_URL}/blog`,
      title: "Writing",
      seoTitle: BLOG_SEO_TITLE,
      description: BLOG_SEO_DESCRIPTION,
      seoDescription: BLOG_SEO_DESCRIPTION,
      lastModified,
      changeFrequency: "daily",
      priority: "0.9",
      repairs: [],
    },
  ];
}

export function getAllSiteRoutes() {
  return [...getStaticSiteRoutes(), ...getAllPostRoutes()];
}

export function getContentRepairReport() {
  const routes = getAllPostRoutes();
  const repairs = routes.flatMap((route) =>
    route.repairs.map((repair) => ({
      route: route.path,
      slug: route.slug,
      ...repair,
    })),
  );
  const byField = repairs.reduce((/** @type {Record<string, number>} */ acc, repair) => {
    acc[repair.field] = (acc[repair.field] || 0) + 1;
    return acc;
  }, {});

  return {
    routes: routes.length,
    repairedRoutes: new Set(repairs.map((repair) => repair.route)).size,
    repairs,
    byField,
  };
}
