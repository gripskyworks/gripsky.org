import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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
  assert.match(html, /<title>GripSky — Open worldview and skill systems(?: · GripSky)?<\/title>/i);
  assert.match(html, /Worldview into skills/);
  assert.match(html, /Three ways to use GripSky/);
  assert.match(html, /href="\/skills\/catalog"/);
  assert.match(html, /href="\/body\/self-host"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("server-renders the Chinese homepage", async () => {
  const response = await render("/zh");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /世界观生成技能/);
  assert.match(html, /data-locale="zh"/);
  assert.match(html, /data-theme="paper"/);
  assert.match(html, /世界观生成技能。<\/span>/);
  assert.match(html, /外置信息身躯。<\/em>/);
  assert.match(html, /亮色/);
  assert.match(html, /暗轨/);
  assert.match(html, /古早网页/);
  assert.match(html, /液态玻璃/);
  assert.match(html, /墨青/);
  assert.match(html, /使用 GripSky 的三种方式/);
  assert.match(html, /href="\/zh\/skills\/catalog"/);
});

test("real deep routes render their own content", async () => {
  const catalog = await render("/skills/catalog");
  assert.equal(catalog.status, 200);
  assert.match(await catalog.text(), /Public definitions and release status/);

  const selfHost = await render("/zh/body/self-host");
  assert.equal(selfHost.status, 200);
  assert.match(await selfHost.text(), /自托管是设计要求/);

  const subscribe = await render("/updates/subscribe");
  assert.equal(subscribe.status, 200);
  assert.match(await subscribe.text(), /Enter an email, choose topics/);
});

test("unknown routes return the site 404", async () => {
  const response = await render("/not-a-real-gripsky-route");
  assert.equal(response.status, 404);
  assert.match(await response.text(), /This page is not in the public system/);
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
  const requestCode = await fetch(`${origin}/api/subscription/request-code`, {
    method: "POST",
    headers: { "content-type": "application/json" },
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
  assert.deepEqual(await verify.json(), { ok: true });
});

test("contact requests are recorded without requiring mail delivery", async () => {
  const response = await fetch(`${origin}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Local verification",
      email: "contact-test@example.com",
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
