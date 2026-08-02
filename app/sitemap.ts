import type { MetadataRoute } from "next";
import { pages, skills } from "./lib/site-data";

const origin = "https://gripsky.org";
const lastModified = new Date("2026-08-02T00:00:00+08:00");

const publicPaths = [
  "/",
  ...Object.keys(pages),
  ...skills.map((skill) => `/skills/${skill.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.flatMap((path) => {
    const englishUrl = `${origin}${path === "/" ? "" : path}`;
    const chinesePath = path === "/" ? "/zh" : `/zh${path}`;
    const chineseUrl = `${origin}${chinesePath}`;
    const priority = path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.65;
    const alternates = {
      languages: {
        en: englishUrl,
        "zh-CN": chineseUrl,
        "x-default": englishUrl,
      },
    };

    return [
      {
        url: englishUrl,
        lastModified,
        changeFrequency: path.startsWith("/updates") ? "weekly" : "monthly",
        priority,
        alternates,
      },
      {
        url: chineseUrl,
        lastModified,
        changeFrequency: path.startsWith("/updates") ? "weekly" : "monthly",
        priority,
        alternates,
      },
    ] as MetadataRoute.Sitemap;
  });
}
