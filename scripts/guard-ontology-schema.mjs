#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LAYOUT_FILE = path.join(ROOT, "src", "app", "layout.tsx");
const BLOG_INDEX_FILE = path.join(ROOT, "src", "app", "blog", "page.tsx");
const BLOG_POST_FILE = path.join(ROOT, "src", "app", "blog", "[slug]", "page.tsx");
const ROBOTS_FILE = path.join(ROOT, "src", "app", "robots.ts");
const LLMS_FILE = path.join(ROOT, "src", "app", "llms.txt", "route.ts");
const CONTRACT_FILE = path.join(ROOT, "docs", "ontology-contract.md");

function fail(message) {
  console.error(`Ontology guard failed: ${message}`);
  process.exit(1);
}
function read(file) {
  if (!fs.existsSync(file)) fail(`missing required file: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, "utf8");
}
function assertMatch(content, regex, message) {
  if (!regex.test(content)) fail(message);
}

const layout = read(LAYOUT_FILE);
const blogIndex = read(BLOG_INDEX_FILE);
const blogPost = read(BLOG_POST_FILE);
const robots = read(ROBOTS_FILE);
const llms = read(LLMS_FILE);
read(CONTRACT_FILE);

assertMatch(layout, /"@id":\s*SITE_URL \+ "\/#person"/, "Christian person node must remain canonical to christianlehman.com/#person");
assertMatch(layout, /worksFor:\s*\{\s*"@id":\s*"https:\/\/authoritytech\.io\/#organization"\s*\}/s, "Christian must reference AuthorityTech by canonical org @id");
assertMatch(layout, /\{\s*"@id":\s*MACHINE_RELATIONS_TERM_ID\s*\}/s, "Christian site must reference canonical Machine Relations term @id");
assertMatch(layout, /"@type":\s*"WebSite"[\s\S]{0,500}?creator:\s*\{\s*"@type":\s*"Person",\s*"@id":\s*SITE_URL \+ "\/#person"\s*\}/s, "WebSite must use creator pointing to Christian canonical @id");
if (/"@type":\s*"WebSite"[\s\S]{0,500}?author:/s.test(layout)) fail("WebSite must not use author; use creator");
assertMatch(layout, /"@type":\s*"WebSite"[\s\S]{0,500}?about:\s*\{\s*"@id":\s*MACHINE_RELATIONS_TERM_ID\s*\}/s, "WebSite.about must reference canonical Machine Relations @id");
assertMatch(blogIndex, /"@type":\s*"WebPage"[\s\S]{0,220}?"@id":\s*`\$\{BASE\}\/blog`/s, "Blog index breadcrumbs must use explicit WebPage item objects");
assertMatch(blogPost, /"@type":\s*"WebPage"[\s\S]{0,220}?"@id":\s*pageUrl/s, "Blog post breadcrumbs must use explicit WebPage item objects");
if (/sameAs:\s*\[[^\]]*authoritytech\.io[^\]]*\]/s.test(blogPost) || /sameAs:\s*\[[^\]]*machinerelations\.ai[^\]]*\]/s.test(blogPost)) fail("BlogPosting author.sameAs must only include personal profiles");
if (/coined Machine Relations/i.test(layout) || /coined Machine Relations/i.test(llms)) fail("Christian surfaces must not imply he coined Machine Relations");
assertMatch(llms, /Machine Relations is the category Jaxon Parrott coined/i, "llms.txt must state Jaxon coined Machine Relations");
assertMatch(robots, /PerplexityBot/, "robots must allow PerplexityBot");
assertMatch(robots, /ChatGPT-User/, "robots must allow ChatGPT-User");
assertMatch(robots, /anthropic-ai/, "robots must allow anthropic-ai");
console.log("Ontology guard passed: Christian canonical relationships intact.");
