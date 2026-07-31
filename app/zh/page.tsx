import type { Metadata } from "next";
import { HomeView } from "../components/HomeView";

export const metadata: Metadata = {
  title: { absolute: "GripSky — 开放世界观与技能体系" },
  description:
    "持续演化的开放世界观、由此生长的技能体系，以及外置信息身躯的自托管路径。",
  alternates: {
    canonical: "/zh",
    languages: {
      en: "/",
      "zh-CN": "/zh",
    },
  },
};

export default function ChineseHome() {
  return <HomeView locale="zh" />;
}
