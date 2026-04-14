import { getAllPosts, getPost } from "@/lib/posts";
import { normalizeMarkdown, normalizeProseHtml } from "@/lib/normalizeMarkdown";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { Metadata } from "next";
import Link from "next/link";
import { PROFILE_IMAGE_URL } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const DEFAULT_AVATAR = PROFILE_IMAGE_URL;
const MACHINE_RELATIONS_TERM_ID = "https://machinerelations.ai/#term";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const image = post.featured_image;
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
      images: image ? [{ url: image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@christianlehman",
      title: post.title + " — Christian Lehman",
      description: post.description,
      images: image ? [image] : undefined,
    },
  };
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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

  const image = post.featured_image;
  const pageUrl = "https://christianlehman.com/blog/" + slug;
  const webPageId = pageUrl + "#webpage";
  const articleId = pageUrl + "#article";
  const breadcrumbId = pageUrl + "#breadcrumb";

  const postSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: pageUrl,
        name: post.title,
        isPartOf: { "@id": "https://christianlehman.com/#website" },
        about: [{ "@id": MACHINE_RELATIONS_TERM_ID }],
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": articleId },
      },
      {
        "@type": "BlogPosting",
        "@id": articleId,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.lastModified || post.date,
        url: pageUrl,
        image,
        author: {
          "@type": "Person",
          "@id": "https://christianlehman.com/#person",
          name: "Christian Lehman",
          url: "https://christianlehman.com",
          jobTitle: "Co-Founder, AuthorityTech",
        },
        publisher: { "@type": "Person", "@id": "https://christianlehman.com/#person" },
        mainEntityOfPage: { "@id": webPageId },
        keywords: post.tags?.join(", ") ?? "",
        isPartOf: { "@type": "Blog", "@id": "https://christianlehman.com/blog#blog" },
        about: [{ "@id": MACHINE_RELATIONS_TERM_ID }, { "@id": "https://authoritytech.io/#organization" }],
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: {
              "@type": "WebPage",
              "@id": "https://christianlehman.com",
              name: "Home",
            },
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Writing",
            item: {
              "@type": "WebPage",
              "@id": "https://christianlehman.com/blog",
              name: "Writing",
            },
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: {
              "@type": "WebPage",
              "@id": pageUrl,
              name: post.title,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }} />

      <nav className="mb-12">
        <Link
          href="/blog"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
        >
          ← Writing
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="mb-5 font-display text-[1.65rem] font-normal leading-tight tracking-[-0.02em] text-nothing-display md:text-[2rem]">
          {post.title}
        </h1>

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
          <time className="font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-disabled">{formatDate(post.date)}</time>
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

      {post.featured_image && (
        <div className="-mx-0 mb-12">
          <img
            src={post.featured_image}
            alt={post.title}
            width={1200}
            height={630}
            className="w-full rounded-[4px] border border-nothing-border"
            style={{ aspectRatio: "1200/630", objectFit: "cover" }}
          />
        </div>
      )}

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
          — the world&apos;s first AI-native Machine Relations agency. He tracks which companies are winning and losing the AI shortlist battle across every
          major B2B vertical, and writes about what the data actually shows.
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
