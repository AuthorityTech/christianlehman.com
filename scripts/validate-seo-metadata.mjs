#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  BLOG_SEO_DESCRIPTION,
  BLOG_SEO_TITLE,
  SEO_LIMITS,
  SITE_SEO_DESCRIPTION,
  SITE_SEO_TITLE,
  buildSeoDescription,
  buildSeoTitle,
  normalizeSeoText,
} from "../src/lib/seo-policy.mjs";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/posts");
const SITE_URL = "https://christianlehman.com";
const failures = [];
const exemptions = new Set();

function fail(route, message) {
  failures.push({ route, message });
}

function slugFromFile(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

function postRows() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((filename) => filename.endsWith(".md"))
    .sort()
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      const slug = slugFromFile(filename);
      return {
        route: `/blog/${slug}`,
        title: buildSeoTitle(data.title || slug),
        description: buildSeoDescription(data.description),
        canonical: `${SITE_URL}/blog/${slug}`,
      };
    });
}

const routes = [
  {
    route: "/",
    title: SITE_SEO_TITLE,
    description: SITE_SEO_DESCRIPTION,
    canonical: SITE_URL,
  },
  {
    route: "/blog",
    title: BLOG_SEO_TITLE,
    description: BLOG_SEO_DESCRIPTION,
    canonical: `${SITE_URL}/blog`,
  },
  ...postRows(),
];

for (const route of routes) {
  const title = normalizeSeoText(route.title);
  const description = normalizeSeoText(route.description);
  const canonical = normalizeSeoText(route.canonical);

  if (!title) fail(route.route, "Missing title.");
  if (!description) fail(route.route, "Missing meta description.");
  if (!canonical) fail(route.route, "Missing canonical URL.");
  if (title.length > SEO_LIMITS.titleMax) {
    fail(route.route, `Title too long: ${title.length} > ${SEO_LIMITS.titleMax}.`);
  }
  if (description.length > SEO_LIMITS.descriptionMax) {
    fail(route.route, `Meta description too long: ${description.length} > ${SEO_LIMITS.descriptionMax}.`);
  }
  if (description.length < SEO_LIMITS.descriptionMin && !exemptions.has(route.route)) {
    fail(route.route, `Meta description too short: ${description.length} < ${SEO_LIMITS.descriptionMin}.`);
  }
}

if (failures.length) {
  console.error(`SEO metadata guard failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- [${failure.route}] ${failure.message}`);
  }
  process.exit(1);
}

console.log(`SEO metadata guard passed: ${routes.length} human-facing route(s) validated.`);
