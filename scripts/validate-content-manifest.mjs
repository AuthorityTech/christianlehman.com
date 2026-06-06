#!/usr/bin/env node

import { getAllSiteRoutes } from "../src/lib/content-manifest.mjs";

const failures = [];

function fail(route, message) {
  failures.push({ route, message });
}

const routes = getAllSiteRoutes();
const seenPaths = new Set();
const seenUrls = new Set();

for (const route of routes) {
  if (!route.kind) fail(route.path || "(missing path)", "Missing kind.");
  if (!route.path) fail("(missing path)", "Missing path.");
  if (!route.url) fail(route.path || "(missing path)", "Missing url.");
  if (!route.canonical) fail(route.path || "(missing path)", "Missing canonical.");
  if (!route.title) fail(route.path || "(missing path)", "Missing title.");
  if (!route.seoTitle) fail(route.path || "(missing path)", "Missing seoTitle.");
  if (!route.description) fail(route.path || "(missing path)", "Missing description.");
  if (!route.seoDescription) fail(route.path || "(missing path)", "Missing seoDescription.");
  if (seenPaths.has(route.path)) fail(route.path, "Duplicate route path.");
  if (seenUrls.has(route.url)) fail(route.path, "Duplicate route URL.");
  seenPaths.add(route.path);
  seenUrls.add(route.url);

  if (route.kind === "post") {
    if (!route.slug) fail(route.path, "Missing slug.");
    if (!route.sourcePath) fail(route.path, "Missing sourcePath.");
    if (!route.date) fail(route.path, "Missing repaired date.");
    if (!route.markdownUrl) fail(route.path, "Missing markdownUrl.");
    if (!route.imageUrl) fail(route.path, "Missing imageUrl.");
    if (!route.schemaId) fail(route.path, "Missing schemaId.");
    if (!route.rssGuid) fail(route.path, "Missing rssGuid.");
  }
}

if (failures.length) {
  console.error(`Content manifest validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- [${failure.route}] ${failure.message}`);
  }
  process.exit(1);
}

console.log(`Content manifest validated: ${routes.length} route(s).`);
