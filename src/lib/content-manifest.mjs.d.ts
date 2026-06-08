import type { ImageEvidence } from "./image-evidence.mjs";

export interface ContentRepair {
  field: string;
  action: string;
  beforeLength: number;
  afterLength: number;
}

export interface BaseSiteRoute {
  kind: "page" | "post";
  path: string;
  url: string;
  canonical: string;
  title: string;
  seoTitle: string;
  description: string;
  seoDescription: string;
  lastModified?: string;
  repairs: ContentRepair[];
}

export interface PostSiteRoute extends BaseSiteRoute {
  kind: "post";
  sourcePath: string;
  slug: string;
  markdownPath: string;
  markdownRoutePath: string;
  markdownUrl: string;
  imagePath: string;
  imageUrl: string;
  imageAlt: string;
  primaryImage: ImageEvidence;
  schemaId: string;
  rssGuid: string;
  date: string;
  tags: string[];
  section: string;
  content: string;
}

export interface StaticSiteRoute extends BaseSiteRoute {
  kind: "page";
  changeFrequency: string;
  priority: string;
}

export const SITE_URL: string;
export const POSTS_DIR: string;
export const POST_DIRS: string[];

export function getAllPostRoutes(): PostSiteRoute[];
export function getPostRoute(slug: string): PostSiteRoute | null;
export function getStaticSiteRoutes(): StaticSiteRoute[];
export function getAllSiteRoutes(): Array<StaticSiteRoute | PostSiteRoute>;
export function getContentRepairReport(): {
  routes: number;
  repairedRoutes: number;
  repairs: Array<ContentRepair & { route: string; slug: string }>;
  byField: Record<string, number>;
};
