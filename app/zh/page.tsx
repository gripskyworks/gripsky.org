import type { Metadata } from "next";
import { HomeView } from "../components/HomeView";
import { homeDescription } from "../lib/public-metadata";

export const metadata: Metadata = {
  title: { absolute: "GripSky — 开放世界观、技能体系与自托管" },
  description: homeDescription.zh,
  keywords: [
    "GripSky",
    "临观",
    "开放世界观",
    "技能体系",
    "自托管",
    "外置信息身躯",
    "超级个体",
    "AI 工作流",
    "个人系统",
  ],
  alternates: {
    canonical: "/zh",
    languages: {
      en: "/",
      "zh-CN": "/zh",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/zh",
    siteName: "GripSky",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    title: "GripSky — 开放世界观、技能体系与自托管",
    description: homeDescription.zh,
    images: [
      {
        url: "/og-system.png",
        width: 1731,
        height: 909,
        alt: "GripSky — 从世界观到技能体系",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GripSky — 开放世界观、技能体系与自托管",
    description: homeDescription.zh,
    images: ["/og-system.png"],
  },
};

export default function ChineseHome() {
  return <HomeView locale="zh" />;
}
