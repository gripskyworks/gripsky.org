import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentView } from "../components/ContentView";
import { Locale, pages, skills, tx } from "../lib/site-data";

type RouteProps = {
  params: Promise<{ slug: string[] }>;
};

function resolveRoute(slug: string[]) {
  const locale: Locale = slug[0] === "zh" ? "zh" : "en";
  const parts = locale === "zh" ? slug.slice(1) : slug;
  const path = `/${parts.join("/")}`;
  const skill =
    parts[0] === "skills" && parts.length === 2
      ? skills.find((item) => item.slug === parts[1])
      : undefined;

  return { locale, path, content: pages[path], skill };
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale, path, content, skill } = resolveRoute(slug);
  const title = skill ? tx(skill.name, locale) : content ? tx(content.title, locale) : "Not found";
  const description = skill
    ? tx(skill.summary, locale)
    : content
      ? tx(content.intro, locale)
      : locale === "zh"
        ? "这个页面尚未进入公开体系。"
        : "This page is not in the public system.";

  const englishPath = path;
  const chinesePath = `/zh${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: locale === "zh" ? chinesePath : englishPath,
      languages: {
        en: englishPath,
        "zh-CN": chinesePath,
      },
    },
  };
}

export default async function RoutedPage({ params }: RouteProps) {
  const { slug } = await params;
  const route = resolveRoute(slug);
  if (!route.content && !route.skill) notFound();
  return <ContentView {...route} />;
}
