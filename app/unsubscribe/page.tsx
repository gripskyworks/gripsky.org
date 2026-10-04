import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeView } from "../components/UnsubscribeView";

const title = "Manage update subscription";
const description = "Change GripSky update topics or unsubscribe from release emails.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, locale: "en_US" },
  twitter: { card: "summary", title, description },
};

export default function UnsubscribePage() {
  return <Suspense><UnsubscribeView locale="en" /></Suspense>;
}
