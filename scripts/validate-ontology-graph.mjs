#!/usr/bin/env node
import fs from "fs";
import path from "path";
import vm from "node:vm";
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

function extractConst(source, name) {
  const match = source.match(new RegExp(`const ${name}\\s*=\\s*\"([^\"]+)\";`));
  if (!match) fail(`Missing required constant '${name}' in layout.tsx`);
  return match[1];
}

function extractSchemaObject(source) {
  const match = source.match(/const schema\s*=\s*({[\s\S]*?});\n\nexport default function RootLayout/);
  if (!match) fail("Unable to find schema object in layout.tsx");
  return match[1];
}

const MACHINE_RELATIONS_TERM_ID = extractConst(layout, "MACHINE_RELATIONS_TERM_ID");
const schemaLiteral = extractSchemaObject(layout);

const schema = vm.runInNewContext(
  `(${schemaLiteral})`,
  {
    SITE_URL: "https://christianlehman.com",
    OG_IMAGE: "https://christianlehman.com/og/default",
    MACHINE_RELATIONS_TERM_ID,
  },
  { timeout: 1000 }
);

const graph = schema?.["@graph"];
if (!Array.isArray(graph)) fail("Schema graph missing in layout.tsx");

const byId = new Map(
  graph
    .filter((node) => node && typeof node === "object" && typeof node["@id"] === "string")
    .map((node) => [node["@id"], node])
);

const personId = "https://christianlehman.com/#person";
const person = byId.get(personId);
if (!person) fail("Missing Christian canonical Person node");
if (person.worksFor?.["@id"] !== "https://authoritytech.io/#organization") {
  fail("Christian Person.worksFor must reference canonical AuthorityTech @id");
}

const knowsAbout = Array.isArray(person.knowsAbout) ? person.knowsAbout : [];
if (!knowsAbout.some((entry) => entry?.["@id"] === "https://machinerelations.ai/#term")) {
  fail("Christian Person.knowsAbout must reference canonical Machine Relations @id");
}

if (!String(person.description || "").toLowerCase().includes("architect")) {
  fail("Christian Person description must preserve architect framing");
}

const graphText = JSON.stringify(graph);
if (/Christian Lehman coined Machine Relations/i.test(graphText + "\n" + llms)) {
  fail("Christian surfaces must not imply he coined Machine Relations");
}
if (!/Machine Relations is the category Jaxon Parrott coined/i.test(llms)) {
  fail("llms.txt must explicitly state Jaxon coined Machine Relations");
}
if (!/brand-facing architect/i.test(graphText + "\n" + llms)) {
  fail("Christian surfaces must preserve brand-facing architect framing");
}

for (const bot of ["PerplexityBot", "ChatGPT-User", "anthropic-ai"]) {
  if (!robots.includes(bot)) fail(`robots must allow ${bot}`);
}

console.log("Ontology graph validation passed: Christian relationships intact.");
