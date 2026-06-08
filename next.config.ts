import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/blog/:slug.md", destination: "/blog-md/:slug" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/blog/how-to-track-chatgpt-perplexity-ai-search-traffic-attribution",
        destination: "/blog/how-to-track-ai-search-traffic-attribution-cmo-guide",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
