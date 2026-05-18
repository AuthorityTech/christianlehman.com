import fs from "node:fs";
import path from "node:path";

// Support both static export (out/) and ISR hybrid (.next/server/app/)
const OUT_DIR = fs.existsSync(path.join(process.cwd(), "out"))
  ? path.join(process.cwd(), "out")
  : path.join(process.cwd(), ".next", "server", "app");

const failures = [];

function addFailure(location, message) {
  failures.push({ location, message });
}

function readText(relativePath) {
  const full = path.join(OUT_DIR, relativePath);
  // ISR hybrid stores text/XML routes as .body files (e.g. robots.txt.body)
  const bodyVariant = full + ".body";
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    return fs.readFileSync(full, "utf8");
  }
  if (fs.existsSync(bodyVariant) && fs.statSync(bodyVariant).isFile()) {
    return fs.readFileSync(bodyVariant, "utf8");
  }
  addFailure(relativePath, "File not found in build output (run build first).");
  return "";
}

function requireIncludes(content, checks, location) {
  for (const check of checks) {
    if (!content.includes(check)) {
      addFailure(location, `Missing required text: ${check}`);
    }
  }
}

function checkRobots() {
  const robots = readText("robots.txt");
  if (!robots) return;

  const required = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /blog-md/",
    "Sitemap: https://christianlehman.com/sitemap.xml",
  ];

  requireIncludes(robots, required, "robots.txt");

  if (/Disallow:\s*\/$/m.test(robots)) {
    addFailure("robots.txt", "Disallow: / detected; this blocks all crawling.");
  }
}

function checkLlms() {
  const llms = readText("llms.txt");
  if (!llms) return;

  const required = [
    "Christian Lehman",
    "AuthorityTech",
    "Machine Relations",
    "## Machine-Readable Content",
    "/index.md",
    "/blog.md",
  ];

  requireIncludes(llms, required, "llms.txt");
}

function checkMachineMarkdownContent() {
  const pages = [
    {
      path: "index.md",
      minBytes: 500,
      required: ["# Christian Lehman", "## Who Christian Lehman Is", "## Recent Writing"],
    },
    {
      path: "blog.md",
      minBytes: 500,
      required: ["# Christian Lehman", "## Posts"],
    },
  ];

  for (const page of pages) {
    const content = readText(page.path);
    if (!content) continue;
    if (Buffer.byteLength(content, "utf8") < page.minBytes) {
      addFailure(page.path, `Machine markdown is too thin: ${Buffer.byteLength(content, "utf8")} bytes < ${page.minBytes}.`);
    }
    requireIncludes(content, page.required, page.path);
  }
}

function checkSitemaps() {
  const root = readText("sitemap.xml");
  if (!root) return;

  const hasEntries =
    (root.match(/<url>/g) || []).length > 0 ||
    (root.match(/<sitemap>/g) || []).length > 0;

  if (!hasEntries) {
    addFailure("sitemap.xml", "No <url> or <sitemap> entries found in root sitemap.");
  }
}

if (!fs.existsSync(OUT_DIR)) {
  console.error("Crawl guard failed: neither out/ nor .next/server/app/ found. Run npm run build first.");
  process.exit(1);
}

checkRobots();
checkLlms();
checkMachineMarkdownContent();
checkSitemaps();

if (failures.length > 0) {
  console.error(`Crawl guard failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- [${failure.location}] ${failure.message}`);
  }
  process.exit(1);
}

console.log("Crawl guard passed: robots.txt, llms.txt, machine markdown, and sitemaps validated.");
