// @ts-check
import { SITE_URL } from "./site-constants.mjs";

export const POST_IMAGE_WIDTH = 1200;
export const POST_IMAGE_HEIGHT = 630;
export const POST_IMAGE_POLICY = "indexable-primary";
export const POST_IMAGE_SOURCE = "generated-post-image";
export const POST_IMAGE_CONTENT_TYPE = "image/png";
export const POST_IMAGE_BYTE_SIGNATURE = "png";

const IMAGE_PREFIX = "/images/";
const PNG_EXTENSION = ".png";

/**
 * @param {unknown} value
 * @returns {string}
 */
function toText(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  if (typeof value === "object") return "";
  return String(value).replace(/\s+/g, " ").trim();
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function imageUrlCandidateFromFrontmatter(value) {
  if (typeof value === "string") return toText(value);
  if (value && typeof value === "object" && "url" in value) return toText(value.url);
  return "";
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function imageAltCandidateFromFrontmatter(value) {
  if (value && typeof value === "object" && "alt" in value) return toText(value.alt);
  return "";
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function generatedPostImagePath(slug) {
  return `${IMAGE_PREFIX}${slug}${PNG_EXTENSION}`;
}

/**
 * @param {string} slug
 * @param {string} [siteUrl]
 * @returns {string}
 */
export function generatedPostImageUrl(slug, siteUrl = SITE_URL) {
  return `${siteUrl}${generatedPostImagePath(slug)}`;
}

/**
 * @param {{ title: string; sectionLabel?: string }} input
 * @returns {string}
 */
export function buildPostImageAlt({ title, sectionLabel = "AI Visibility Brief" }) {
  const normalizedTitle = toText(title) || "Christian Lehman";
  const normalizedSection = toText(sectionLabel) || "AI Visibility Brief";
  return `${normalizedTitle} - ${normalizedSection} by Christian Lehman`;
}

/**
 * @param {string} value
 * @param {string} expectedPath
 * @returns {boolean}
 */
function isExpectedGeneratedPng(value, expectedPath) {
  if (!value) return false;
  try {
    const parsed = value.startsWith("/") ? new URL(value, SITE_URL) : new URL(value);
    return parsed.origin === SITE_URL && parsed.pathname === expectedPath && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

/**
 * @param {{
 *   slug: string;
 *   title: string;
 *   canonicalUrl: string;
 *   sectionLabel?: string;
 *   imageCandidate?: unknown;
 *   featuredImageCandidate?: unknown;
 *   imageAltCandidate?: unknown;
 *   featuredImageAltCandidate?: unknown;
 * }} input
 */
export function buildImageEvidence(input) {
  const imagePath = generatedPostImagePath(input.slug);
  const generatedUrl = generatedPostImageUrl(input.slug);
  const imageCandidate = imageUrlCandidateFromFrontmatter(input.featuredImageCandidate) || imageUrlCandidateFromFrontmatter(input.imageCandidate);
  const altCandidate = toText(input.featuredImageAltCandidate) || imageAltCandidateFromFrontmatter(input.imageAltCandidate);
  const alt = altCandidate || buildPostImageAlt({ title: input.title, sectionLabel: input.sectionLabel });
  const caption = `${toText(input.title) || "Christian Lehman"} primary article image`;
  const repairs = [];

  if (!isExpectedGeneratedPng(imageCandidate, imagePath)) {
    repairs.push({
      field: "primaryImage.imageUrl",
      action: imageCandidate ? "repaired-to-generated-png" : "derived-generated-png",
      beforeLength: imageCandidate.length,
      afterLength: generatedUrl.length,
    });
  }

  if (!altCandidate) {
    repairs.push({
      field: "primaryImage.alt",
      action: "derived-fallback-alt",
      beforeLength: 0,
      afterLength: alt.length,
    });
  }

  return {
    canonicalUrl: input.canonicalUrl,
    imagePath,
    imageUrl: generatedUrl,
    alt,
    caption,
    width: POST_IMAGE_WIDTH,
    height: POST_IMAGE_HEIGHT,
    policy: POST_IMAGE_POLICY,
    source: POST_IMAGE_SOURCE,
    contentType: POST_IMAGE_CONTENT_TYPE,
    byteSignature: POST_IMAGE_BYTE_SIGNATURE,
    embeddedOnPage: true,
    schemaEligible: true,
    sitemapEligible: true,
    manifestEligible: true,
    repairs,
  };
}
