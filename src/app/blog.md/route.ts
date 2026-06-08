export const dynamic = "force-static";
export const revalidate = 3600;

import { blogIndexMarkdown, markdownResponse } from "@/lib/machine-content";
import { SITE_URL } from "@/lib/site";

export function GET() {
  return markdownResponse(blogIndexMarkdown(), `${SITE_URL}/blog`);
}
