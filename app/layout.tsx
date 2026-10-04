import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SiteChrome } from "./components/SiteChrome";
import { CONTACT_EMAIL, WECHAT_ID, pages, skills } from "./lib/site-data";
import { homeDescription } from "./lib/public-metadata";
import "./globals.css";
import "./interior.css";
import "./atlas.css";
import "./interior-atlas.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteOrigin = process.env.NODE_ENV === "development"
  ? "http://localhost:3014"
  : "https://gripsky.org";

const baseMetadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "GripSky — Open worldview, skill systems and self-hosting",
    template: "%s · GripSky",
  },
  description: homeDescription.en,
  applicationName: "GripSky",
  authors: [{ name: "Lin Guan", url: "https://linguan.online" }],
  creator: "Lin Guan",
  publisher: "GripSky",
  category: "Personal systems and open technology",
  keywords: [
    "GripSky",
    "Lin Guan",
    "open worldview",
    "skill systems",
    "self-hosting",
    "external information body",
    "super-individual",
    "personal AI system",
    "AI workflow",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/gripsky-favicon-light-20260806.ico", sizes: "any" },
      { url: "/gripsky-favicon-light-20260806-48.png", sizes: "48x48", type: "image/png" },
      { url: "/gripsky-favicon-light-20260806-96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/gripsky-favicon-light-20260806.ico",
    apple: [{ url: "/gripsky-favicon-light-20260806-180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://gripsky.org",
    siteName: "GripSky",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    title: "GripSky — Open worldview, skill systems and self-hosting",
    description: homeDescription.en,
    images: [
      {
        url: "/og-system.png",
        width: 1731,
        height: 909,
        alt: "GripSky — Worldview into skills",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GripSky — Open worldview and skill systems",
    description: homeDescription.en,
    images: ["/og-system.png"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-gripsky-pathname");
  const path = pathname === "/zh" ? "/" : pathname?.startsWith("/zh/") ? pathname.slice(3) : pathname;
  const knownPage = !path || path === "/" || path === "/unsubscribe" || Object.hasOwn(pages, path)
    || skills.some((skill) => path === `/skills/${skill.slug}`);
  if (knownPage) return baseMetadata;

  // Vinext's not-found boundary keeps layout metadata but drops the page's
  // metadata. Use the URL-derived header so a real 404 cannot inherit the home
  // summary. The proxy overwrites incoming values; this does not change status.
  const chinese = requestHeaders.get("x-gripsky-language") === "zh-CN";
  const title = chinese ? "页面未找到" : "Page not found";
  const description = chinese ? "这里还没有公开页面。" : "There is no public page here yet.";
  return {
    ...baseMetadata,
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { ...baseMetadata.openGraph, title, description, locale: chinese ? "zh_CN" : "en_US" },
    twitter: { ...baseMetadata.twitter, title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#eeeae0",
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = (await headers()).get("x-gripsky-language") === "zh-CN" ? "zh-CN" : "en";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://gripsky.org/#organization",
        name: "GripSky",
        url: "https://gripsky.org/",
        logo: {
          "@type": "ImageObject",
          url: "https://gripsky.org/gripsky-brand-mark-v1.png",
          width: 512,
          height: 512,
        },
        image: "https://gripsky.org/og-system.png",
        description: homeDescription[language === "zh-CN" ? "zh" : "en"],
        founder: { "@id": "https://gripsky.org/#founder" },
        email: CONTACT_EMAIL,
        contactPoint: {
          "@type": "ContactPoint",
          "@id": "https://gripsky.org/contact#service-contact",
          email: CONTACT_EMAIL,
          url: "https://gripsky.org/contact",
          contactType: "service and collaboration inquiries",
          availableLanguage: ["en", "zh-CN"],
          areaServed: "Worldwide",
          identifier: {
            "@type": "PropertyValue",
            propertyID: "WeChat ID",
            value: WECHAT_ID,
          },
        },
        sameAs: ["https://github.com/gripskyworks"],
        publishingPrinciples: "https://github.com/weakdreamer/worldview",
        knowsAbout: [
          "Open worldview",
          "Skill systems",
          "Self-hosting",
          "External information body",
          "AI-assisted workflows",
        ],
      },
      {
        "@type": "Person",
        "@id": "https://gripsky.org/#founder",
        name: "Lin Guan",
        alternateName: "临观",
        url: "https://linguan.online/",
        sameAs: [
          "https://orcid.org/0009-0009-9675-5355",
          "https://github.com/weakdreamer",
          "https://linguan.online/",
        ],
        identifier: {
          "@type": "PropertyValue",
          propertyID: "ORCID",
          value: "0009-0009-9675-5355",
          url: "https://orcid.org/0009-0009-9675-5355",
        },
        affiliation: { "@id": "https://gripsky.org/#organization" },
        knowsAbout: [
          "AI agents",
          "Human-AI collaboration",
          "Knowledge infrastructure",
          "Digital identity",
          "Open knowledge systems",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://gripsky.org/#website",
        url: "https://gripsky.org/",
        name: "GripSky",
        inLanguage: ["en", "zh-CN"],
        publisher: { "@id": "https://gripsky.org/#organization" },
      },
    ],
  };

  return (
    <html lang={language}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="GripSky release feed"
          href="/feed.xml"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
