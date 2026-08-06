import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeView } from "../../components/UnsubscribeView";

export const metadata: Metadata = {
  title: "管理更新订阅",
  description: "修改 GripSky 更新主题或停止接收版本通知。",
  robots: { index: false, follow: false },
};

export default function ChineseUnsubscribePage() {
  return <Suspense><UnsubscribeView locale="zh" /></Suspense>;
}
