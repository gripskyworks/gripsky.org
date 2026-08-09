import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "./components/SiteChrome";
import { CONTACT_EMAIL, WECHAT_ID } from "./lib/site-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteOrigin = process.env.NODE_ENV === "development"
  ? "http://localhost:3000"
  : "https://gripsky.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "GripSky — Open worldview, skill systems and self-hosting",
    template: "%s · GripSky",
  },
  description:
    "GripSky publishes Lin Guan’s evolving worldview and the skills growing from it, with open source, self-hosting paths and long-term system stewardship.",
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
    description:
      "An evolving worldview, public skills, self-hosting paths and systems built to remain under their owner’s control.",
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
    description:
      "Worldview into skill. Skill that stays yours.",
    images: ["/og-system.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#eeeae0",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        description:
          "GripSky publishes Lin Guan’s evolving worldview and the skills growing from it, with open source, self-hosting paths and long-term stewardship.",
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
    <html lang="en">
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
