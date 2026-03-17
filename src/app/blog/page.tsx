import { getAllPosts } from "@/lib/posts";
import { CANONICAL_ESSAY_SLUG } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";
const BASE = "https://christianlehman.com";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays, FounderOS, and published work by Christian Lehman — founder of AuthorityTech and creator of Machine Relations.",
  alternates: { canonical: "https://christianlehman.com/blog" },
  openGraph: {
    title: "Writing — Christian Lehman",
    description: "Essays, FounderOS, and published work by Christian Lehman.",
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
        name: "FounderOS — Christian Lehman",
        description:
          "Essays, FounderOS, and published work by Christian Lehman — founder of AuthorityTech, creator of Machine Relations.",
        url: `${BASE}/blog`,
        author: { "@type": "Person", "@id": `${BASE}/#person` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/blog#collection`,
        url: `${BASE}/blog`,
        name: "Writing — FounderOS",
        isPartOf: { "@id": `${BASE}/#website` },
        mainEntity: { "@id": `${BASE}/blog#item-list` },
        breadcrumb: { "@id": `${BASE}/blog#breadcrumb` },
      },
      {
        "@type": "ItemList",
        "@id": `${BASE}/blog#item-list`,
        name: "FounderOS Posts",
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
            item: `${BASE}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Writing",
            item: `${BASE}/blog`,
          },
        ],
      },
    ],
  };
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function PostList({ posts }: { posts: ReturnType<typeof getAllPosts> }) {
  return (
    <div className="space-y-10">
      {posts.map((post) => (
        <article key={post.slug} className="group">
          <Link href={"/blog/" + post.slug} className="block">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-medium text-[#1a1a1a] group-hover:text-link transition-colors leading-snug mb-1.5">{post.title}</h3>
                {post.description && <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{post.description}</p>}
              </div>
              <time className="text-[11px] text-[#8a8a8a] whitespace-nowrap pt-[3px] flex-shrink-0 uppercase tracking-wide">{formatDate(post.date)}</time>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-[#a89868] border border-[#e5e5e5] bg-[#fafafa] rounded px-2 py-0.5 uppercase tracking-wide">{tag}</span>
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
    <div className="max-w-2xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      {/* Header */}
      <header className="mb-14">
        <h1 className="text-[20px] font-semibold text-[#1a1a1a] mb-2 tracking-tight">Writing</h1>
        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          Ideas on building, identity, and the mechanisms most founders miss.
        </p>
      </header>

      {canonicalEssay && (
        <section className="mb-14">
          <h2 className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-[0.15em] mb-5">Start Here</h2>
          <article className="border border-[#e5e5e5] bg-[#fafafa] rounded-sm p-5">
            <p className="text-[10px] text-[#a89868] uppercase tracking-[0.15em] mb-2">Foundational Essay</p>
            <Link href={"/blog/" + canonicalEssay.slug} className="group block">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-semibold text-[#1a1a1a] group-hover:text-link transition-colors leading-snug mb-1.5">
                    {canonicalEssay.title}
                  </h3>
                  {canonicalEssay.description && (
                    <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{canonicalEssay.description}</p>
                  )}
                </div>
                <time className="text-[11px] text-[#8a8a8a] whitespace-nowrap pt-[3px] flex-shrink-0 uppercase tracking-wide">
                  {formatDate(canonicalEssay.date)}
                </time>
              </div>
            </Link>
          </article>
        </section>
      )}

      {/* FounderOS — first */}
      {founderos.length > 0 && (
        <section className="mb-14">
          <h2 className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-[0.15em] mb-8">FounderOS</h2>
          <PostList posts={founderos} />
        </section>
      )}

      {/* Essays — second */}
      {essays.length > 0 && (
        <>
          {founderos.length > 0 && <hr className="border-[#e5e5e5] mb-14" />}
          <section className="mb-16">
            <h2 className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-[0.15em] mb-8">Essays</h2>
            <PostList posts={essays} />
          </section>
        </>
      )}

      {essays.length === 0 && founderos.length === 0 && (
        <p className="text-[#6b6b6b] text-[14px]">Coming soon.</p>
      )}

      <hr className="border-[#e5e5e5] mb-14" />

      {/* Also published */}
      <section>
        <h2 className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-[0.15em] mb-8">Also Published</h2>
        <div className="space-y-8">
          <div>
            <a href="https://authoritytech.io/blog" target="_blank" rel="noopener" className="group block">
              <h3 className="text-[15px] font-medium text-link group-hover:text-[#1a1a1a] transition-colors leading-snug mb-1">AuthorityTech Blog →</h3>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Machine Relations, AI visibility, and earned media strategy. Research, analysis, and playbooks for making brands citable by AI.</p>
            </a>
          </div>
          <div>
            <a href="https://authoritytech.io/curated" target="_blank" rel="noopener" className="group block">
              <h3 className="text-[15px] font-medium text-link group-hover:text-[#1a1a1a] transition-colors leading-snug mb-1">Curated Newsletter →</h3>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Weekly signal on AI search, LLM behavior, and what's actually shifting in the category. Co-authored with Christian Lehman.</p>
            </a>
          </div>
          <div>
            <a href="https://www.entrepreneur.com/author/jaxon-parrott" target="_blank" rel="noopener" className="group block">
              <h3 className="text-[15px] font-medium text-link group-hover:text-[#1a1a1a] transition-colors leading-snug mb-1">Entrepreneur Magazine →</h3>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Contributing author. AI search, the future of PR, and what brands need to do differently right now.</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}