export const SEO_LIMITS: {
  titleMax: number;
  descriptionMin: number;
  descriptionMax: number;
};

export const SITE_SEO_TITLE: string;
export const SITE_SEO_DESCRIPTION: string;
export const BLOG_SEO_TITLE: string;
export const BLOG_SEO_DESCRIPTION: string;

export function normalizeSeoText(value: unknown): string;
export function trimAtWordBoundary(value: unknown, maxLength?: number): string;
export function buildSeoTitle(value: unknown, fallback?: string): string;
export function buildSeoDescription(value: unknown, fallback?: string): string;
export function seoMetadataForRoute(input: {
  title: unknown;
  description: unknown;
  canonical: unknown;
}): {
  title: string;
  description: string;
  canonical: string;
};
