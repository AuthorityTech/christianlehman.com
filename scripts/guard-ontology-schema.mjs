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
const PAGE_COPY_FILE = path.join(ROOT, "src", "lib", "page-copy.ts");
const SEO_POLICY_FILE = path.join(ROOT, "src", "lib", "seo-policy.mjs");

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
function readMarkdownTree(dir) {
  if (!fs.existsSync(dir)) return "";
  return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return readMarkdownTree(target);
    return /\.mdx?$/.test(entry.name) ? fs.readFileSync(target, "utf8") : "";
  }).join("\n");
}

const layout = read(LAYOUT_FILE);
const blogIndex = read(BLOG_INDEX_FILE);
const blogPost = read(BLOG_POST_FILE);
const robots = read(ROBOTS_FILE);
let llms = read(LLMS_FILE);
const LLMS_MANIFEST = path.join(ROOT, "src", "lib", "site-manifest.ts");
if (llms.includes("buildLlmsTxtBody") && fs.existsSync(LLMS_MANIFEST)) {
  llms += `\n${fs.readFileSync(LLMS_MANIFEST, "utf8")}`;
}
read(CONTRACT_FILE);

const christianSurfaces = [
  layout,
  blogPost,
  llms,
  read(PAGE_COPY_FILE),
  read(SEO_POLICY_FILE),
  readMarkdownTree(path.join(ROOT, "content")),
].join("\n");
const falseOwnership = /\bChristian(?:\s+Lehman)?\b[\s\S]{0,140}\b(?:co[ -]?founder|founder|founding partner|partner|owner|architect)\b/i;
const falseOrigin = /\bChristian(?:\s+Lehman)?\b[\s\S]{0,180}\b(?:developed|created|originated|co-created|co-built|operationalized)\b[\s\S]{0,120}\b(?:Machine Relations|MRI(?: Score| Index)?|publication intelligence|platform|framework|system|IP)\b/i;
if (christianSurfaces.split("\n").some((line) => falseOwnership.test(line))) fail("Christian surfaces must not assert founder, partner, owner, or architect status");
if (christianSurfaces.split("\n").some((line) => falseOrigin.test(line))) fail("Christian surfaces must not assert category, platform, IP, framework, or source-system origin");

assertMatch(layout, /"@id":\s*SITE_URL \+ "\/#person"/, "Christian person node must remain canonical to christianlehman.com/#person");
assertMatch(layout, /worksFor:\s*\{\s*"@id":\s*"https:\/\/authoritytech\.io\/#organization"\s*\}/s, "Christian must reference AuthorityTech by canonical org @id");
assertMatch(layout, /\{\s*"@id":\s*MACHINE_RELATIONS_TERM_ID\s*\}/s, "Christian site must reference canonical Machine Relations term @id");
assertMatch(layout, /"@type":\s*"WebSite"[\s\S]{0,500}?creator:\s*\{\s*"@type":\s*"Person",\s*"@id":\s*SITE_URL \+ "\/#person"\s*\}/s, "WebSite must use creator pointing to Christian canonical @id");
if (/"@type":\s*"WebSite"[\s\S]{0,500}?author:/s.test(layout)) fail("WebSite must not use author; use creator");
assertMatch(layout, /"@type":\s*"WebSite"[\s\S]{0,500}?about:\s*\{\s*"@id":\s*MACHINE_RELATIONS_TERM_ID\s*\}/s, "WebSite.about must reference canonical Machine Relations @id");
assertMatch(blogIndex, /"@type":\s*"WebPage"[\s\S]{0,220}?"@id":\s*`\$\{SITE_URL\}\/blog`/s, "Blog index breadcrumbs must use explicit WebPage item objects");
assertMatch(blogPost, /generateBlogJsonLd.*CL_BLOG_CONFIG/s, "blog/[slug]/page.tsx must use generateBlogJsonLd with CL_BLOG_CONFIG from @editorialkit/schema");
if (/coined Machine Relations/i.test(layout) || /coined Machine Relations/i.test(llms)) fail("Christian surfaces must not imply he coined Machine Relations");
assertMatch(llms, /Machine Relations is the category Jaxon Parrott coined/i, "llms.txt must state Jaxon coined Machine Relations");
assertMatch(christianSurfaces, /Christian Lehman is (?:AuthorityTech's )?Chief Growth Officer|Christian Lehman, Chief Growth Officer|Christian Lehman is Chief Growth Officer/i, "Christian surfaces must preserve Chief Growth Officer framing");
assertMatch(robots, /PerplexityBot/, "robots must allow PerplexityBot");
assertMatch(robots, /ChatGPT-User/, "robots must allow ChatGPT-User");
assertMatch(robots, /anthropic-ai/, "robots must allow anthropic-ai");
console.log("Ontology guard passed: Christian canonical relationships intact.");
