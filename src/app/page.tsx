import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";
import { PROFILE_IMAGE_URL } from "@/lib/site";

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
    <div className="max-w-2xl mx-auto px-6 py-16">

      {/* Hero */}
      <section className="mb-16">

        {/* Identity */}
        <div className="flex items-start gap-5 mb-8">
          <img
            src={PROFILE_IMAGE_URL}
            alt="Christian Lehman"
            width={56}
            height={56}
            className="rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-[#e5e5e5]"
          />
          <div>
            <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight leading-tight mb-1">
              Christian Lehman
            </h1>
            <p className="text-[13px] text-[#6b6b6b] leading-snug">
              Co-Founder,{" "}
              <a href="https://authoritytech.io" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">
                AuthorityTech
              </a>
              {" "}·{" "}
              <a href="https://machinerelations.ai" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors">
                Machine Relations
              </a>
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[15px] text-[#6b6b6b] leading-[1.75] max-w-xl">
          I help companies become visible to AI. Co-Founded{" "}
          <a href="https://authoritytech.io" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors border-b border-[#e5e5e5] hover:border-link">
            AuthorityTech
          </a>
          {" "}— the world's first AI-native earned media agency.
          Revenue operator, B2B growth strategist, and practitioner of{" "}
          <a href="https://machinerelations.ai" target="_blank" rel="noopener" className="text-link hover:text-[#1a1a1a] transition-colors border-b border-[#e5e5e5] hover:border-link">
            Machine Relations
          </a>
          : the discipline of making brands visible to the AI engines your buyers use to make decisions.
        </p>

        {/* Links */}
        <div className="flex flex-wrap gap-5 mt-8 text-[12px] uppercase tracking-widest text-[#8a8a8a]">
          <a href="https://authoritytech.io" target="_blank" rel="noopener" className="hover:text-link transition-colors">AuthorityTech →</a>
          <a href="https://machinerelations.ai" target="_blank" rel="noopener" className="hover:text-link transition-colors">MachineRelations.ai →</a>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-[#e5e5e5] mb-14" />

      {/* Writing */}
      {posts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-[0.15em]">Writing</h2>
            <Link href="/blog" className="text-[11px] text-link hover:text-[#1a1a1a] transition-colors uppercase tracking-[0.1em]">All →</Link>
          </div>
          <div className="space-y-9">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <h3 className="text-[15px] font-medium text-[#1a1a1a] group-hover:text-link transition-colors leading-snug mb-1.5">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-[13px] text-[#6b6b6b] leading-relaxed mb-2">{post.description}</p>
                  )}
                  <time className="text-[11px] text-[#8a8a8a] uppercase tracking-wide">{formatDate(post.date)}</time>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <section>
          <p className="text-[#6b6b6b] text-[14px]">Writing coming soon.</p>
        </section>
      )}
    </div>
  );
}
