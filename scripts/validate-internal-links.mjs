#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { getAllPostRoutes, getAllSiteRoutes, POST_DIRS, SITE_URL } from "../src/lib/content-manifest.mjs";

const failures = [];
const STATIC_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".svg",
  ".webp",
]);

function fail(sourcePath, href, message) {
  failures.push({ sourcePath, href, message });
}

function normalizePathname(pathname) {
  if (pathname !== "/" && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

const allowedPaths = new Set([
  ...getAllSiteRoutes().map((route) => route.path),
  ...getAllPostRoutes().map((post) => post.markdownPath),
  "/blog.md",
  "/feed.xml",
  "/index.md",
  "/llms.txt",
  "/robots.txt",
  "/sitemap.xml",
]);

// Redirect-awareness: a link that matches a redirect source is valid when the
// redirect chain terminates at a resolving destination (external URL or an
// existing internal route). This prevents a renamed/moved slug whose live 301
// still serves real content from being flagged as a dead internal link.
function resolvesAllowed(pathname) {
  if (pathname == null) return false;
  if (allowedPaths.has(pathname)) return true;
  return allowedPaths.has(pathname.endsWith(".md") ? pathname.slice(0, -3) : `${pathname}.md`);
}

function loadVercelRedirects() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8");
    const json = JSON.parse(raw);
    return (json.redirects || [])
      .filter((r) => r && typeof r.source === "string" && typeof r.destination === "string")
      .map((r) => ({ source: normalizePathname(r.source.split(/[?#]/)[0]), destination: r.destination }));
  } catch {
    return [];
  }
}

const redirects = loadVercelRedirects();
const redirectBySource = new Map(redirects.map((r) => [r.source, r.destination]));

function redirectResolves(source, depth = 0) {
  if (depth > 10) return false;
  const dest = redirectBySource.get(source);
  if (dest == null) return false;
  if (/^https?:\/\//i.test(dest)) {
    try {
      return new URL(dest).origin !== SITE_URL || resolvesAllowed(normalizePathname(new URL(dest).pathname));
    } catch {
      return true;
    }
  }
  const destPath = normalizePathname(dest.split(/[?#]/)[0]);
  if (resolvesAllowed(destPath)) return true;
  return redirectResolves(destPath, depth + 1);
}

for (const { source } of redirects) {
  if (redirectResolves(source)) {
    allowedPaths.add(source);
    allowedPaths.add(source.endsWith(".md") ? source.slice(0, -3) : `${source}.md`);
  }
}

function sameSitePath(href) {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (href.startsWith("/")) return normalizePathname(href.split(/[?#]/)[0] || "/");

  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.origin !== SITE_URL) return null;
  return normalizePathname(url.pathname);
}

function validateHref(sourcePath, href) {
  const pathname = sameSitePath(href);
  if (!pathname) return;
  if (STATIC_EXTENSIONS.has(path.extname(pathname).toLowerCase())) return;
  if (!allowedPaths.has(pathname)) {
    fail(sourcePath, href, `Internal link does not resolve to a generated route: ${pathname}`);
  }
}

for (const postDir of POST_DIRS) {
  if (!fs.existsSync(postDir)) continue;
  const files = fs.readdirSync(postDir).filter((name) => name.endsWith(".md") && !name.startsWith("_")).sort();
  for (const filename of files) {
    const sourcePath = path.join(postDir, filename);
    const raw = fs.readFileSync(sourcePath, "utf8");

    for (const match of raw.matchAll(/\[[^\]]+]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      validateHref(sourcePath, match[1]);
    }
    for (const match of raw.matchAll(/\bhref=["']([^"']+)["']/gi)) {
      validateHref(sourcePath, match[1]);
    }
  }
}

if (failures.length) {
  console.error(`Internal link validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${path.relative(process.cwd(), failure.sourcePath)} -> ${failure.href}: ${failure.message}`);
  }
  process.exit(1);
}

console.log("Internal links validated.");
