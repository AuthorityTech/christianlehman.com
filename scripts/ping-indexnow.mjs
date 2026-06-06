#!/usr/bin/env node
/**
 * ping-indexnow.mjs
 *
 * Notifies IndexNow-compatible search engines (Bing, Yandex, etc.)
 * when blog content changes.
 *
 * Usage:
 *   node scripts/ping-indexnow.mjs          # auto-detect via git diff
 *   node scripts/ping-indexnow.mjs --all    # submit every post URL
 *   node scripts/ping-indexnow.mjs --urls https://christianlehman.com/blog/my-post
 */

import { execSync } from "node:child_process";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllPostRoutes, SITE_URL } from "../src/lib/content-manifest.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const KEY = "e865ee49880a220d1cb170ccfe089a15";
const HOST = "christianlehman.com";
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

function routeBySourcePath() {
  const entries = getAllPostRoutes().map((route) => [
    relative(ROOT, route.sourcePath).replaceAll("\\", "/"),
    route,
  ]);
  return new Map(entries);
}

function git(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

function urlsFromGitDiff() {
  const diff = git("git diff --name-only HEAD~1 HEAD");
  if (!diff) return null; // shallow clone or no history

  const files = diff.split("\n").filter(Boolean);
  const routes = routeBySourcePath();
  const postFiles = files.filter((file) => routes.has(file));

  if (postFiles.length === 0) {
    console.log("No post changes detected in last commit.");
    return [];
  }

  const urls = postFiles.map((file) => routes.get(file)?.url).filter(Boolean);
  urls.push(`${SITE_URL}/blog`);
  return urls;
}

function urlsFromGitLsFiles() {
  console.log("Falling back to git ls-files (shallow clone detected).");
  const ls = git("git ls-files");
  if (!ls) return [];

  const routes = routeBySourcePath();
  const files = ls.split("\n").filter((file) => routes.has(file));
  const urls = files.map((file) => routes.get(file)?.url).filter(Boolean);
  urls.push(`${SITE_URL}/blog`);
  return urls;
}

function urlsFromAllPosts() {
  return [...getAllPostRoutes().map((route) => route.url), `${SITE_URL}/blog`];
}

function urlsFromFlag(raw) {
  // --urls can be space-separated or comma-separated
  return raw
    .split(/[\s,]+/)
    .map((u) => u.trim())
    .filter(Boolean);
}

async function main() {
  const args = process.argv.slice(2);

  let urls;

  if (args.includes("--all")) {
    console.log("Submitting all post URLs.");
    urls = urlsFromAllPosts();
  } else if (args.includes("--urls")) {
    const idx = args.indexOf("--urls");
    const raw = args.slice(idx + 1).join(" ");
    if (!raw) {
      console.error("--urls requires at least one URL argument.");
      process.exit(1);
    }
    urls = urlsFromFlag(raw);
  } else {
    // Auto-detect from git diff, fallback to ls-files
    urls = urlsFromGitDiff() ?? urlsFromGitLsFiles();
  }

  if (urls.length === 0) {
    console.log("Nothing to submit. Exiting.");
    return;
  }

  // Deduplicate
  urls = [...new Set(urls)];

  console.log(`Submitting ${urls.length} URL(s) to IndexNow:`);
  urls.forEach((u) => console.log(`  ${u}`));

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`IndexNow accepted (HTTP ${res.status}).`);
  } else {
    const text = await res.text().catch(() => "");
    console.error(`IndexNow rejected (HTTP ${res.status}): ${text}`);
    process.exit(1);
  }
}

main();
