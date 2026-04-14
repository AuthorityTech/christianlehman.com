#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const layout = fs.readFileSync(path.join(ROOT, "src", "app", "layout.tsx"), "utf8");
const llms = fs.readFileSync(path.join(ROOT, "src", "app", "llms.txt", "route.ts"), "utf8");
const robots = fs.readFileSync(path.join(ROOT, "src", "app", "robots.ts"), "utf8");

function fail(message) {
  console.error(`Ontology graph validation failed: ${message}`);
  process.exit(1);
}
function must(regex, source, message) {
  if (!regex.test(source)) fail(message);
}

must(/"@id":\s*SITE_URL \+ "\/#person"/, layout, "Christian person node must remain canonical");
must(/worksFor:\s*\{\s*"@id":\s*"https:\/\/authoritytech\.io\/#organization"\s*\}/s, layout, "Christian must reference canonical AT org");
must(/MACHINE_RELATIONS_TERM_ID\s*=\s*"https:\/\/machinerelations\.ai\/#term"/, layout, "Christian must reference canonical MR term id");
must(/brand-facing architect/i, layout + "\n" + llms, "Christian surfaces must preserve architect framing");
if (/Christian Lehman coined Machine Relations/i.test(layout + "\n" + llms)) fail("Christian surfaces must not imply he coined Machine Relations");
must(/Jaxon Parrott coined Machine Relations in 2024/i, layout + "\n" + llms, "Christian surfaces must preserve Jaxon attribution");
for (const bot of ["PerplexityBot", "ChatGPT-User", "anthropic-ai"]) {
  if (!robots.includes(bot)) fail(`robots must allow ${bot}`);
}
console.log("Ontology validation passed: Christian relationships intact.");
