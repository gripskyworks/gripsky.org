import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

const port = 4_300 + (process.pid % 200);
const origin = `http://localhost:${port}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn("npm", ["run", "dev", "--", "-p", String(port)], {
    cwd: new URL("..", import.meta.url),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The development server has not opened its port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Development server did not start.\n${serverOutput}`);
});

after(() => {
  server?.kill("SIGTERM");
});

async function render(pathname) {
  return fetch(`${origin}${pathname}`, {
    headers: { accept: "text/html" },
  });
}

test("server-renders the English system homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>GripSky — Open worldview, skill systems and self-hosting(?: · GripSky)?<\/title>/i);
  assert.match(html, /rel="icon" href="http:\/\/localhost:3014\/gripsky-favicon-light-20260806\.ico"/i);
  assert.match(html, /https:\/\/gripsky\.org\/gripsky-brand-mark-v1\.png/);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /https:\/\/gripsky\.org\/#organization/i);
  assert.match(html, /https:\/\/gripsky\.org\/#founder/i);
  assert.match(html, /https:\/\/orcid\.org\/0009-0009-9675-5355/i);
  assert.match(html, /contact@gripsky\.org/i);
  assert.match(html, /ContactPoint/i);
  assert.match(html, /WeChat ID/i);
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.equal(heading, "Worldview becomes skill.");
  assert.match(html, /Understanding/);
  assert.match(html, /From understanding the world to extending your reach\./);
  assert.match(html, /href="\/skills\/catalog"/);
  assert.match(html, /href="\/body\/self-host"/);
  assert.match(html, /href="\/contact"/);
  assert.doesNotMatch(html, /href="\/updates"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("server-renders the Chinese homepage", async () => {
  const response = await render("/zh");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="zh-CN"/);
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, "");
  assert.equal(heading, "世界观落成技能。");
  assert.match(html, /data-locale="zh"/);
  assert.match(html, /class="site-shell"[^>]*lang="zh-CN"/);
  assert.match(html, /data-theme="paper"/);
  assert.match(html, /仍然归你掌握。<\/em>/);
  assert.match(html, /从理解世界，到扩展自己的可达范围。/);
  assert.match(html, /亮色/);
  assert.match(html, /暗轨/);
  assert.match(html, /古早网页/);
  assert.match(html, /液态玻璃/);
  assert.match(html, /墨青/);
  assert.match(html, /问题还没有答案/);
  assert.match(html, /href="\/zh\/skills\/catalog"/);
  assert.match(html, /href="\/zh\/contact"/);
  assert.match(html, /<title>GripSky — 开放世界观、技能体系与自托管<\/title>/i);
});

test("the homepage exposes the entire skill index and truthful availability without client JavaScript", async () => {
  for (const prefix of ["", "/zh"]) {
    const html = await (await render(prefix || "/")).text();
    assert.equal((html.match(/class="atlas-skill"/g) ?? []).length, 6);
    for (const code of ["S-001", "M-001", "E-001", "E-002", "E-003", "F-001"]) assert.ok(html.includes(code));
    assert.match(html, /aria-pressed="true" aria-controls="home-skill-results"/);
    assert.match(html, /id="home-skill-results"/);
  }
});

test("the geometric scene exposes five real bilingual entry points before hydration", async () => {
  for (const [prefix, label] of [["", "Public system entry points"], ["/zh", "公开体系入口"]]) {
    const html = await (await render(prefix || "/")).text();
    assert.match(html, /class="precision-scene"/);
    assert.match(html, new RegExp(`aria-label="${label}"`));
    for (const path of ["/worldview/source", "/worldview", "/about", "/skills", "/body"]) {
      assert.ok(html.includes(`href="${prefix}${path}"`));
    }
    assert.match(html, /class="scene-signal"/);
    assert.doesNotMatch(html, /class="system-constellation"|class="theme-backdrop"/);
    assert.match(html, /id="main-content"/);
    assert.match(html, /href="#main-content"/);
  }
});

test("bilingual deep routes publish canonical and reciprocal language links", async () => {
  for (const [pathname, canonical] of [
    ["/skills/catalog", "http://localhost:3014/skills/catalog"],
    ["/zh/skills/catalog", "http://localhost:3014/zh/skills/catalog"],
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${pathname.startsWith("/zh/") ? "zh-CN" : "en"}"`));
    assert.match(html, new RegExp(`rel="canonical" href="${canonical}"`));
    assert.match(html, /hrefLang="en" href="http:\/\/localhost:3014\/skills\/catalog"/);
    assert.match(html, /hrefLang="zh-CN" href="http:\/\/localhost:3014\/zh\/skills\/catalog"/);
  }
});

test("document language is URL-derived and cannot be changed by an incoming language header", async () => {
  for (const [path, language, incoming] of [["/", "en", "zh-CN"], ["/zh/research", "zh-CN", "en"]]) {
    const response = await fetch(`${origin}${path}`, { headers: { "x-gripsky-language": incoming, "x-gripsky-pathname": "/forged-unknown-path" } });
    const html = await response.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${language}"`));
    assert.doesNotMatch(html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "", /Page not found|页面未找到/);
  }
});

test("public page metadata names the subject while preserving visible editorial headings", async () => {
  for (const [path, title] of [["/research", "Research and open questions"], ["/zh/research", "研究与开放问题"], ["/skills/catalog", "Skill catalog and availability"], ["/zh/contact", "更新与联系"]]) {
    const html = await (await render(path)).text();
    assert.ok(html.includes(`<title>${title} · GripSky</title>`));
    const data = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g), (match) => JSON.parse(match[1]));
    const webpage = data.find((node) => node["@type"] === "WebPage" || node["@type"] === "ContactPage");
    assert.ok(webpage, path);
    assert.equal(webpage.name, title);
    assert.equal(webpage.url, `https://gripsky.org${path}`);
    assert.equal(webpage.inLanguage, path.startsWith("/zh/") ? "zh-CN" : "en");
    assert.equal(webpage.author["@id"], "https://gripsky.org/#founder");
    assert.equal(webpage.publisher["@id"], "https://gripsky.org/#organization");
    assert.equal(webpage.dateModified, undefined, "Do not invent a modification date.");
  }
  const html = await (await render("/zh/skills/skill-conceptualization")).text();
  const data = Array.from(html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g), (match) => JSON.parse(match[1]));
  const webpage = data.find((node) => node["@type"] === "WebPage");
  assert.match(webpage.citation[0], /\/blob\/main\//);
  assert.match(webpage.citation[0], /README\.md$/);
});

