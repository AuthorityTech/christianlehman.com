#!/usr/bin/env node

import { getContentRepairReport } from "../src/lib/content-manifest.mjs";

const verbose = process.argv.includes("--verbose");
const report = getContentRepairReport();

console.log(`SEO/GEO compiler report: ${report.routes} post route(s), ${report.repairedRoutes} route(s) repaired.`);

if (!report.repairs.length) {
  console.log("No repairs applied.");
  process.exit(0);
}

for (const [field, count] of Object.entries(report.byField).sort()) {
  console.log(`- ${field}: ${count}`);
}

if (verbose) {
  for (const repair of report.repairs) {
    console.log(
      `${repair.route}\t${repair.field}\t${repair.action}\t${repair.beforeLength}->${repair.afterLength}`,
    );
  }
}
