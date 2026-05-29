import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";
import { PROFILE_IMAGE_URL } from "@/lib/site";
import { BLOG_COPY, HOME_COPY } from "@/lib/page-copy";

export const metadata: Metadata = {
  alternates: { canonical: "https://christianlehman.com" },
};

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
      {/* Hero */}
      <section className="mb-20">
        <div className="mb-10 flex items-start gap-5">
          <img
            src={PROFILE_IMAGE_URL}
            alt="Christian Lehman"
            width={56}
            height={56}
            className="mt-0.5 flex-shrink-0 rounded-full border border-nothing-border object-cover"
          />
          <div>
            <h1 className="font-display text-[2.25rem] font-normal leading-[1.1] tracking-[-0.02em] text-nothing-display">
              {HOME_COPY.name}
            </h1>
            <p className="mt-2 font-mono text-[11px] uppercase leading-snug tracking-[0.08em] text-nothing-secondary">
              {HOME_COPY.roleLine}
            </p>
          </div>
        </div>

        <p className="max-w-xl text-[15px] font-light leading-[1.65] text-nothing-secondary">
          {HOME_COPY.summary}
        </p>

        <div className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.1em] text-nothing-disabled">
          <a
            href="https://authoritytech.io"
            target="_blank"
            rel="noopener"
            className="transition-colors duration-200 ease-nothing hover:text-link"
          >
            AuthorityTech →
          </a>
          <a
            href="https://machinerelations.ai"
            target="_blank"
            rel="noopener"
            className="transition-colors duration-200 ease-nothing hover:text-link"
          >
            MachineRelations.ai →
          </a>
        </div>
      </section>

      <hr className="mb-16 border-nothing-border" />

      {/* Writing */}
      {posts.length > 0 && (
        <section>
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-nothing-secondary">{BLOG_COPY.heading}</h2>
            <Link
              href="/blog"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-link transition-colors duration-200 ease-nothing hover:text-nothing-primary"
            >
              All →
            </Link>
          </div>
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <h3 className="mb-1.5 text-[15px] font-normal leading-snug text-nothing-primary transition-colors duration-200 ease-nothing group-hover:text-link">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="mb-2 text-[14px] leading-relaxed text-nothing-secondary">{post.description}</p>
                  )}
                  <time className="font-mono text-[11px] uppercase tracking-[0.06em] text-nothing-disabled">{formatDate(post.date)}</time>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <section>
          <p className="text-[14px] text-nothing-secondary">{HOME_COPY.emptyWriting}</p>
        </section>
      )}
    </div>
  );
}
