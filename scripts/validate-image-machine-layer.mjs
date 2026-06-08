#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllPostRoutes, SITE_URL } from "../src/lib/content-manifest.mjs";
import {
  POST_IMAGE_BYTE_SIGNATURE,
  POST_IMAGE_CONTENT_TYPE,
  POST_IMAGE_HEIGHT,
  POST_IMAGE_POLICY,
  POST_IMAGE_SOURCE,
  POST_IMAGE_WIDTH,
} from "../src/lib/image-evidence.mjs";

const ROOT = process.cwd();
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const failures = [];

function fail(route, message) {
  failures.push({ route, message });
}

function isGeneratedPostPngUrl(value, slug) {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.origin === SITE_URL && parsed.pathname === `/images/${slug}.png` && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

function readFrontmatter(sourcePath) {
  try {
    return matter(fs.readFileSync(sourcePath, "utf8")).data;
  } catch {
    return {};
  }
}

function imageCandidateFromFrontmatter(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "url" in value && typeof value.url === "string") return value.url.trim();
  return "";
}

function hasPngSignature(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const fd = fs.openSync(filePath, "r");
  try {
    const bytes = Buffer.alloc(PNG_SIGNATURE.length);
    const read = fs.readSync(fd, bytes, 0, bytes.length, 0);
    return read === PNG_SIGNATURE.length && bytes.equals(PNG_SIGNATURE);
  } finally {
    fs.closeSync(fd);
  }
}

const posts = getAllPostRoutes();
const imageUrls = new Set();

for (const post of posts) {
  const evidence = post.primaryImage;
  const location = post.path;

  if (!evidence || typeof evidence !== "object") {
    fail(location, "Missing primaryImage evidence.");
    continue;
  }

  if (evidence.canonicalUrl !== post.url) fail(location, "primaryImage.canonicalUrl must match the canonical post URL.");
  if (!isGeneratedPostPngUrl(evidence.imageUrl, post.slug)) fail(location, `primaryImage.imageUrl must be /images/${post.slug}.png with no query or hash.`);
  if (evidence.imagePath !== `/images/${post.slug}.png`) fail(location, "primaryImage.imagePath must match the generated post PNG path.");
  if (typeof evidence.alt !== "string" || !evidence.alt.trim()) fail(location, "primaryImage.alt must be non-empty.");
  if (typeof evidence.caption !== "string" || !evidence.caption.trim()) fail(location, "primaryImage.caption must be non-empty.");
  if (evidence.width !== POST_IMAGE_WIDTH) fail(location, `primaryImage.width must be ${POST_IMAGE_WIDTH}.`);
  if (evidence.height !== POST_IMAGE_HEIGHT) fail(location, `primaryImage.height must be ${POST_IMAGE_HEIGHT}.`);
  if (evidence.policy !== POST_IMAGE_POLICY) fail(location, `primaryImage.policy must be ${POST_IMAGE_POLICY}.`);
  if (evidence.source !== POST_IMAGE_SOURCE) fail(location, `primaryImage.source must be ${POST_IMAGE_SOURCE}.`);
  if (evidence.contentType !== POST_IMAGE_CONTENT_TYPE) fail(location, `primaryImage.contentType must be ${POST_IMAGE_CONTENT_TYPE}.`);
  if (evidence.byteSignature !== POST_IMAGE_BYTE_SIGNATURE) fail(location, `primaryImage.byteSignature must be ${POST_IMAGE_BYTE_SIGNATURE}.`);
  if (evidence.embeddedOnPage !== true) fail(location, "primaryImage.embeddedOnPage must be true.");
  if (evidence.schemaEligible !== true) fail(location, "primaryImage.schemaEligible must be true.");
  if (evidence.sitemapEligible !== true) fail(location, "primaryImage.sitemapEligible must be true.");
  if (evidence.manifestEligible !== true) fail(location, "primaryImage.manifestEligible must be true.");

  const imageFile = path.join(ROOT, "public", evidence.imagePath.replace(/^\//, ""));
  if (!hasPngSignature(imageFile)) fail(location, `Promoted image is missing or not a PNG by byte signature: ${evidence.imagePath}`);

  if (imageUrls.has(evidence.imageUrl)) fail(location, `Duplicate primary image URL: ${evidence.imageUrl}`);
  imageUrls.add(evidence.imageUrl);

  const frontmatter = readFrontmatter(post.sourcePath);
  const rawCandidate = imageCandidateFromFrontmatter(frontmatter.featured_image) || imageCandidateFromFrontmatter(frontmatter.image);
  const rawWasUnsafe = rawCandidate && !isGeneratedPostPngUrl(rawCandidate, post.slug);
  if (rawWasUnsafe) {
    const repair = post.repairs.find((item) => item.field === "primaryImage.imageUrl" && item.action === "repaired-to-generated-png");
    if (!repair) fail(location, `Unsafe image candidate was not recorded as soft repair telemetry: ${rawCandidate}`);
  }
}

if (failures.length) {
  console.error(`Image machine-layer validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- [${failure.route}] ${failure.message}`);
  process.exit(1);
}

console.log(`Image machine-layer validated: ${posts.length} post image evidence record(s).`);
