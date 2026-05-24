const BASE = "https://christianlehman.com";

export function cleanMarkdownField(value: string | null | undefined): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function buildDocumentMarkdown(opts: {
  title: string;
  summary?: string;
  canonicalPath: string;
  metaLines?: string[];
  body?: string;
}): string {
  const canonical = opts.canonicalPath.startsWith("http")
    ? opts.canonicalPath
    : `${BASE}${opts.canonicalPath}`;

  const lines = [`# ${opts.title}`, ""];
  if (opts.summary) lines.push(opts.summary, "");
  lines.push(`Canonical URL: ${canonical}`);
  if (opts.metaLines?.length) {
    for (const line of opts.metaLines) lines.push(line);
  }
  if (opts.body?.trim()) {
    lines.push("", opts.body.trim());
  }
  return lines.join("\n");
}