test("skills link to specific public files and distinguish unpublished skills from background material", async () => {
  for (const prefix of ["", "/zh"]) {
    for (const [slug, pathFragment] of [
      ["skill-conceptualization", encodeURIComponent("技能概念化")],
      ["body-calibration", encodeURIComponent("定体术")],
    ]) {
      const html = await (await render(`${prefix}/skills/${slug}`)).text();
      assert.match(html, /SOURCE \/ GITHUB/);
      assert.ok(html.includes(`${pathFragment}/README.md`));
      assert.match(html, /github\.com\/weakdreamer\/worldview\/blob\/main\//);
    }
    const background = await (await render(`${prefix}/skills/information-inheritance`)).text();
    assert.match(background, /BACKGROUND \/ GITHUB/);
    assert.match(background, /v0\.1\.0/);
    for (const slug of ["browser-interface", "sync-recovery", "problem-solving"]) {
      const html = await (await render(`${prefix}/skills/${slug}`)).text();
      assert.match(html, /PUBLIC FILE \/ PENDING/);
      assert.doesNotMatch(html, /github\.com\/weakdreamer\/worldview\/blob\//);
    }
  }
});

test("search and install icons keep their declared pixel sizes", () => {
  const pngSize = (pathname) => {
    const file = readFileSync(new URL(pathname, import.meta.url));
    return [file.readUInt32BE(16), file.readUInt32BE(20)];
  };

  assert.deepEqual(pngSize("../public/icon-48.png"), [48, 48]);
  assert.deepEqual(pngSize("../public/icon-96.png"), [96, 96]);
  assert.deepEqual(pngSize("../public/icon-192.png"), [192, 192]);
  assert.deepEqual(pngSize("../public/gripsky-brand-mark-v1.png"), [512, 512]);

  const favicon = readFileSync(new URL("../public/favicon.ico", import.meta.url));
  const iconCount = favicon.readUInt16LE(4);
  const icoSizes = Array.from({ length: iconCount }, (_, index) => {
    const offset = 6 + index * 16;
    const width = favicon.readUInt8(offset) || 256;
    const height = favicon.readUInt8(offset + 1) || 256;
    return [width, height];
  });
  assert.ok(icoSizes.some(([width, height]) => width === 48 && height === 48));
});

test("exposes crawl and install metadata", async () => {
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/gripsky\.org\/sitemap\.xml/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /https:\/\/gripsky\.org\/zh\/skills\/catalog/);
  assert.match(sitemapXml, /hreflang="zh-CN"/);
  assert.match(sitemapXml, /<loc>https:\/\/gripsky\.org\/contact<\/loc>/);
  assert.doesNotMatch(sitemapXml, /<loc>https:\/\/gripsky\.org\/updates<\/loc>/);
  assert.equal((sitemapXml.match(/<loc>/g) ?? []).length, 88);
  assert.doesNotMatch(sitemapXml, /<lastmod>/, "No fixed or build-time modification date.");

  const manifest = await render("/manifest.webmanifest");
  assert.equal(manifest.status, 200);
  assert.match(await manifest.text(), /"short_name"\s*:\s*"GripSky"/);

  const favicon = await render("/favicon.ico");
  assert.equal(favicon.status, 200);
  assert.match(favicon.headers.get("content-type") ?? "", /^image\//i);

  const llms = await render("/llms.txt");
  assert.equal(llms.status, 200);
  const llmsText = await llms.text();
  assert.match(llmsText, /GripSky GitHub organization/);
  assert.match(llmsText, /contact@gripsky\.org/);
  assert.match(llmsText, /WeChat ID: gripsky/);

  const feed = await render("/feed.xml");
  assert.equal(feed.status, 200);
  assert.match(feed.headers.get("content-type") ?? "", /^application\/rss\+xml/i);
  assert.match(await feed.text(), /<title>GripSky release feed<\/title>/);
});

test("FAQ publishes visible bilingual answers and matching structured data", async () => {
  const english = await render("/faq");
  assert.equal(english.status, 200);
  const englishHtml = await english.text();
  assert.match(englishHtml, /What is GripSky\?/);
  assert.match(englishHtml, /FAQPage/);

  const chinese = await render("/zh/faq");
  assert.equal(chinese.status, 200);
  const chineseHtml = await chinese.text();
  assert.match(chineseHtml, /GripSky 是什么？/);
  assert.match(chineseHtml, /FAQPage/);

  for (const html of [englishHtml, chineseHtml]) {
    const structured = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]))
      .find((value) => value["@type"] === "FAQPage");
    assert.ok(structured);
    const visible = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
      .replace(/<script\b[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"')
      .replace(/\s+/g, " ");
    for (const answer of structured.mainEntity) {
      assert.ok(visible.includes(answer.name), `FAQ question is not visible: ${answer.name}`);
      assert.ok(visible.includes(answer.acceptedAnswer.text), `FAQ answer is not visible: ${answer.name}`);
    }
    assert.equal(structured.mainEntity.length, 11);
  }

  const about = await render("/about");
  assert.equal(about.status, 200);
  assert.match(await about.text(), /Lin Guan on ORCID/);
});

test("real deep routes render their own content", async () => {
  const catalog = await render("/skills/catalog");
  assert.equal(catalog.status, 200);
  assert.match(await catalog.text(), /What exists, what is open and what comes next/);

  const selfHost = await render("/zh/body/self-host");
  assert.equal(selfHost.status, 200);
  assert.match(await selfHost.text(), /自托管是这里的设计要求/);

  const subscribe = await render("/updates/subscribe");
  assert.equal(subscribe.status, 200);
  const subscribeHtml = await subscribe.text();
  assert.match(subscribeHtml, /Subscribe \/ update topics/);
  assert.match(subscribeHtml, /Unsubscribe/);
  assert.match(subscribeHtml, /subscription-page-layout/);

  const chineseSubscribe = await render("/zh/updates/subscribe");
  assert.equal(chineseSubscribe.status, 200);
  assert.match(await chineseSubscribe.text(), /邮件应用未显示退订入口时/);

  const contact = await render("/zh/contact");
  assert.equal(contact.status, 200);
  const contactHtml = await contact.text();
  assert.match(contactHtml, /更新与联系。/);
  assert.match(contactHtml, /订阅更新/);
  assert.match(contactHtml, /订阅 \/ 更新主题/);
  assert.match(contactHtml, /业务与协作联系/);
  assert.match(contactHtml, /更新记录。/);
  assert.match(contactHtml, /href="mailto:contact@gripsky\.org"/);
  assert.match(contactHtml, /微信 ID/);
  assert.match(contactHtml, /gripsky/);
  assert.match(contactHtml, /"@type":"ContactPage"/);
  assert.match(contactHtml, /https:\/\/gripsky\.org\/zh\/contact#webpage/);
  assert.match(contactHtml, /https:\/\/gripsky\.org\/#organization/);

  const retiredUpdatesLanding = await render("/updates");
  assert.equal(retiredUpdatesLanding.status, 404);
});

test("research keeps the open-work frame while clarifying the current line", async () => {
  const chinese = await render("/zh/research");
  assert.equal(chinese.status, 200);
  const chineseHtml = await chinese.text();
  assert.match(chineseHtml, /问题还没有答案，就先把它公开。/);
  assert.match(chineseHtml, /信息身躯/);
  assert.match(chineseHtml, /公共基础设施/);
  assert.match(chineseHtml, /仍待补足的证据/);
  assert.match(chineseHtml, /认识、改变和扩展自己/);
  assert.doesNotMatch(chineseHtml, /一人公司/);
  assert.doesNotMatch(chineseHtml, /research-thesis/);

  const english = await render("/research");
  assert.equal(english.status, 200);
  const englishHtml = await english.text();
  assert.match(englishHtml, /Open work, while it is still open./);
  assert.match(englishHtml, /Evidence still needed/);
  assert.match(englishHtml, /understand, change and extend themselves/);
  assert.doesNotMatch(englishHtml, /one person company/i);

  const questions = await render("/research/questions");
  assert.equal(questions.status, 200);
  assert.match(await questions.text(), /Questions with enough weight to change the system/);
});

test("content states exploration separately from public source and preserves private boundaries", async () => {
  for (const prefix of ["", "/zh"]) {
    const calibration = await (await render(`${prefix}/skills/body-calibration`)).text();
    const sections = calibration.match(/<section class="content-sections">([\s\S]*?)<\/section>/)?.[1];
    assert.ok(sections);
    assert.equal((sections.match(/<article>/g) ?? []).length, 3);
    assert.match(sections, /systematic body of practice records|体系化实践记录/);
    assert.match(sections, /not a validated training or health protocol|不是经过验证的训练方案或健康指导/);
    assert.doesNotMatch(sections, /shaped into stable releases|整理成稳定版本/);
    assert.match(calibration, /No runnable package|暂无可运行包/);

    const inheritance = await (await render(`${prefix}/skills/information-inheritance`)).text();
    assert.match(inheritance, /Check at the destination|在目标端验收/);
    assert.doesNotMatch(inheritance, /H3|verified internally|已完成内部验证/);
    const conceptualization = await (await render(`${prefix}/skills/skill-conceptualization`)).text();
    assert.match(conceptualization, /Practice writes back|由实践反写/);

    const architecture = await (await render(`${prefix}/body/architecture`)).text();
    assert.match(architecture, /not automatically an organ|不自动等于器官/);
    assert.match(architecture, /One material, several roles|一份材料，多种作用/);
    for (const html of [calibration, inheritance, conceptualization, architecture]) {
      // Dev-mode RSC stack traces contain local source paths; inspect authored
      // metadata and content here, not the framework's loopback debug payload.
      const authored = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
      assert.doesNotMatch(authored, /libfile_|drive\.google\.com|\/Users\/linguan|con-eu/);
    }
  }
});

test("current reading maps and research questions do not claim a finished architecture or new release", async () => {
  for (const prefix of ["", "/zh"]) {
    const worldview = await (await render(`${prefix}/worldview`)).text();
    assert.match(worldview, /Four views, in dialogue|四观，相互校准/);
    const map = await (await render(`${prefix}/worldview/map`)).text();
    assert.match(map, /no longer describe the whole current system|已不能代表当前整个体系/);
    const questions = await (await render(`${prefix}/research/questions`)).text();
    assert.match(questions, /reproducible lexical searches to locate material|词法定位/);
    assert.match(questions, /Continuity across endpoints|跨端点的意义接续/);
    const releases = await (await render(`${prefix}/updates/releases`)).text();
    assert.doesNotMatch(releases, /2026-10-03/);
    assert.equal((releases.match(/<time>/g) ?? []).length, 3);
  }
});

test("unknown routes return the site 404", async () => {
  for (const prefix of ["", "/zh"]) {
    const response = await render(`${prefix}/not-a-real-gripsky-route`);
    assert.equal(response.status, 404);
    const html = await response.text();
    assert.match(html, /There is no public page here yet/);
    assert.match(html, new RegExp(`<title>${prefix ? "页面未找到" : "Page not found"}(?: · GripSky)?</title>`));
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "", /worldview|世界观/i);
  }
});

test("every discoverable internal link resolves", async () => {
  const pending = ["/", "/zh"];
  const visited = new Set();
  const failures = [];

  while (pending.length && visited.size < 200) {
    const pathname = pending.shift();
    if (visited.has(pathname)) continue;
    visited.add(pathname);

    const response = await render(pathname);
    if (!response.ok) {
      failures.push(`${pathname} → ${response.status}`);
      continue;
    }

    const html = await response.text();
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (!href.startsWith("/") || href.startsWith("/api/")) continue;
      const target = new URL(href, origin).pathname;
      if (!visited.has(target)) pending.push(target);
    }
  }

  assert.ok(visited.size > 40, `Expected a substantial route tree, visited ${visited.size} routes.`);
  assert.deepEqual(failures, []);
});

test("local email preview completes the subscription verification flow", async () => {
  const email = `local-test-${Date.now()}@example.com`;
  const requestAddress = `2001:db8::${Date.now().toString(16)}`;
  const requestCode = await fetch(`${origin}/api/subscription/request-code`, {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": requestAddress },
    body: JSON.stringify({
      email,
      locale: "en",
      topics: ["worldview", "skills"],
    }),
  });
  const requestBody = await requestCode.json();
  assert.equal(requestCode.status, 200);
  assert.equal(requestBody.delivery, "preview");
  assert.match(requestBody.previewCode, /^\d{6}$/);

  const verify = await fetch(`${origin}/api/subscription/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: requestBody.previewCode }),
  });
  assert.equal(verify.status, 200);
  const verifyBody = await verify.json();
  assert.equal(verifyBody.ok, true);
  assert.match(verifyBody.previewManageToken, /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/i);

  const preferences = await fetch(
    `${origin}/api/subscription/preferences?token=${encodeURIComponent(verifyBody.previewManageToken)}`,
  );
  assert.equal(preferences.status, 200);
  assert.deepEqual((await preferences.json()).topics, ["worldview", "skills"]);

  const publication = await fetch(`${origin}/api/internal/updates/publish`, {
    method: "POST",
    headers: {
      authorization: "Bearer local-preview-update-token-0000000000000000",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      slug: `local-release-${Date.now()}`,
      topic: "skills",
      titleEn: "Local release verification",
      titleZh: "本地版本验证",
      summaryEn: "Checks the queued update delivery path without sending external mail.",
      summaryZh: "检查更新任务队列，但不向外发送邮件。",
      url: "https://gripsky.org/updates/releases",
      publishedAt: Date.now(),
    }),
  });
  assert.equal(publication.status, 200);
  assert.ok((await publication.json()).eligibleSubscribers >= 1);

  const processUpdates = await fetch(`${origin}/api/internal/updates/process`, {
    method: "POST",
    headers: { authorization: "Bearer local-preview-update-token-0000000000000000" },
  });
  assert.equal(processUpdates.status, 200);
  assert.ok((await processUpdates.json()).sent >= 1);

  const oneClick = await fetch(
    `${origin}/api/subscription/unsubscribe?token=${encodeURIComponent(verifyBody.previewManageToken)}&topic=skills`,
    { method: "POST", body: "List-Unsubscribe=One-Click" },
  );
  assert.equal(oneClick.status, 200);

  const afterOneClick = await fetch(
    `${origin}/api/subscription/preferences?token=${encodeURIComponent(verifyBody.previewManageToken)}`,
  );
  assert.deepEqual((await afterOneClick.json()).topics, ["worldview"]);

  const unsubscribeAll = await fetch(`${origin}/api/subscription/preferences`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: verifyBody.previewManageToken, topics: [] }),
  });
  assert.equal(unsubscribeAll.status, 200);
  assert.equal((await unsubscribeAll.json()).status, "unsubscribed");
});

test("subscription preferences are noindex and reject missing tokens", async () => {
  for (const path of ["/unsubscribe", "/zh/unsubscribe"]) {
    const page = await render(path);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /name="robots" content="noindex, nofollow"/i);
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(description);
    assert.equal(html.match(/<meta property="og:description" content="([^"]+)"/)?.[1], description);
    assert.equal(html.match(/<meta name="twitter:description" content="([^"]+)"/)?.[1], description);
    assert.doesNotMatch(description, /worldview|世界观/i);
  }

  const unauthorized = await fetch(`${origin}/api/internal/updates/process`, { method: "POST" });
  assert.equal(unauthorized.status, 404);
});

test("verified subscribers can self-unsubscribe with an email code", async () => {
  const email = `self-unsubscribe-${Date.now()}@example.com`;
  const verificationHeaders = {
    "content-type": "application/json",
    "cf-connecting-ip": `2001:db8:1::${Date.now().toString(16)}`,
  };
  const subscribeRequest = await fetch(`${origin}/api/subscription/request-code`, {
    method: "POST",
    headers: verificationHeaders,
    body: JSON.stringify({
      email,
      locale: "zh",
      intent: "subscribe",
      topics: ["worldview", "research"],
    }),
  });
  assert.equal(subscribeRequest.status, 200);
  const subscribeRequestBody = await subscribeRequest.json();

  const subscribeVerify = await fetch(`${origin}/api/subscription/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: subscribeRequestBody.previewCode }),
  });
  assert.equal(subscribeVerify.status, 200);
  const subscribeVerifyBody = await subscribeVerify.json();

  const unsubscribeRequest = await fetch(`${origin}/api/subscription/request-code`, {
    method: "POST",
    headers: verificationHeaders,
    body: JSON.stringify({ email, locale: "zh", intent: "unsubscribe" }),
  });
  assert.equal(unsubscribeRequest.status, 200);
  const unsubscribeRequestBody = await unsubscribeRequest.json();
  assert.match(unsubscribeRequestBody.previewCode, /^\d{6}$/);

  const unsubscribeVerify = await fetch(`${origin}/api/subscription/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: unsubscribeRequestBody.previewCode }),
  });
  assert.equal(unsubscribeVerify.status, 200);
  assert.deepEqual(await unsubscribeVerify.json(), {
    ok: true,
    action: "unsubscribed",
    wasSubscribed: true,
  });

  const preferences = await fetch(
    `${origin}/api/subscription/preferences?token=${encodeURIComponent(subscribeVerifyBody.previewManageToken)}`,
  );
  assert.equal(preferences.status, 200);
  const preferencesBody = await preferences.json();
  assert.equal(preferencesBody.status, "unsubscribed");
  assert.deepEqual(preferencesBody.topics, []);
});

test("email endpoints apply a normal-use sending budget", async () => {
  const email = `rate-test-${Date.now()}@example.com`;
  const payload = {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7" },
    body: JSON.stringify({ email, locale: "en", topics: ["worldview"] }),
  };
  const first = await fetch(`${origin}/api/subscription/request-code`, payload);
  assert.equal(first.status, 200);
  const second = await fetch(`${origin}/api/subscription/request-code`, payload);
  assert.equal(second.status, 429);
  assert.ok(Number(second.headers.get("retry-after")) >= 60);
});

test("contact requests are recorded without requiring mail delivery", async () => {
  const email = `contact-test-${Date.now()}@example.com`;
  const testIp = `198.51.100.${(Date.now() % 200) + 1}`;
  const response = await fetch(`${origin}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": testIp },
    body: JSON.stringify({
      name: "Local verification",
      email,
      kind: "system-design",
      brief: "This is a local request used to verify the complete form flow.",
      locale: "en",
    }),
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    ok: true,
    recorded: true,
    forwarded: false,
  });
});
