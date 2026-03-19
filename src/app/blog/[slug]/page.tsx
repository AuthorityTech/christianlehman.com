import { getAllPosts, getPost } from "@/lib/posts";
import { normalizeMarkdown, normalizeProseHtml } from "@/lib/normalizeMarkdown";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const DEFAULT_AVATAR = "https://storage.googleapis.com/authoritytech-prod-assets/public/logos/Christian_pfp";

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

  const postSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": pageUrl + "#article",
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
          sameAs: ["https://authoritytech.io", "https://machinerelations.ai"],
        },
        publisher: { "@type": "Person", "@id": "https://christianlehman.com/#person" },
        keywords: post.tags?.join(", ") ?? "",
        isPartOf: { "@type": "Blog", "@id": "https://christianlehman.com/blog#blog" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": pageUrl + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://christianlehman.com" },
          { "@type": "ListItem", position: 2, name: "Writing", item: "https://christianlehman.com/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }} />

      <nav className="mb-12">
        <Link href="/blog" className="text-[12px] text-link hover:text-[#1a1a1a] transition-colors uppercase tracking-[0.1em]">← Writing</Link>
      </nav>

      <header className="mb-10">
        <h1 className="text-[26px] font-semibold text-[#1a1a1a] leading-tight tracking-tight mb-5">{post.title}</h1>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={DEFAULT_AVATAR}
            alt="Christian Lehman"
            width={28}
            height={28}
            className="rounded-full object-cover ring-1 ring-[#e5e5e5]"
          />
          <div className="text-[12px] text-[#6b6b6b] leading-snug">
            <span className="text-[#1a1a1a]">Christian Lehman</span>
            {" "}·{" "}
            <a href="https://authoritytech.io" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">AuthorityTech</a>
            {" "}·{" "}
            <a href="https://machinerelations.ai" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">Machine Relations</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <time className="text-[11px] text-[#8a8a8a] uppercase tracking-wide">{formatDate(post.date)}</time>
          {post.tags && post.tags.length > 0 && (
            <>
              <span className="text-[#e5e5e5]">·</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-[#a89868] border border-[#e5e5e5] bg-[#fafafa] rounded px-2 py-0.5 uppercase tracking-wide">{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {post.featured_image && (
        <div className="mb-12">
          <img
            src={post.featured_image}
            alt={post.title}
            width={1200}
            height={630}
            className="w-full rounded-sm"
            style={{ aspectRatio: "1200/630", objectFit: "cover" }}
          />
        </div>
      )}

      <div
        className="prose prose-rams max-w-none prose-p:text-[#1a1a1a] prose-p:leading-[1.8] prose-headings:text-[#1a1a1a] prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-link prose-a:underline hover:prose-a:text-[#1a1a1a] prose-strong:text-[#1a1a1a] prose-li:text-[#6b6b6b] prose-blockquote:text-[#6b6b6b] prose-blockquote:border-[#e5e5e5] prose-code:text-[#1a1a1a] prose-pre:bg-[#f0f0f0] prose-pre:border prose-pre:border-[#e5e5e5] prose-hr:border-[#e5e5e5] prose-h2:mt-10 prose-h2:mb-4 prose-p:mb-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <hr className="border-[#e5e5e5] mt-16 mb-10" />

      <section className="mb-10">
        <h2 className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-[0.15em] mb-3">About Christian Lehman</h2>
        <p className="text-[13px] text-[#6b6b6b] leading-relaxed mb-2">
          Christian Lehman is Co-Founder of{" "}
          <a href="https://authoritytech.io" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">AuthorityTech</a>
          {" "}— the world's first AI-native earned media agency. He tracks which companies are winning and losing the AI shortlist battle across every major B2B vertical, and writes about what the data actually shows.
        </p>
      </section>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={DEFAULT_AVATAR}
            alt="Christian Lehman"
            width={32}
            height={32}
            className="rounded-full object-cover ring-1 ring-[#e5e5e5]"
          />
          <div>
            <p className="text-[12px] text-[#1a1a1a] leading-snug">Christian Lehman</p>
            <div className="flex gap-3 text-[11px] text-[#6b6b6b] mt-0.5">
              <a href="https://authoritytech.io" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">AuthorityTech</a>
              <span>·</span>
              <a href="https://machinerelations.ai" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">Machine Relations</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
