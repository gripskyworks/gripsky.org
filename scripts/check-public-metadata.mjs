import assert from "node:assert/strict";

const origin = new URL(process.argv[2] || "http://localhost:3014").origin;
const canonicalOrigin = process.argv.includes("--production-metadata") ? "https://gripsky.org" : origin;
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
assert.doesNotMatch(sitemap, /<lastmod>/, "Do not publish fixed or build-time modification dates.");
const paths = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g), (match) => {
  const url = new URL(match[1]);
  assert.equal(url.origin, "https://gripsky.org");
  return url.pathname;
});
assert.equal(paths.length, 88);
assert.equal(new Set(paths).size, paths.length);

const failures = [];
for (let index = 0; index < paths.length; index += 4) {
  await Promise.all(paths.slice(index, index + 4).map(async (path) => {
    try {
      const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(20_000) });
      assert.equal(response.status, 200);
      const html = await response.text();
      const chinese = path === "/zh" || path.startsWith("/zh/");
      const englishPath = chinese ? path.slice(3) || "/" : path;
      const chinesePath = englishPath === "/" ? "/zh" : `/zh${englishPath}`;
      assert.match(html, new RegExp(`<html[^>]*lang="${chinese ? "zh-CN" : "en"}"`));
      const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1];
      assert.ok(head, "Metadata must be in the HTML head.");
      assert.match(head, /<title>[^<]+<\/title>/);
      assert.match(head, /<meta name="description" content="[^"]+"/);
      const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
      const description = decode(head.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "");
      const openGraph = decode(head.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? "");
      const twitter = decode(head.match(/<meta name="twitter:description" content="([^"]+)"/)?.[1] ?? "");
      assert.equal(openGraph, description, "OpenGraph and search summaries must agree.");
      assert.equal(twitter, description, "Twitter and search summaries must agree.");
      assert.ok(head.includes(`rel="canonical" href="${canonicalOrigin}${path}"`));
      assert.ok(head.includes(`hrefLang="en" href="${canonicalOrigin}${englishPath}"`));
      assert.ok(head.includes(`hrefLang="zh-CN" href="${canonicalOrigin}${chinesePath}"`));
      assert.ok(head.includes(`hrefLang="x-default" href="${canonicalOrigin}${englishPath}"`));
      assert.doesNotMatch(head, /<meta name="robots" content="[^"]*noindex/);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      const data = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g), (match) => JSON.parse(match[1]));
      const page = data.filter((entry) => entry["@type"] === "WebPage" || entry["@type"] === "ContactPage");
      assert.equal(page.length, 1);
      assert.equal(page[0].url, `https://gripsky.org${path}`);
      assert.equal(page[0].inLanguage, chinese ? "zh-CN" : "en");
      assert.equal(page[0].author["@id"], "https://gripsky.org/#founder");
      assert.equal(page[0].publisher["@id"], "https://gripsky.org/#organization");
      assert.equal(page[0].description, description, "The page's JSON-LD must describe the same reviewed content.");
      assert.equal(page[0].dateModified, undefined);
      for (const citation of page[0].citation ?? []) assert.ok(html.includes(`href="${citation}"`), "A citation must also be a visible source link.");
    } catch (error) {
      failures.push({ path, error: error.message });
    }
  }));
}
console.log(JSON.stringify({ origin, canonicalOrigin, checkedAt: new Date().toISOString(), total: paths.length, passed: paths.length - failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
