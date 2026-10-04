import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentView } from "../components/ContentView";
import { Locale, pages, skills, tx } from "../lib/site-data";
import { publicPageName } from "../lib/public-metadata";

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
  const title = skill
    ? tx(skill.name, locale)
    : content
      ? publicPageName(path, locale, tx(content.title, locale))
      : locale === "zh"
        ? "页面未找到"
        : "Not found";
  const description = skill
    ? tx(skill.summary, locale)
    : content
      ? tx(content.intro, locale)
      : locale === "zh"
        ? "这里还没有公开页面。"
        : "There is no public page here yet.";

  const englishPath = path;
  const chinesePath = `/zh${path}`;

  if (!content && !skill) {
    return {
      title,
      description,
      robots: { index: false, follow: false },
    };
  }

  return {
    title,
    description,
    keywords:
      locale === "zh"
        ? ["GripSky", "临观", "世界观", "技能体系", "自托管", title]
        : ["GripSky", "Lin Guan", "open worldview", "skill systems", "self-hosting", title],
    alternates: {
      canonical: locale === "zh" ? chinesePath : englishPath,
      languages: {
        en: englishPath,
        "zh-CN": chinesePath,
        "x-default": englishPath,
      },
    },
    openGraph: {
      type: "website",
      url: locale === "zh" ? chinesePath : englishPath,
      siteName: "GripSky",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: [locale === "zh" ? "en_US" : "zh_CN"],
      title,
      description,
      images: [
        {
          url: "/og-system.png",
          width: 1731,
          height: 909,
          alt: locale === "zh" ? "GripSky — 从世界观到技能体系" : "GripSky — Worldview into skills",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-system.png"],
    },
  };
}

export default async function RoutedPage({ params }: RouteProps) {
  const { slug } = await params;
  const route = resolveRoute(slug);
  if (!route.content && !route.skill) notFound();
  return <ContentView {...route} />;
}
