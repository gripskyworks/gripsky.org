import type { Metadata } from "next";
import { HomeView } from "../components/HomeView";

export const metadata: Metadata = {
  title: { absolute: "GripSky — 开放世界观、技能体系与自托管" },
  description:
    "GripSky 是临观维护的开放个人系统项目：公开世界观与技能体系，提供公共技能自托管路径，并承接部署、定制与外置信息身躯维护。",
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
      "由临观维护的开放个人系统项目：世界观、公共技能、自托管与托管服务。",
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
