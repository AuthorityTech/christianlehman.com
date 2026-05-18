import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts";
import { blogPostMarkdown, markdownResponse } from "@/lib/machine-content";

export const dynamic = "force-static";
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const md = blogPostMarkdown(slug);
  if (!md) notFound();
  return markdownResponse(md);
}
