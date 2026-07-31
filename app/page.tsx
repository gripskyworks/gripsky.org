import type { Metadata } from "next";
import { HomeView } from "./components/HomeView";

export const metadata: Metadata = {
  title: { absolute: "GripSky — Open worldview and skill systems" },
  description:
    "An evolving open worldview, the skill systems derived from it, and self-hosted paths for the external information body.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "zh-CN": "/zh",
    },
  },
};

export default function Home() {
  return <HomeView locale="en" />;
}
