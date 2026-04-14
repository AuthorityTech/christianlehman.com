#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LAYOUT_FILE = path.join(ROOT, "src", "app", "layout.tsx");
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
const robots = read(ROBOTS_FILE);
const llms = read(LLMS_FILE);
read(CONTRACT_FILE);

assertMatch(layout, /"@id":\s*SITE_URL \+ "\/#person"/, "Christian person node must remain canonical to christianlehman.com/#person");
assertMatch(layout, /worksFor:\s*\{\s*"@id":\s*"https:\/\/authoritytech\.io\/#organization"\s*\}/s, "Christian must reference AuthorityTech by canonical org @id");
assertMatch(layout, /\{\s*"@id":\s*MACHINE_RELATIONS_TERM_ID\s*\}/s, "Christian site must reference canonical Machine Relations term @id");
if (/coined Machine Relations/i.test(layout) || /coined Machine Relations/i.test(llms)) fail("Christian surfaces must not imply he coined Machine Relations");
assertMatch(llms, /Machine Relations is the category Jaxon Parrott coined/i, "llms.txt must state Jaxon coined Machine Relations");
assertMatch(robots, /PerplexityBot/, "robots must allow PerplexityBot");
assertMatch(robots, /ChatGPT-User/, "robots must allow ChatGPT-User");
assertMatch(robots, /anthropic-ai/, "robots must allow anthropic-ai");
console.log("Ontology guard passed: Christian canonical relationships intact.");
