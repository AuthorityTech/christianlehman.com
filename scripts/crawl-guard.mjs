#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { machineViewContract } from "./machine-view-contract.mjs";
import { getAllPostRoutes, getAllSiteRoutes } from "../src/lib/content-manifest.mjs";

const ROOT = process.cwd();
function resolveOutDir() {
  const nextApp = path.join(ROOT, ".next", "server", "app");
  const staticOut = path.join(ROOT, "out");
  if (fs.existsSync(path.join(nextApp, "index.md.body"))) return nextApp;
  if (fs.existsSync(path.join(nextApp, "llms.txt.body"))) return nextApp;
  if (fs.existsSync(staticOut)) return staticOut;
  return nextApp;
}

const OUT_DIR = resolveOutDir();
const failures = [];

function fail(location, message) {
  failures.push({ location, message });
}

function isAbsoluteCleanUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    new URL(value);
  } catch {
    return false;
  }
  return !/[][()]/.test(value);
}

function validateMachineLink(location, link) {
  if (!link || typeof link !== "object") {
    fail(location, "Missing machine link object.");
    return;
  }
  if (typeof link.label !== "string" || !link.label.trim() || /^https?:\/\//.test(link.label)) {
    fail(location, `Invalid machine link label: ${JSON.stringify(link.label)}`);
  }
  if (!isAbsoluteCleanUrl(link.url)) {
    fail(location, `Invalid machine link URL: ${JSON.stringify(link.url)}`);
  }
}

function readOutput(relativePath, { required = true } = {}) {
  const full = path.join(OUT_DIR, relativePath);
  const body = full + ".body";
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return fs.readFileSync(full, "utf8");
  if (fs.existsSync(body) && fs.statSync(body).isFile()) return fs.readFileSync(body, "utf8");
  if (required) fail(relativePath, "File not found in build output.");
  return "";
}

function routeExists(relativePath) {
  const full = path.join(OUT_DIR, relativePath);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return true;
  if (fs.existsSync(full + ".body")) return true;
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    return fs.existsSync(path.join(full, "route.js"));
  }
  return false;
}

function normalizeRoutePath(routePath) {
  return routePath.replace(/^\/+/, "");
}

function requireIncludes(content, checks, location) {
  for (const check of checks || []) {
    if (!content.toLowerCase().includes(String(check).toLowerCase())) {
      fail(location, `Missing required text: ${check}`);
    }
  }
}

function validateMachineMarkdown(content, location) {
  const lines = content.split(/\n/);
  lines.forEach((line, index) => {
    const lineLocation = `${location}:${index + 1}`;
    if (/\[[^\]]+\]\([^)\n]*$/.test(line)) fail(lineLocation, "Unterminated markdown link.");
    if (/https?:\/\/[^\s]+]\(/.test(line)) fail(lineLocation, "Crossed markdown URL/link.");
    const urlLabel = line.match(/\[(https?:\/\/[^\]]+)\]\(/);
    if (urlLabel) fail(lineLocation, `URL used as markdown link label: ${urlLabel[1]}`);
  });
  if (!/Machine-readable related links|Related concepts|Supporting research|Framework context/i.test(content)) {
    fail(location, "Missing generated machine-link section.");
  }
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    data[pair[1]] = pair[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return data;
}

