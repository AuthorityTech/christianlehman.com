export const SEO_LIMITS = {
  titleMax: 60,
  descriptionMin: 120,
  descriptionMax: 160,
};

export const SITE_SEO_TITLE = "Christian Lehman | AuthorityTech Co-Founder";
export const SITE_SEO_DESCRIPTION =
  "Christian Lehman is cofounder and CGO of AuthorityTech, writing field-tested Machine Relations playbooks for AI visibility, PR, and B2B growth.";

export const BLOG_SEO_TITLE = "Writing on AI Visibility and Machine Relations";
export const BLOG_SEO_DESCRIPTION =
  "Christian Lehman writes for CMOs and growth leaders on PR, AI search, Machine Relations, and winning durable visibility in the AI era.";

const DESCRIPTION_EXTENSION =
  "Christian Lehman explains the AI visibility stakes for CMOs, growth teams, and Machine Relations operators.";

export function normalizeSeoText(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeSeoText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (typeof value.toString === "function" && value.toString !== Object.prototype.toString) {
      return value.toString().replace(/\s+/g, " ").trim();
    }
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

export function trimAtWordBoundary(value, maxLength = SEO_LIMITS.descriptionMax) {
  const text = normalizeSeoText(value);
  if (text.length <= maxLength) return text;

  const suffix = "...";
  const sliceLength = Math.max(0, maxLength - suffix.length);
  const candidate = text.slice(0, sliceLength);
  const boundary = Math.max(
    candidate.lastIndexOf(" "),
    candidate.lastIndexOf(","),
    candidate.lastIndexOf(";"),
    candidate.lastIndexOf(":"),
  );
  const minimumBoundary = Math.floor(maxLength * 0.6);
  const trimmed = (boundary >= minimumBoundary ? candidate.slice(0, boundary) : candidate)
    .replace(/[\s,;:.-]+$/g, "")
    .trim();

  return `${trimmed}${suffix}`.slice(0, maxLength);
}

export function htmlSerializedLength(value) {
  return normalizeSeoText(value).split("").reduce((length, char) => {
    if (char === "&") return length + 5;
    if (char === "<" || char === ">") return length + 4;
    if (char === "'") return length + 5;
    if (char === '"') return length + 6;
    return length + 1;
  }, 0);
}

export function trimForHtmlSerializedLength(value, maxLength) {
  const text = normalizeSeoText(value);
  if (htmlSerializedLength(text) <= maxLength) return text;

  for (let rawLimit = text.length - 1; rawLimit > 0; rawLimit -= 1) {
    const candidate = trimAtWordBoundary(text, rawLimit);
    if (htmlSerializedLength(candidate) <= maxLength) return candidate;
  }

  return "";
}

export function buildSeoTitle(value, fallback = SITE_SEO_TITLE) {
  const title = normalizeSeoText(value) || fallback;
  return trimForHtmlSerializedLength(title, SEO_LIMITS.titleMax);
}

export function buildSeoDescription(value, fallback = SITE_SEO_DESCRIPTION) {
  let description = normalizeSeoText(value) || fallback;

  if (description.length < SEO_LIMITS.descriptionMin) {
    description = `${description} ${DESCRIPTION_EXTENSION}`;
  }

  return trimForHtmlSerializedLength(description, SEO_LIMITS.descriptionMax);
}

export function seoMetadataForRoute({ title, description, canonical }) {
  return {
    title: buildSeoTitle(title),
    description: buildSeoDescription(description),
    canonical: normalizeSeoText(canonical),
  };
}
