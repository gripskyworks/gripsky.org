import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeView } from "../../components/UnsubscribeView";

const title = "管理更新订阅";
const description = "修改 GripSky 更新主题或停止接收版本通知。";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, locale: "zh_CN" },
  twitter: { card: "summary", title, description },
};

export default function ChineseUnsubscribePage() {
  return <Suspense><UnsubscribeView locale="zh" /></Suspense>;
}
