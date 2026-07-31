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
    default: "GripSky — Open worldview and skill systems",
    template: "%s · GripSky",
  },
  description:
    "GripSky publishes an evolving worldview, the skill systems derived from it, and self-hosted paths for the external information body.",
  applicationName: "GripSky",
  keywords: [
    "GripSky",
    "open worldview",
    "skill systems",
    "self-hosting",
    "external information body",
    "super-individual",
  ],
  openGraph: {
    type: "website",
    url: "https://gripsky.org",
    siteName: "GripSky",
    title: "GripSky — Worldview into skills",
    description:
      "Open worldview, public skill systems, self-hosting and managed stewardship.",
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
    title: "GripSky — Worldview into skills",
    description:
      "Open worldview, public skill systems, self-hosting and managed stewardship.",
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
