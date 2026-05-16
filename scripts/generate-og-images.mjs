#!/usr/bin/env node
/**
 * generate-og-images.mjs
 * Generates canonical post images for christianlehman.com posts.
 * One image system only: public/images/{slug}.png
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content/posts");
const IMAGES_DIR = path.join(ROOT, "public/images");
const WIDTH = 1200;
const HEIGHT = 630;
const require = createRequire(import.meta.url);
const FONT_REGULAR_PATH = require.resolve("@fontsource/inter/files/inter-latin-400-normal.woff");
const FONT_MEDIUM_PATH = require.resolve("@fontsource/inter/files/inter-latin-500-normal.woff");
const ACCENT = "#DC3958";
const ACCENT_DIM = "#3f1422";
const ACCENT_BORDER = "#6e1f32";

function formatDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).toUpperCase();
  }
  const raw = String(value).trim();
  if (!raw) return "";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return raw.toUpperCase();
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).toUpperCase();
}

function sectionLabel(section) {
  if (section === "essay") return "ESSAY";
  if (section === "newsletter") return "NEWSLETTER";
  return "AI VISIBILITY BRIEF";
}

function clampText(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function titleFontSize(title) {
  if (title.length > 112) return 34;
  if (title.length > 92) return 38;
  if (title.length > 72) return 42;
  if (title.length > 52) return 46;
  return 52;
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function gridDots() {
  const dots = [];
  const spacing = 14;
  for (let y = 0; y <= HEIGHT; y += spacing) {
    for (let x = 0; x <= WIDTH; x += spacing) {
      dots.push({
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: 1,
            height: 1,
            backgroundColor: "#333333",
            opacity: 0.32,
          },
        },
      });
    }
  }
  return dots;
}

function backgroundAscii(seed) {
  const hash = hashString(seed);
  const alphabet = ["0", "1", "/", ".", ":", "-", "_", "+", "|"];
  return Array.from({ length: 15 }, (_, row) => {
    const text = Array.from({ length: 74 }, (_, index) => alphabet[(hash + row * 13 + index * 7) % alphabet.length]).join("");
    return {
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: 70 + (row % 3) * 18,
          top: 118 + row * 28,
          width: 1040,
          fontSize: 12,
          fontWeight: 400,
          color: "#666666",
          opacity: 0.12,
          letterSpacing: 0,
          lineHeight: 1,
        },
        children: text,
      },
    };
  });
}

function accentDots(seed) {
  const hash = hashString(seed);
  return Array.from({ length: 34 }, (_, index) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: 88 + ((hash + index * 61) % 1020),
        top: 124 + ((hash >> index % 21) + index * 37) % 370,
        width: index % 9 === 0 ? 3 : 2,
        height: index % 9 === 0 ? 3 : 2,
        backgroundColor: ACCENT,
        opacity: index % 9 === 0 ? 0.9 : 0.34,
      },
    },
  }));
}

function geometricLines(seed) {
  const hash = hashString(seed);
  const horizontal = Array.from({ length: 5 }, (_, index) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: 70 + ((hash + index * 29) % 88),
        top: 152 + index * 70,
        width: 892 - index * 46,
        height: 1,
        backgroundColor: index === 1 ? ACCENT_DIM : "#202020",
        opacity: index === 1 ? 0.9 : 0.82,
      },
    },
  }));

  const vertical = Array.from({ length: 6 }, (_, index) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: 138 + index * 164,
        top: 118 + ((hash + index * 17) % 26),
        width: 1,
        height: 374 - index * 16,
        backgroundColor: index === 4 ? ACCENT_DIM : "#1c1c1c",
        opacity: index === 4 ? 0.8 : 0.62,
      },
    },
  }));

  return [...horizontal, ...vertical];
}

function tagChildren(tags) {
  const normalized = (Array.isArray(tags) ? tags : [])
    .filter((tag) => typeof tag === "string" && tag.trim())
    .slice(0, 3)
    .map((tag) => clampText(tag.toUpperCase(), 24));

  const values = normalized.length > 0 ? normalized : ["AI VISIBILITY"];
  return values.map((tag, index) => ({
    type: "div",
    props: {
      style: {
        border: "1px solid #333333",
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1,
        color: index === 0 ? "#cfcfcf" : "#8f8f8f",
        backgroundColor: "#090909",
        borderColor: index === 0 ? ACCENT_BORDER : "#292929",
        letterSpacing: 0,
      },
      children: tag,
    },
  }));
}

async function renderImage(post, fontData) {
  const title = clampText(post.title || post.slug, 126);
  const fontSize = titleFontSize(title);
  const date = formatDate(post.date);
  const seed = `${post.slug}:${post.title}:${(post.tags || []).join(",")}`;

  const svg = await satori({
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        backgroundColor: "#060607",
        color: "#e8e8e8",
        fontFamily: "Inter",
      },
      children: [
        ...gridDots(),
        ...backgroundAscii(seed),
        ...geometricLines(seed),
        ...accentDots(seed),
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 0,
              top: 90,
              width: WIDTH,
              height: 1,
              backgroundColor: "#222222",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 0,
              bottom: 86,
              width: WIDTH,
              height: 1,
              backgroundColor: "#151515",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 42,
              left: 70,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 16,
              fontWeight: 400,
              color: "#999999",
              letterSpacing: 0,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: 12,
                    height: 12,
                    border: "1px solid #666666",
                    backgroundColor: "#111111",
                  },
                },
              },
              "CL",
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 42,
              right: 70,
              display: "flex",
              alignItems: "center",
              fontSize: 16,
              fontWeight: 400,
              color: "#666666",
              letterSpacing: 0,
            },
            children: date ? `WRITING / ${date}` : "WRITING",
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 70,
              top: 172,
              width: 910,
              fontSize,
              fontWeight: 400,
              color: "#f2f2f2",
              lineHeight: 1.12,
              letterSpacing: 0,
              margin: 0,
            },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: 70,
              bottom: 44,
              fontSize: 17,
              fontWeight: 400,
              color: ACCENT,
              opacity: 0.96,
              letterSpacing: 0,
            },
            children: "christianlehman.com",
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 70,
              bottom: 42,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              maxWidth: 740,
            },
            children: tagChildren(post.tags),
          },
        },
      ],
    },
  }, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Inter", data: fontData.regular, weight: 400, style: "normal" },
      { name: "Inter", data: fontData.medium, weight: 500, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  return resvg.render().asPng();
}

if (!fs.existsSync(POSTS_DIR)) {
  console.log("No posts directory — nothing to do.");
  process.exit(0);
}

fs.mkdirSync(IMAGES_DIR, { recursive: true });
const fontData = {
  regular: fs.readFileSync(FONT_REGULAR_PATH),
  medium: fs.readFileSync(FONT_MEDIUM_PATH),
};
const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).sort();
let generated = 0;
let unchanged = 0;
let skippedDuplicateSlugs = 0;
const seenSlugs = new Set();

for (const filename of files) {
  const filepath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filepath, "utf8");
  const { data } = matter(raw);
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");

  if (seenSlugs.has(slug)) {
    skippedDuplicateSlugs += 1;
    continue;
  }
  seenSlugs.add(slug);

  const imageFile = path.join(IMAGES_DIR, `${slug}.png`);
  const png = await renderImage({
    slug,
    title: data.title || slug,
    date: data.date,
    tags: data.tags || [],
    section: data.section || "founderos",
  }, fontData);

  if (!fs.existsSync(imageFile) || !fs.readFileSync(imageFile).equals(png)) {
    fs.writeFileSync(imageFile, png);
    generated += 1;
  } else {
    unchanged += 1;
  }
}

console.log(`Generated ${generated} image(s); unchanged ${unchanged} image(s); skipped ${skippedDuplicateSlugs} duplicate slug(s).`);
