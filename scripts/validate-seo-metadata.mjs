#!/usr/bin/env node

import {
  SEO_LIMITS,
  htmlSerializedLength,
  normalizeSeoText,
} from "../src/lib/seo-policy.mjs";
import { getAllSiteRoutes } from "../src/lib/content-manifest.mjs";

const failures = [];
const exemptions = new Set();

function fail(route, message) {
  failures.push({ route, message });
}

const routes = getAllSiteRoutes();

for (const route of routes) {
  const title = normalizeSeoText(route.seoTitle);
  const description = normalizeSeoText(route.seoDescription);
  const canonical = normalizeSeoText(route.canonical);

  if (!title) fail(route.path, "Missing title.");
  if (!description) fail(route.path, "Missing meta description.");
  if (!canonical) fail(route.path, "Missing canonical URL.");
  if (title.length > SEO_LIMITS.titleMax) {
    fail(route.path, `Title too long: ${title.length} > ${SEO_LIMITS.titleMax}.`);
  }
  if (htmlSerializedLength(title) > SEO_LIMITS.titleMax) {
    fail(route.path, `Rendered title too long: ${htmlSerializedLength(title)} > ${SEO_LIMITS.titleMax}.`);
  }
  if (description.length > SEO_LIMITS.descriptionMax) {
    fail(route.path, `Meta description too long: ${description.length} > ${SEO_LIMITS.descriptionMax}.`);
  }
  if (htmlSerializedLength(description) > SEO_LIMITS.descriptionMax) {
    fail(route.path, `Rendered meta description too long: ${htmlSerializedLength(description)} > ${SEO_LIMITS.descriptionMax}.`);
  }
  if (description.length < SEO_LIMITS.descriptionMin && !exemptions.has(route.path)) {
    fail(route.path, `Meta description too short: ${description.length} < ${SEO_LIMITS.descriptionMin}.`);
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
