import { blogIndexMarkdown, markdownResponse } from "@/lib/machine-content";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return markdownResponse(blogIndexMarkdown());
}
