import type { Metadata } from "next";
import { HomeView } from "./components/HomeView";
import { homeDescription } from "./lib/public-metadata";

export const metadata: Metadata = {
  title: { absolute: "GripSky — Open worldview, skill systems and self-hosting" },
  description: homeDescription.en,
  keywords: [
    "GripSky",
    "Lin Guan",
    "open worldview",
    "skill systems",
    "self-hosted personal AI system",
    "external information body",
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "zh-CN": "/zh",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "GripSky",
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

export default function Home() {
  return <HomeView locale="en" />;
}
