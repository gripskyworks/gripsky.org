import { releases } from "../lib/site-data";

const origin = "https://gripsky.org";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const latestDate = releases.reduce(
    (latest, release) => release.date > latest ? release.date : latest,
    releases[0]?.date ?? "2026-08-06",
  );
  const items = [...releases]
    .sort((left, right) => right.date.localeCompare(left.date))
    .map((release) => `
    <item>
      <title>${escapeXml(release.title.en)}</title>
      <description>${escapeXml(`${release.title.en} / ${release.title.zh}`)}</description>
      <link>${origin}/updates/releases</link>
      <guid isPermaLink="false">urn:gripsky:release:${escapeXml(release.version)}</guid>
      <category>${escapeXml(release.type.en)}</category>
      <pubDate>${new Date(`${release.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GripSky release feed</title>
    <description>Worldview, skill and interface releases published by GripSky.</description>
    <link>${origin}/updates/releases</link>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date(`${latestDate}T00:00:00Z`).toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