function slugFromFile(file, data) {
  if (data.slug) return data.slug;
  return file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function newestMarkdownFile(relativeDir) {
  const dir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((name) => name.endsWith(".md") && !name.startsWith("_")).sort();
  return files.at(-1) || null;
}

if (!fs.existsSync(OUT_DIR)) {
  console.error("crawl-guard: build output not found. Run npm run build first.");
  process.exit(1);
}

for (const page of machineViewContract.staticMarkdown || []) {
  const content = readOutput(page.path);
  if (!content) continue;
  const bytes = Buffer.byteLength(content, "utf8");
  if (bytes < page.minBytes) {
    fail(page.path, `Machine markdown too thin: ${bytes} < ${page.minBytes} bytes.`);
  }
  requireIncludes(content, page.required, page.path);
  validateMachineMarkdown(content, page.path);
}

if (machineViewContract.llms) {
  const llms = readOutput(machineViewContract.llms.path);
  if (llms) requireIncludes(llms, machineViewContract.llms.required, machineViewContract.llms.path);
}

const posts = getAllPostRoutes();
const blogMarkdown = readOutput("blog.md", { required: false });
if (blogMarkdown) {
  for (const post of posts) {
    requireIncludes(blogMarkdown, [post.title, post.markdownUrl], "blog.md");
  }
}

const llms = readOutput("llms.txt", { required: false });
if (llms) {
  for (const post of posts) {
    requireIncludes(llms, [post.url, post.markdownUrl], "llms.txt");
  }
}

const feed = readOutput("feed.xml", { required: false });
if (feed) {
  for (const post of posts) {
    requireIncludes(feed, [post.url, post.rssGuid], "feed.xml");
  }
}

const machineSitemap = readOutput("machine-sitemap.json", { required: false });
if (machineSitemap) {
  let parsed;
  try {
    parsed = JSON.parse(machineSitemap);
  } catch (error) {
    fail("machine-sitemap.json", `Invalid JSON: ${error.message}`);
  }
  if (parsed) {
    const expectedRoutes = getAllSiteRoutes();
    if (parsed.count !== expectedRoutes.length) {
      fail("machine-sitemap.json", `Expected ${expectedRoutes.length} route(s), found ${parsed.count}.`);
    }
    if (!parsed.summary || parsed.summary.routes !== expectedRoutes.length) {
      fail("machine-sitemap.json", "Missing or incorrect summary.routes.");
    }
    if (!Array.isArray(parsed.routes)) {
      fail("machine-sitemap.json", "Missing routes array.");
    }
    for (const route of expectedRoutes) {
      requireIncludes(machineSitemap, [route.url], "machine-sitemap.json");
      if (route.kind === "post") requireIncludes(machineSitemap, [route.markdownUrl], "machine-sitemap.json");
    }
    if (Array.isArray(parsed.routes)) {
      for (const [index, route] of parsed.routes.entries()) {
        const location = `machine-sitemap.json routes[${index}]`;
        for (const field of ["url", "canonicalUrl", "machineUrl", "markdownUrl"]) {
          if (!isAbsoluteCleanUrl(route[field])) {
            fail(location, `Invalid ${field}: ${JSON.stringify(route[field])}`);
          }
        }
        if (route.canonicalUrl !== route.url) {
          fail(location, "canonicalUrl must match the human canonical url field.");
        }
        if (route.machineUrl !== route.markdownUrl) {
          fail(location, "machineUrl must match markdownUrl for current machine alternates.");
        }
        if (typeof route.summary !== "string" || route.summary.length < 80) {
          fail(location, "Missing useful machine summary.");
        }
        validateMachineLink(`${location}.primaryConcept`, route.primaryConcept);
        const generatedLinks = [
          ...(Array.isArray(route.relatedConcepts) ? route.relatedConcepts : []),
          ...(Array.isArray(route.relatedPages) ? route.relatedPages : []),
          ...(Array.isArray(route.supportLinks) ? route.supportLinks : []),
        ];
        if (!generatedLinks.length) fail(location, "No generated machine links.");
        generatedLinks.forEach((link, linkIndex) => validateMachineLink(`${location}.links[${linkIndex}]`, link));
        if (!Array.isArray(route.sourceUrls)) fail(location, "sourceUrls must be an array.");
        for (const [sourceIndex, sourceUrl] of (route.sourceUrls || []).entries()) {
          if (!isAbsoluteCleanUrl(sourceUrl)) fail(`${location}.sourceUrls[${sourceIndex}]`, `Invalid source URL: ${sourceUrl}`);
        }
      }
    }
  }
}

for (const post of posts) {
  const routePath = normalizeRoutePath(post.markdownRoutePath);
  if (!routeExists(routePath)) {
    fail(routePath, "Manifest post machine route missing in build output.");
    continue;
  }
  const rendered = readOutput(routePath, { required: false });
  if (rendered) {
    requireIncludes(rendered, [post.title, post.url, post.canonical], routePath);
    validateMachineMarkdown(rendered, routePath);
  }
}

for (const collection of machineViewContract.contentCollections || []) {
  const file = newestMarkdownFile(collection.dir);
  if (!file) {
    fail(collection.dir, "No markdown content files found for sample route check.");
    continue;
  }
  const raw = fs.readFileSync(path.join(ROOT, collection.dir, file), "utf8");
  const data = parseFrontmatter(raw);
  const slug = slugFromFile(file, data);
  const routePath = `${collection.routePrefix}/${slug}`;
  if (!routeExists(routePath)) {
    fail(routePath, "Dynamic markdown route missing in build output.");
    continue;
  }
  const rendered = readOutput(routePath, { required: false });
  if (rendered && data.title) requireIncludes(rendered, [data.title], routePath);
}

const robots = readOutput("robots.txt", { required: false });
if (robots) requireIncludes(robots, ["/blog-md/"], "robots.txt");

const sitemap = readOutput("sitemap.xml", { required: false });
if (sitemap) {
  if (/<sitemapindex\b/i.test(sitemap)) {
    fail("sitemap.xml", "Root sitemap must list page URLs directly, not only child sitemaps.");
  }
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const expected = getAllSiteRoutes().map((route) => route.url);
  if (locs.length !== expected.length) {
    fail("sitemap.xml", `Expected ${expected.length} URL(s), found ${locs.length}.`);
  }
  for (const url of expected) {
    if (!locs.includes(url)) fail("sitemap.xml", `Missing sitemap URL: ${url}`);
  }
}

if (failures.length) {
  console.error(`crawl-guard failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- [${failure.location}] ${failure.message}`);
  process.exit(1);
}

console.log("crawl-guard: machine-readable build output verified.");
