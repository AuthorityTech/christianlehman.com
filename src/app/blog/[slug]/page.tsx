import { getAllPosts, getPost } from "@/lib/posts";
import { normalizeMarkdown, normalizeProseHtml } from "@/lib/normalizeMarkdown";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { Metadata } from "next";
import Link from "next/link";
import { PROFILE_IMAGE_URL } from "@/lib/site";
import { formatShareDate, getPostShare } from "@/lib/postShare";
import { generateBlogJsonLd, CL_BLOG_CONFIG } from "@editorialkit/schema";

export const dynamicParams = true;
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

const DEFAULT_AVATAR = PROFILE_IMAGE_URL;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const share = getPostShare(post);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: "https://christianlehman.com/blog/" + slug },
    openGraph: {
      title: post.title + " — Christian Lehman",
      description: post.description,
      type: "article",
      url: "https://christianlehman.com/blog/" + slug,
      publishedTime: post.date,
      modifiedTime: post.lastModified || post.date,
      authors: ["Christian Lehman"],
      images: [{ url: share.imageUrl, width: share.width, height: share.height, alt: share.alt }],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@christianlehman",
      title: post.title + " — Christian Lehman",
      description: post.description,
      images: [share.imageUrl],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const normalizedContent = normalizeMarkdown(post.content);
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(normalizedContent);
  const html = normalizeProseHtml(processed.toString());

  const share = getPostShare(post);

  const blogLd = generateBlogJsonLd(
    {
      slug,
      title: post.title,
      description: post.description,
      publishDate: post.date,
      lastModified: post.lastModified,
      body: html,
      featuredImage: share.imageUrl,
      featuredImageAlt: share.alt,
    },
    CL_BLOG_CONFIG,
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogLd }} />

      <nav className="mb-12">
        <Link
          href="/blog"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
        >
          ← Writing
        </Link>
      </nav>

      <header className="mb-10">
        <h1 data-speakable="headline" className="mb-5 font-display text-[1.65rem] font-normal leading-tight tracking-[-0.02em] text-nothing-display md:text-[2rem]">
          {post.title}
        </h1>
        {post.description && <p data-speakable="summary" className="mb-5 text-[14px] font-light leading-relaxed text-nothing-secondary">{post.description}</p>}

        <div className="mb-4 flex items-center gap-3">
          <img
            src={DEFAULT_AVATAR}
            alt="Christian Lehman"
            width={28}
            height={28}
            className="rounded-full border border-nothing-border object-cover"
          />
          <div className="text-[12px] leading-snug text-nothing-secondary">
            <span className="text-nothing-primary">Christian Lehman</span>
            {" "}
            ·{" "}
            <a
              href="https://authoritytech.io"
              target="_blank"
              rel="noopener"
              className="text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
            >
              AuthorityTech
            </a>
            {" "}
            ·{" "}
            <a
              href="https://machinerelations.ai"
              target="_blank"
              rel="noopener"
              className="text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
            >
              Machine Relations
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <time className="font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-disabled">{formatShareDate(post.date)}</time>
          {post.tags && post.tags.length > 0 && (
            <>
              <span className="text-nothing-border">·</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-nothing-borderHi bg-nothing-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-nothing-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="-mx-0 mb-12">
        <img
          src={share.imageUrl}
          alt={share.alt}
          width={share.width}
          height={share.height}
          className="w-full rounded-[4px] border border-nothing-border"
          style={{ aspectRatio: "1200/630", objectFit: "cover" }}
        />
      </div>

      <div
        className="prose prose-nothing max-w-none prose-p:mb-5 prose-p:leading-[1.75] prose-p:text-nothing-primary prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-nothing-display prose-a:text-link prose-a:no-underline prose-strong:text-nothing-primary prose-li:text-nothing-secondary prose-blockquote:border-nothing-border prose-blockquote:text-nothing-secondary prose-code:text-nothing-primary prose-pre:rounded prose-pre:border prose-pre:border-nothing-border prose-pre:bg-nothing-raised prose-hr:border-nothing-border prose-h2:mb-4 prose-h2:mt-10 hover:prose-a:text-nothing-primary"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <hr className="mb-10 mt-16 border-nothing-border" />

      <section className="mb-10">
        <h2 className="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-secondary">About Christian Lehman</h2>
        <p className="mb-2 text-[13px] leading-relaxed text-nothing-secondary">
          Christian Lehman is Co-Founder of{" "}
          <a
            href="https://authoritytech.io"
            target="_blank"
            rel="noopener"
            className="text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
          >
            AuthorityTech
          </a>{" "}
          — the world&apos;s first AI-native Machine Relations agency. He writes AI shortlist intelligence from live B2B buying queries: which brands
          surface, which sources get cited, and where visibility breaks.
        </p>
      </section>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={DEFAULT_AVATAR}
            alt="Christian Lehman"
            width={32}
            height={32}
            className="rounded-full border border-nothing-border object-cover"
          />
          <div>
            <p className="text-[12px] leading-snug text-nothing-primary">Christian Lehman</p>
            <div className="mt-0.5 flex gap-3 text-[11px] text-nothing-secondary">
              <a
                href="https://authoritytech.io"
                target="_blank"
                rel="noopener"
                className="text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
              >
                AuthorityTech
              </a>
              <span>·</span>
              <a
                href="https://machinerelations.ai"
                target="_blank"
                rel="noopener"
                className="text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
              >
                Machine Relations
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
