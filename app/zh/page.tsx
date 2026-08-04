import type { Metadata } from "next";
import { HomeView } from "../components/HomeView";

export const metadata: Metadata = {
  title: { absolute: "GripSky — 开放世界观、技能体系与自托管" },
  description:
    "GripSky 公开临观仍在修订的世界观和由此生长的技能，保留开放源、自托管路径，并长期维护真正进入现实的体系。",
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
    description:
      "让世界观长成技能，让技能留在自己手里。",
    images: [
      {
        url: "/og-system.png",
        width: 1731,
        height: 909,
        alt: "GripSky — 从世界观到技能体系",
      },
    ],
  },
};

export default function ChineseHome() {
  return <HomeView locale="zh" />;
}
