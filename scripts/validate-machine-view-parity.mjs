#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { machineViewContract } from "./machine-view-contract.mjs";
import { POST_DIRS } from "../src/lib/content-manifest.mjs";

const ROOT = process.cwd();
const failures = [];

function fail(location, message) {
  failures.push(`${location}: ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function listMarkdownFiles(relativeDir) {
  const dir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".md") && !name.startsWith("_")).sort();
}

for (const file of machineViewContract.sourceFiles || []) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    fail(file, "Required machine-view source file is missing.");
  }
}

for (const check of machineViewContract.requiredSourceText || []) {
  if (!fs.existsSync(path.join(ROOT, check.file))) {
    fail(check.file, `Missing source file for required text: ${check.text}`);
    continue;
  }
  if (!read(check.file).includes(check.text)) {
    fail(check.file, check.message || `Missing required text: ${check.text}`);
  }
}

for (const collection of machineViewContract.contentCollections || []) {
  const files = listMarkdownFiles(collection.dir);
  if (files.length < (collection.minFiles || 1)) {
    fail(collection.dir, `Expected at least ${collection.minFiles || 1} markdown file(s), found ${files.length}.`);
  }
}

for (const postDir of POST_DIRS) {
  const files = fs.existsSync(postDir)
    ? fs.readdirSync(postDir).filter((name) => name.endsWith(".md") && !name.startsWith("_")).sort()
    : [];
  if (files.length === 0) {
    fail(path.relative(ROOT, postDir), "Manifest post root contains no markdown files.");
  }
}

if (failures.length) {
  console.error("Machine view parity failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Machine view parity passed.");
