import type { PostMeta } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import {
  buildPostImageAlt,
  generatedPostImageUrl,
  POST_IMAGE_HEIGHT,
  POST_IMAGE_WIDTH,
} from "@/lib/image-evidence.mjs";

export const POST_SHARE_IMAGE_WIDTH = POST_IMAGE_WIDTH;
export const POST_SHARE_IMAGE_HEIGHT = POST_IMAGE_HEIGHT;

type DateLike = string | Date | undefined | null;

export interface PostShare {
  imageUrl: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  sectionLabel: string;
  displayDate: string;
  tags: string[];
}

export function getPostShareImageUrl(slug: string, siteUrl = SITE_URL) {
  return generatedPostImageUrl(slug, siteUrl);
}

export function getPostSectionLabel(section?: string) {
  if (section === "essay") return "Essay";
  if (section === "newsletter") return "Newsletter";
  return "AI Visibility Brief";
}

export function formatShareDate(date: DateLike) {
  if (!date) return "";
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  }

  const raw = String(date).trim();
  if (!raw) return "";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function normalizeTags(tags?: string[]) {
  return (tags ?? [])
    .filter((tag) => typeof tag === "string" && tag.trim())
    .map((tag) => tag.trim())
    .slice(0, 3);
}

export function getPostShare(
  post: Pick<PostMeta, "slug" | "title" | "date" | "tags" | "section" | "imageUrl" | "imageAlt">,
): PostShare {
  const sectionLabel = getPostSectionLabel(post.section);
  const displayDate = formatShareDate(post.date);
  const tags = normalizeTags(post.tags);
  const captionParts = [post.title, sectionLabel, displayDate].filter(Boolean);

  return {
    imageUrl: post.imageUrl || getPostShareImageUrl(post.slug),
    width: POST_SHARE_IMAGE_WIDTH,
    height: POST_SHARE_IMAGE_HEIGHT,
    alt: post.imageAlt || buildPostImageAlt({ title: post.title, sectionLabel }),
    caption: captionParts.join(" · "),
    sectionLabel,
    displayDate,
    tags,
  };
}
