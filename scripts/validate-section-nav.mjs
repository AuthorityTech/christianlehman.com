#!/usr/bin/env node

import { getAllPostRoutes } from "../src/lib/content-manifest.mjs";
import { renderMarkdownHtml } from "../src/lib/markdown-rendering.mjs";

const excludedTitlePattern = /^(sources?|references?|footnotes?)$/i;
const faqTitlePattern = /^(faqs?|frequently asked questions(?:\b.*)?)$/i;

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function headingIdsFromHtml(html) {
  const ids = new Set();
  const headingPattern = /<h([23])\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  for (const match of html.matchAll(headingPattern)) {
    ids.add(match[2]);
  }
  return ids;
}

const posts = getAllPostRoutes();
const failures = [];

for (const post of posts) {
  const html = await renderMarkdownHtml(post.content);
  const headingIds = headingIdsFromHtml(html);
  const missing = post.sectionNav.filter((item) => !headingIds.has(item.id));
  const excluded = post.sectionNav.filter((item) => excludedTitlePattern.test(stripTags(item.title)));
  const faq = post.sectionNav.filter((item) => faqTitlePattern.test(stripTags(item.title)));

  if (missing.length) failures.push(`${post.slug} has nav ids without rendered heading ids: ${missing.map((item) => item.id).join(", ")}`);
  if (excluded.length) failures.push(`${post.slug} includes excluded sections: ${excluded.map((item) => item.title).join(", ")}`);
  if (faq.length > 1 || faq.some((item) => item.level !== 2)) failures.push(`${post.slug} must keep FAQ as one top-level item`);
}

const representative = posts
  .filter((post) => post.sectionNav.length >= 3)
  .sort((a, b) => b.content.length - a.content.length)[0];

if (!representative) failures.push("no representative post has at least three section nav items");

if (failures.length) {
  console.error(`Section nav validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Section nav validated: ${posts.length} post(s); representative ${representative.slug} has ${representative.sectionNav.length} matching item(s).`,
);
