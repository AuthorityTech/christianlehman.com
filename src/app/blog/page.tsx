import { getAllPosts } from "@/lib/posts";
import { CANONICAL_ESSAY_SLUG } from "@/lib/seo";
import { formatShareDate } from "@/lib/postShare";
import { BLOG_COPY } from "@/lib/page-copy";
import Link from "next/link";
import type { Metadata } from "next";
const BASE = "https://christianlehman.com";

export const metadata: Metadata = {
  title: BLOG_COPY.title,
  description: BLOG_COPY.metadataDescription,
  alternates: { canonical: "https://christianlehman.com/blog" },
  openGraph: {
    title: "Writing — Christian Lehman",
    description: BLOG_COPY.visibleDescription,
    url: "https://christianlehman.com/blog",
  },
};

function buildBlogSchema(posts: ReturnType<typeof getAllPosts>) {
  const canonical = posts.find((post) => post.slug === CANONICAL_ESSAY_SLUG);
  const orderedPosts = canonical
    ? [canonical, ...posts.filter((post) => post.slug !== CANONICAL_ESSAY_SLUG)]
    : posts;

  const itemList = orderedPosts.map((post, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${BASE}/blog/${post.slug}`,
    item: {
      "@type": "BlogPosting",
      "@id": `${BASE}/blog/${post.slug}#article`,
      url: `${BASE}/blog/${post.slug}`,
      headline: post.title,
      datePublished: post.date,
      dateModified: post.lastModified || post.date,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${BASE}/blog#blog`,
        name: BLOG_COPY.schemaName,
        description: BLOG_COPY.schemaDescription,
        url: `${BASE}/blog`,
        author: { "@type": "Person", "@id": `${BASE}/#person` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/blog#collection`,
        url: `${BASE}/blog`,
        name: BLOG_COPY.collectionName,
        isPartOf: { "@id": `${BASE}/#website` },
        mainEntity: { "@id": `${BASE}/blog#item-list` },
        breadcrumb: { "@id": `${BASE}/blog#breadcrumb` },
      },
      {
        "@type": "ItemList",
        "@id": `${BASE}/blog#item-list`,
        name: BLOG_COPY.itemListName,
        numberOfItems: itemList.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: itemList,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE}/blog#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: {
              "@type": "WebPage",
              "@id": `${BASE}`,
              name: "Home",
            },
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Writing",
            item: {
              "@type": "WebPage",
              "@id": `${BASE}/blog`,
              name: BLOG_COPY.heading,
            },
          },
        ],
      },
    ],
  };
}

function PostList({ posts }: { posts: ReturnType<typeof getAllPosts> }) {
  return (
    <div className="space-y-10">
      {posts.map((post) => (
        <article key={post.slug} className="group">
          <Link href={"/blog/" + post.slug} className="block">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="mb-1.5 text-[15px] font-normal leading-snug text-nothing-primary transition-colors duration-200 ease-nothing group-hover:text-link">
                  {post.title}
                </h3>
                {post.description && <p className="text-[14px] leading-relaxed text-nothing-secondary">{post.description}</p>}
              </div>
              <time className="flex-shrink-0 whitespace-nowrap pt-[3px] font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-disabled">
                {formatShareDate(post.date)}
              </time>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-nothing-borderHi bg-nothing-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-nothing-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const all = getAllPosts();
  const blogSchema = buildBlogSchema(all);
  const canonicalEssay = all.find((post) => post.slug === CANONICAL_ESSAY_SLUG);
  const remaining = all.filter((post) => post.slug !== CANONICAL_ESSAY_SLUG);
  const essays = remaining.filter((p) => p.section === "essay");
  const founderos = remaining.filter((p) => p.section !== "essay");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <header className="mb-16">
        <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-nothing-display">{BLOG_COPY.heading}</h1>
        <p className="max-w-xl text-[14px] font-light leading-relaxed text-nothing-secondary">
          {BLOG_COPY.visibleDescription}
        </p>
      </header>

      {canonicalEssay && (
        <section className="mb-16">
          <h2 className="mb-5 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-secondary">{BLOG_COPY.startHereHeading}</h2>
          <article className="border border-nothing-border bg-nothing-surface p-5">
            <p className="mb-2 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-accent">{BLOG_COPY.foundationalEssayLabel}</p>
            <Link href={"/blog/" + canonicalEssay.slug} className="group block">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1.5 text-[17px] font-medium leading-snug text-nothing-display transition-colors duration-200 ease-nothing group-hover:text-link">
                    {canonicalEssay.title}
                  </h3>
                  {canonicalEssay.description && (
                    <p className="text-[14px] leading-relaxed text-nothing-secondary">{canonicalEssay.description}</p>
                  )}
                </div>
                <time className="flex-shrink-0 whitespace-nowrap pt-[3px] font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-disabled">
                  {formatShareDate(canonicalEssay.date)}
                </time>
              </div>
            </Link>
          </article>
        </section>
      )}

      {founderos.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-secondary">{BLOG_COPY.briefsHeading}</h2>
          <PostList posts={founderos} />
        </section>
      )}

      {essays.length > 0 && (
        <>
          {founderos.length > 0 && <hr className="mb-16 border-nothing-border" />}
          <section className="mb-20">
            <h2 className="mb-8 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-secondary">{BLOG_COPY.essaysHeading}</h2>
            <PostList posts={essays} />
          </section>
        </>
      )}

      {essays.length === 0 && founderos.length === 0 && (
        <p className="text-[14px] text-nothing-secondary">{BLOG_COPY.emptyWriting}</p>
      )}

      <hr className="mb-16 border-nothing-border" />

      <section>
        <h2 className="mb-8 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-secondary">Also Published</h2>
        <div className="space-y-10">
          <div>
            <a href="https://authoritytech.io/blog" target="_blank" rel="noopener" className="group block">
              <h3 className="mb-1 text-[15px] font-normal leading-snug text-link transition-colors duration-200 ease-nothing group-hover:text-nothing-primary">
                AuthorityTech Blog →
              </h3>
              <p className="text-[14px] leading-relaxed text-nothing-secondary">
                Machine Relations, AI visibility, and earned media strategy. Research, analysis, and playbooks for making brands citable by AI.
              </p>
            </a>
          </div>
          <div>
            <a href="https://authoritytech.io/curated" target="_blank" rel="noopener" className="group block">
              <h3 className="mb-1 text-[15px] font-normal leading-snug text-link transition-colors duration-200 ease-nothing group-hover:text-nothing-primary">
                Curated Newsletter →
              </h3>
              <p className="text-[14px] leading-relaxed text-nothing-secondary">
                Weekly signal on AI search, LLM behavior, and what&apos;s actually shifting in the category. Co-authored with Christian Lehman.
              </p>
            </a>
          </div>
          <div>
            <a href="https://medium.com/@christian-lehman" target="_blank" rel="noopener" className="group block">
              <h3 className="mb-1 text-[15px] font-normal leading-snug text-link transition-colors duration-200 ease-nothing group-hover:text-nothing-primary">
                Medium →
              </h3>
              <p className="text-[14px] leading-relaxed text-nothing-secondary">
                Longer essays on Machine Relations, AI visibility, and what the data shows about the AI shortlist.
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
