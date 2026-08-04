import type { Metadata } from "next";
import { HomeView } from "./components/HomeView";

export const metadata: Metadata = {
  title: { absolute: "GripSky — Open worldview, skill systems and self-hosting" },
  description:
    "GripSky publishes Lin Guan’s evolving worldview and the skills growing from it, with open source, self-hosting paths and long-term system stewardship.",
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
    description:
      "An evolving worldview, public skills and self-hosting paths for systems that remain under their owner’s control.",
    images: [
      {
        url: "/og-system.png",
        width: 1731,
        height: 909,
        alt: "GripSky — Worldview into skills",
      },
    ],
  },
};

export default function Home() {
  return <HomeView locale="en" />;
}
