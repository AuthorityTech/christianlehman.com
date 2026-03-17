import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const OG_IMAGE = "https://storage.googleapis.com/authoritytech-prod-assets/public/logos/Christian_pfp";

export const metadata: Metadata = {
  metadataBase: new URL("https://christianlehman.com"),
  title: {
    default: "Christian Lehman — Co-Founder, AuthorityTech · Machine Relations",
    template: "%s — Christian Lehman",
  },
  description:
    "Christian Lehman is Co-Founder of AuthorityTech, the world's first AI-native earned media agency. Expert in revenue operations, B2B go-to-market strategy, and making brands visible to AI.",
  keywords: [
    "Machine Relations",
    "AuthorityTech",
    "Christian Lehman",
    "B2B growth",
    "revenue operations",
    "earned media",
    "AI visibility",
    "Generative Engine Optimization",
    "GEO",
    "AEO",
    "Answer Engine Optimization",
    "AI-native PR",
    "AI citation optimization",
    "LLM visibility",
  ],
  authors: [{ name: "Christian Lehman", url: "https://christianlehman.com" }],
  creator: "Christian Lehman",
  publisher: "Christian Lehman",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://christianlehman.com",
    siteName: "Christian Lehman",
    title: "Christian Lehman — Co-Founder, AuthorityTech · Machine Relations",
    description:
      "Co-Founder of AuthorityTech, the world's first AI-native earned media agency. Expert in revenue operations, B2B go-to-market strategy, and making brands visible to AI.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Christian Lehman — Co-Founder of AuthorityTech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@christianlehman",
    creator: "@christianlehman",
    title: "Christian Lehman — Co-Founder, AuthorityTech · Machine Relations",
    description:
      "Co-Founder of AuthorityTech, the world's first AI-native earned media agency. Revenue operator, B2B growth strategist.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: "https://christianlehman.com" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://christianlehman.com/#person",
      name: "Christian Lehman",
      givenName: "Christian",
      familyName: "Lehman",
      jobTitle: "Co-Founder, AuthorityTech",
      description:
        "Co-Founder of AuthorityTech, the world's first AI-native earned media agency. Expert in revenue operations, B2B go-to-market strategy, and making brands visible to AI. Practitioner of Machine Relations — the discipline of making brands visible to the AI engines your buyers use to make decisions.",
      url: "https://christianlehman.com",
      image: OG_IMAGE,
      mainEntityOfPage: { "@type": "WebPage", "@id": "https://christianlehman.com" },
      worksFor: { "@type": "Organization", "@id": "https://authoritytech.io/#organization" },
      sameAs: [
        "https://authoritytech.io",
        "https://machinerelations.ai",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://christianlehman.com/#website",
      url: "https://christianlehman.com",
      name: "Christian Lehman",
      description: "Personal site and writing of Christian Lehman — Co-Founder of AuthorityTech.",
      author: { "@type": "Person", "@id": "https://christianlehman.com/#person" },
      potentialAction: [
        {
          "@type": "ReadAction",
          target: "https://christianlehman.com/blog",
        },
      ],
    },
    {
      "@type": "ProfilePage",
      "@id": "https://christianlehman.com/#profile-page",
      url: "https://christianlehman.com",
      name: "Christian Lehman Profile",
      isPartOf: { "@id": "https://christianlehman.com/#website" },
      mainEntity: { "@id": "https://christianlehman.com/#person" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <link rel="icon" href={OG_IMAGE} />
        <link rel="alternate" type="application/rss+xml" title="Christian Lehman RSS Feed" href="https://christianlehman.com/feed.xml" />
        <meta name="theme-color" content="#fafafa" />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
