// @ts-check
import { remark } from "remark";
import remarkGfm from "remark-gfm";

const EXCLUDED_SECTION_TITLES = new Set(["source", "sources", "reference", "references", "footnote", "footnotes"]);

/**
 * @typedef {{ type?: string; value?: unknown; alt?: unknown; depth?: number; data?: { hProperties?: Record<string, unknown> }; children?: MarkdownNode[] }} MarkdownNode
 * @typedef {{ id: string; title: string; level: 2 | 3 }} SectionNavItem
 */

/**
 * @param {string} title
 */
function normalizeTitleKey(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * @param {string} title
 */
function isExcludedSection(title) {
  return EXCLUDED_SECTION_TITLES.has(normalizeTitleKey(title));
}

/**
 * @param {string} title
 */
function isFaqSection(title) {
  const key = normalizeTitleKey(title);
  return key === "faq" || key === "faqs" || key.startsWith("faq ") || key.startsWith("frequently asked questions");
}

/**
 * @param {MarkdownNode} node
 * @returns {string}
 */
function textFromNode(node) {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text" || node.type === "inlineCode") return String(node.value || "");
  if (node.type === "break") return " ";
  if (node.type === "image") return String(node.alt || "");
  if (!Array.isArray(node.children)) return "";
  return node.children.map(textFromNode).join("");
}

/**
 * @param {MarkdownNode} node
 * @param {(heading: MarkdownNode) => void} visitor
 */
function visitHeadings(node, visitor) {
  if (!node || typeof node !== "object") return;
  if (node.type === "heading") visitor(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) visitHeadings(child, visitor);
}

/**
 * @param {string} title
 */
export function headingIdFromTitle(title) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug || "section";
}

function createHeadingIdAllocator() {
  const seen = new Map();
  /**
   * @param {string} title
   */
  return (title) => {
    const base = headingIdFromTitle(title);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/**
 * @param {string} markdown
 * @returns {SectionNavItem[]}
 */
export function buildSectionNav(markdown) {
  const tree = /** @type {MarkdownNode} */ (remark().use(remarkGfm).parse(markdown || ""));
  const nextId = createHeadingIdAllocator();
  /** @type {SectionNavItem[]} */
  const items = [];
  let insideExcludedSection = false;
  let insideFaqSection = false;

  visitHeadings(tree, (heading) => {
    const title = textFromNode(heading).replace(/\s+/g, " ").trim();
    const id = nextId(title);

    if (heading.depth === 2) {
      insideExcludedSection = isExcludedSection(title);
      insideFaqSection = isFaqSection(title);
    }

    if (heading.depth !== 2 && heading.depth !== 3) return;
    if (!title || isExcludedSection(title) || insideExcludedSection) return;
    if (heading.depth === 3 && insideFaqSection) return;

    items.push({ id, title, level: heading.depth });
  });

  return items;
}

export function remarkHeadingIds() {
  /**
   * @param {MarkdownNode} tree
   */
  return (tree) => {
    const nextId = createHeadingIdAllocator();
    visitHeadings(tree, (heading) => {
      const title = textFromNode(heading).replace(/\s+/g, " ").trim();
      const id = nextId(title);
      heading.data = heading.data || {};
      heading.data.hProperties = {
        ...(heading.data.hProperties || {}),
        id,
      };
    });
  };
}
