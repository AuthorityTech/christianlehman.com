export interface ImageEvidenceRepair {
  field: "primaryImage.imageUrl" | "primaryImage.alt";
  action: "repaired-to-generated-png" | "derived-generated-png" | "derived-fallback-alt";
  beforeLength: number;
  afterLength: number;
}

export interface ImageEvidence {
  canonicalUrl: string;
  imagePath: string;
  imageUrl: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  policy: typeof POST_IMAGE_POLICY;
  source: typeof POST_IMAGE_SOURCE;
  contentType: typeof POST_IMAGE_CONTENT_TYPE;
  byteSignature: typeof POST_IMAGE_BYTE_SIGNATURE;
  embeddedOnPage: boolean;
  schemaEligible: boolean;
  sitemapEligible: boolean;
  manifestEligible: boolean;
  repairs: ImageEvidenceRepair[];
}

export const POST_IMAGE_WIDTH: 1200;
export const POST_IMAGE_HEIGHT: 630;
export const POST_IMAGE_POLICY: "indexable-primary";
export const POST_IMAGE_SOURCE: "generated-post-image";
export const POST_IMAGE_CONTENT_TYPE: "image/png";
export const POST_IMAGE_BYTE_SIGNATURE: "png";

export function imageUrlCandidateFromFrontmatter(value: unknown): string;
export function imageAltCandidateFromFrontmatter(value: unknown): string;
export function generatedPostImagePath(slug: string): string;
export function generatedPostImageUrl(slug: string, siteUrl?: string): string;
export function buildPostImageAlt(input: { title: string; sectionLabel?: string }): string;
export function buildImageEvidence(input: {
  slug: string;
  title: string;
  canonicalUrl: string;
  sectionLabel?: string;
  imageCandidate?: unknown;
  featuredImageCandidate?: unknown;
  imageAltCandidate?: unknown;
  featuredImageAltCandidate?: unknown;
}): ImageEvidence;
