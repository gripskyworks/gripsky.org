import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";

// Separate loopback listener and disposable synthetic DB; never use production state.
const temporaryDirectory = await mkdtemp(join(tmpdir(), "gripsky-design-smoke-"));
const port = 4700 + process.pid % 200;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["server-selfhost.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port),
    LOCAL_EMAIL_PREVIEW: "true", GRIPSKY_DB_PATH: join(temporaryDirectory, "smoke.sqlite") },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", (chunk) => { output += chunk; });
server.stderr.on("data", (chunk) => { output += chunk; });

try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { ready = (await fetch(`${origin}/api/health`)).ok; } catch { /* Opening socket. */ }
    if (ready) break;
    if (server.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Local build did not start.\n${output}`);
  for (const path of ["/", "/zh", "/zh/worldview", "/zh/skills/catalog", "/zh/skills/skill-conceptualization", "/zh/skills/body-calibration", "/skills/information-inheritance", "/body/architecture", "/zh/research", "/zh/faq", "/zh/contact", "/zh/updates/subscribe"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<h1\b/);
    assert.match(html, new RegExp(`<html[^>]*lang="${path === "/zh" || path.startsWith("/zh/") ? "zh-CN" : "en"}"`));
    assert.match(html, /rel="canonical" href="https:\/\/gripsky\.org\//);
    assert.match(html, /hrefLang="zh-CN" href="https:\/\/gripsky\.org\/zh/);
    assert.match(html, /"@type":"(?:WebPage|ContactPage)"/);
    assert.doesNotMatch(html, /libfile_|drive\.google\.com|\/Users\/linguan|con-eu/, `${path}: private source or debug path in built output`);
    if (path === "/zh") {
      assert.match(html, /precision-scene/);
      const assets = new Set(Array.from(html.matchAll(/(?:src|href)="(\/assets\/[^"?]+(?:\.js|\.css))"/g), (match) => match[1]));
      assert.ok(assets.size > 0, "The built page should load compiled assets.");
      for (const asset of assets) assert.equal((await fetch(`${origin}${asset}`)).status, 200, asset);
      console.log(`Built assets: ${assets.size} OK`);
    }
    console.log(`${path}: 200`);
  }
  for (const [path, status] of [["/unsubscribe", 200], ["/zh/unsubscribe", 200], ["/smoke-not-found", 404], ["/zh/smoke-not-found", 404]]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, status, path);
    const html = await response.text();
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1];
    assert.ok(head, path);
    assert.match(head, /name="robots" content="noindex, nofollow"/, path);
    const description = head.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(description, path);
    assert.equal(head.match(/<meta property="og:description" content="([^"]+)"/)?.[1], description, path);
    assert.equal(head.match(/<meta name="twitter:description" content="([^"]+)"/)?.[1], description, path);
    assert.doesNotMatch(description, /worldview|世界观/i, path);
    if (status === 404) assert.match(head, /<title>(?:Page not found|页面未找到)(?: · GripSky)?<\/title>/, path);
    console.log(`${path}: ${status}, own summary and noindex OK`);
  }
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 88);
  assert.doesNotMatch(sitemap, /<lastmod>/);
  const metadataCheck = spawn(process.execPath, ["scripts/check-public-metadata.mjs", origin, "--production-metadata"], {
    cwd: new URL("..", import.meta.url), stdio: ["ignore", "pipe", "pipe"],
  });
  let metadataOutput = "";
  metadataCheck.stdout.on("data", (chunk) => { metadataOutput += chunk; });
  metadataCheck.stderr.on("data", (chunk) => { metadataOutput += chunk; });
  const [metadataCode] = await once(metadataCheck, "exit");
  assert.equal(metadataCode, 0, `Built metadata check failed.\n${metadataOutput}`);
  console.log(metadataOutput.trim());
  if (process.env.PLAYWRIGHT_MODULE) {
    for (const args of [
      ["scripts/check-interactions.mjs", origin, "--sources"],
      ["scripts/check-touch.mjs", origin, `--browsers=${process.env.GRIPSKY_TOUCH_BROWSERS || "chromium"}`],
      ["scripts/check-form-feedback.mjs", origin],
    ]) {
      const browserCheck = spawn(process.execPath, args, {
        cwd: new URL("..", import.meta.url), env: process.env, stdio: ["ignore", "pipe", "pipe"],
      });
      let browserOutput = "";
      browserCheck.stdout.on("data", (chunk) => { browserOutput += chunk; });
      browserCheck.stderr.on("data", (chunk) => { browserOutput += chunk; });
      const [code] = await once(browserCheck, "exit");
      assert.equal(code, 0, `Built browser interaction check failed.\n${browserOutput}`);
      console.log(browserOutput.trim());
    }
  }
  const response = await fetch(`${origin}/api/subscription/request-code`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "local-design-smoke@example.com", locale: "zh", topics: ["skills"] }),
  });
  const mail = await response.json();
  assert.equal(response.status, 200);
  assert.equal(mail.delivery, "preview");
  assert.match(mail.previewCode, /^\d{6}$/);
  console.log("Built subscription endpoint: local preview only, OK");
} finally {
  if (server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill("SIGTERM");
    await exited;
  }
  // This exact directory was created above by mkdtemp and contains only this test's DB.
  await rm(temporaryDirectory, { recursive: true, force: true });
}
