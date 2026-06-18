// @ts-check
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { remarkHeadingIds } from "./section-nav.mjs";

/**
 * @param {string} content
 */
export function normalizeMarkdown(content) {
  if (!content || typeof content !== "string") return "";

  let out = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  out = out
    .split("\n")
    .map((line) => {
      const trimmed = line.trimEnd();
      if (trimmed.startsWith(">")) {
        const afterArrow = trimmed.slice(1).trimStart();
        return ">" + afterArrow.replace(/["\u201C\u201D]/g, "").trimStart();
      }
      return trimmed;
    })
    .join("\n");

  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

/**
 * @param {string} inner
 */
function stripQuotesFromBlockquoteInner(inner) {
  return inner
    .replace(/["\u201C\u201D]/g, "")
    .replace(/&quot;/gi, "")
    .replace(/&ldquo;/gi, "")
    .replace(/&rdquo;/gi, "")
    .replace(/&#8220;/g, "")
    .replace(/&#8221;/g, "")
    .replace(/&#34;/g, "")
    .replace(/&#x22;/gi, "");
}

/**
 * @param {string} html
 */
export function normalizeProseHtml(html) {
  if (!html || typeof html !== "string") return "";

  let out = html
    .replace(/<p>\s+/g, "<p>")
    .replace(/\s+<\/p>/g, "</p>")
    .replace(/(<blockquote[^>]*>)\s+/g, "$1")
    .replace(/\s+(<\/blockquote>)/g, "$1");

  out = out.replace(
    /(<blockquote[^>]*>)([\s\S]*?)(\s*<\/blockquote>)/g,
    (_, open, inner, close) => open + stripQuotesFromBlockquoteInner(inner) + close,
  );

  return out;
}

/**
 * @param {string} markdown
 */
export async function renderMarkdownHtml(markdown) {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHeadingIds)
    .use(remarkHtml, { sanitize: false })
    .process(normalizeMarkdown(markdown));

  return normalizeProseHtml(processed.toString());
}
