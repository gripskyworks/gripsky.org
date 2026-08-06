import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeView } from "../components/UnsubscribeView";

export const metadata: Metadata = {
  title: "Manage update subscription",
  description: "Change GripSky update topics or unsubscribe from release emails.",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return <Suspense><UnsubscribeView locale="en" /></Suspense>;
}
