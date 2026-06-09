#!/usr/bin/env node

import { setTimeout as delay } from "node:timers/promises";
import { getAllSiteRoutes, SITE_URL } from "../src/lib/content-manifest.mjs";

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const EXPECTED_URLS = getAllSiteRoutes().map((route) => route.url);
const timeoutMs = Number(process.env.INDEXING_WAIT_TIMEOUT_MS || 300000);
const intervalMs = Number(process.env.INDEXING_WAIT_INTERVAL_MS || 10000);
const startedAt = Date.now();

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

while (Date.now() - startedAt < timeoutMs) {
  try {
    const res = await fetch(SITEMAP_URL, { cache: "no-store" });
    if (res.ok) {
      const locs = sitemapLocs(await res.text());
      const missing = EXPECTED_URLS.filter((url) => !locs.includes(url));
      const extraCount = locs.filter((url) => !EXPECTED_URLS.includes(url)).length;
      if (missing.length === 0) {
        console.log(`Live sitemap contains all expected URLs: found ${locs.length}, expected ${EXPECTED_URLS.length}, extra ${extraCount}.`);
        process.exit(0);
      }
      console.log(`Live sitemap not current yet: found ${locs.length}, expected ${EXPECTED_URLS.length}, missing ${missing.length}, extra ${extraCount}.`);
    } else {
      console.log(`Live sitemap returned HTTP ${res.status}.`);
    }
  } catch (error) {
    console.log(`Live sitemap check failed: ${error.message}`);
  }

  await delay(intervalMs);
}

console.error(`Timed out waiting for ${SITEMAP_URL} to contain all local manifest URLs.`);
process.exit(1);
