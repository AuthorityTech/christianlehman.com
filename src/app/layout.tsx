import type { Metadata } from "next";
import { Doto, Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PROFILE_IMAGE_URL, SITE_URL } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

const doto = Doto({
  subsets: ["latin"],
  variable: "--font-doto",
  weight: ["400", "700"],
});

const OG_IMAGE = PROFILE_IMAGE_URL;
const MACHINE_RELATIONS_TERM_ID = "https://machinerelations.ai/#term";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Christian Lehman — Co-Founder, AuthorityTech · Machine Relations",
    template: "%s — Christian Lehman",
  },
  description:
    "Christian Lehman is the cofounder and chief growth officer of AuthorityTech. He is the brand-facing architect and operator of Machine Relations execution across growth and client delivery.",
  keywords: [
    "Machine Relations",
    "AuthorityTech",
    "Christian Lehman",
    "AI visibility",
    "B2B growth",
    "revenue operations",
    "earned media",
    "Generative Engine Optimization",
    "GEO",
    "AEO",
    "AI citation optimization",
    "LLM visibility",
    "invisible shortlist",
    "AI shortlist",
  ],
  authors: [{ name: "Christian Lehman", url: SITE_URL }],
  creator: "Christian Lehman",
  publisher: "Christian Lehman",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Christian Lehman",
    title: "Christian Lehman — Co-Founder, AuthorityTech · Machine Relations",
    description:
      "Co-Founder of AuthorityTech — the world\'s first Machine Relations agency. Tracks which brands are winning and losing the AI shortlist battle across every major B2B vertical.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Christian Lehman — Co-Founder of AuthorityTech" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ChristianLehman",
    creator: "@ChristianLehman",
    title: "Christian Lehman — Co-Founder, AuthorityTech · Machine Relations",
    description: "Co-Founder of AuthorityTech — the world\'s first Machine Relations agency.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: [PROFILE_IMAGE_URL],
    shortcut: [PROFILE_IMAGE_URL],
    apple: [PROFILE_IMAGE_URL],
  },
  alternates: { canonical: SITE_URL },
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
      "@id": SITE_URL + "/#person",
      name: "Christian Lehman",
      givenName: "Christian",
      familyName: "Lehman",
      jobTitle: "Co-Founder, AuthorityTech",
      description:
        "Christian Lehman is the cofounder and chief growth officer of AuthorityTech. He is the brand-facing architect and operator of Machine Relations execution across growth and client delivery.",
      url: SITE_URL,
      image: OG_IMAGE,
      mainEntityOfPage: { "@type": "WebPage", "@id": SITE_URL },
      worksFor: { "@id": "https://authoritytech.io/#organization" },
      sameAs: [
        SITE_URL,
        "https://www.linkedin.com/in/christianhlehman",
        "https://x.com/ChristianLehman",
      ],
      knowsAbout: [
        { "@id": MACHINE_RELATIONS_TERM_ID },
        "AI Visibility",
        "Generative Engine Optimization",
        "B2B Revenue Operations",
        "Earned Media",
        "AI Shortlist Optimization",
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL,
      name: "Christian Lehman",
      description: "Official site and writing of Christian Lehman, cofounder and chief growth officer of AuthorityTech.",
      creator: { "@type": "Person", "@id": SITE_URL + "/#person" },
      about: { "@id": MACHINE_RELATIONS_TERM_ID },
      potentialAction: [{ "@type": "ReadAction", target: SITE_URL + "/blog" }],
    },
    {
      "@type": "ProfilePage",
      "@id": SITE_URL + "/#profile-page",
      url: SITE_URL,
      name: "Christian Lehman — Co-Founder, AuthorityTech",
      isPartOf: { "@id": SITE_URL + "/#website" },
      mainEntity: { "@id": SITE_URL + "/#person" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${doto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="cl-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("cl-theme");var r=document.documentElement;r.classList.remove("light","dark");if(t==="light")r.classList.add("light");else if(t==="dark")r.classList.add("dark")}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <link rel="alternate" type="application/rss+xml" title="Christian Lehman" href={SITE_URL + "/feed.xml"} />
        <meta name="theme-color" content="#F5F5F5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="min-h-screen bg-transparent font-sans text-nothing-primary antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
