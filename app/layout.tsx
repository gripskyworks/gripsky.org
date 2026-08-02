import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "./components/SiteChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gripsky.org"),
  title: {
    default: "GripSky — Open worldview, skill systems and self-hosting",
    template: "%s · GripSky",
  },
  description:
    "GripSky is an open personal-systems project maintained by Lin Guan: worldview, skill systems, self-hosting, deployment and external information-body stewardship.",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
      "An open personal-systems project: worldview, public skills, self-hosting and managed stewardship.",
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
      "Worldview, public skills, self-hosting and managed stewardship.",
    images: ["/og-system.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080b0d",
  colorScheme: "dark",
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
          url: "https://gripsky.org/icon-512.png",
          width: 512,
          height: 512,
        },
        image: "https://gripsky.org/og-system.png",
        description:
          "An open personal-systems project publishing worldview, skill systems and self-hosted paths for an external information body.",
        founder: {
          "@type": "Person",
          name: "Lin Guan",
          alternateName: "临观",
          url: "https://linguan.online/",
        },
        sameAs: [
          "https://github.com/gripskyworks",
          "https://github.com/weakdreamer/worldview",
          "https://linguan.online/",
        ],
        knowsAbout: [
          "Open worldview",
          "Skill systems",
          "Self-hosting",
          "External information body",
          "AI-assisted workflows",
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
