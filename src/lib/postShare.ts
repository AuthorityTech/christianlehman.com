import type { PostMeta } from "@/lib/posts";

export const POST_SHARE_IMAGE_WIDTH = 1200;
export const POST_SHARE_IMAGE_HEIGHT = 630;
export const SITE_URL = "https://christianlehman.com";

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
  return `${siteUrl}/images/${slug}.png`;
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

export function getPostShare(post: Pick<PostMeta, "slug" | "title" | "date" | "tags" | "section">): PostShare {
  const sectionLabel = getPostSectionLabel(post.section);
  const displayDate = formatShareDate(post.date);
  const tags = normalizeTags(post.tags);
  const captionParts = [post.title, sectionLabel, displayDate].filter(Boolean);

  return {
    imageUrl: getPostShareImageUrl(post.slug),
    width: POST_SHARE_IMAGE_WIDTH,
    height: POST_SHARE_IMAGE_HEIGHT,
    alt: `${post.title} — ${sectionLabel} by Christian Lehman`,
    caption: captionParts.join(" · "),
    sectionLabel,
    displayDate,
    tags,
  };
}
