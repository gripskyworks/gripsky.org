import type { Metadata } from "next";
import { HomeView } from "./components/HomeView";

export const metadata: Metadata = {
  title: { absolute: "GripSky — Open worldview, skill systems and self-hosting" },
  description:
    "GripSky is an open personal-systems project maintained by Lin Guan: worldview, skill systems, self-hosting, deployment and external information-body stewardship.",
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
};

export default function Home() {
  return <HomeView locale="en" />;
}
