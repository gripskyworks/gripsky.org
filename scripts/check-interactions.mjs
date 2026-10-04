import assert from "node:assert/strict";

// Optional isolated-browser check. Supply PLAYWRIGHT_MODULE when using a bundled
// runtime; Playwright is not a production dependency. All requests are read-only.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = new URL(process.argv[2] || "http://localhost:3014").origin;
const checkSources = process.argv.includes("--sources");
const checks = [];
const errors = [];
const browser = await chromium.launch({ headless: true });

async function check(label, run) {
  try {
    await run();
    checks.push({ label, ok: true });
  } catch (error) {
    checks.push({ label, ok: false, error: error.message });
  }
}

async function eventually(read, expected) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await read() === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(await read(), expected);
}

async function follow(page, locator, path) {
  await locator.click();
  await page.waitForURL(`${origin}${path}`, { timeout: 15_000 });
  await eventually(() => page.locator(".site-shell").getAttribute("data-locale"), path === "/zh" || path.startsWith("/zh/") ? "zh" : "en");
}

try {
  for (const locale of ["en", "zh"]) {
    const prefix = locale === "zh" ? "/zh" : "";
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route("**/*", (route) => {
      if (["GET", "HEAD"].includes(route.request().method())) return route.continue();
      errors.push(`${locale}: prevented mutation ${route.request().method()} ${route.request().url()}`);
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    page.on("pageerror", (error) => errors.push(`${locale}: ${error.message}`));
    await page.goto(`${origin}${prefix || "/"}`, { waitUntil: "networkidle" });

    for (const [index, count] of [[0, 6], [1, 2], [2, 3], [3, 1], [0, 6]]) {
      await check(`${locale}: filter ${index} → ${count}`, async () => {
        const button = page.locator(".atlas-filters button").nth(index);
        await button.click();
        await eventually(() => page.locator(".atlas-skill").count(), count);
        assert.equal(await button.getAttribute("aria-pressed"), "true");
      });
    }
    await check(`${locale}: keyboard filter`, async () => {
      await page.locator(".atlas-filters button").nth(3).focus();
      await page.keyboard.press("Space");
      await eventually(() => page.locator(".atlas-skill").count(), 1);
      await page.locator(".atlas-filters button").first().click();
    });
    await check(`${locale}: skill detail and catalog return`, async () => {
      await follow(page, page.locator(".atlas-skill").first(), `${prefix}/skills/skill-conceptualization`);
      await eventually(() => page.locator("h1").textContent(), locale === "zh" ? "技能概念化" : "Skill conceptualization");
      await follow(page, page.locator(`main .related-links a[href="${prefix}/skills/catalog"]`), `${prefix}/skills/catalog`);
      assert.equal(await page.locator(".catalog-grid > a").count(), 6);
    });

    for (const theme of ["orbit", "retro", "liquid", "tide", "paper"]) {
      await check(`${locale}: theme ${theme}`, async () => {
        await page.locator(".theme-trigger").click();
        await page.locator(`.swatch-${theme}`).click();
        await eventually(() => page.locator(".site-shell").getAttribute("data-theme"), theme);
        assert.equal(await page.locator(".theme-trigger").getAttribute("aria-expanded"), "false");
      });
    }
    await check(`${locale}: theme keyboard and Escape`, async () => {
      await page.locator(".theme-trigger").focus();
      await page.keyboard.press("Enter");
      await eventually(() => page.locator(".theme-trigger").getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      await eventually(() => page.locator(".theme-trigger").getAttribute("aria-expanded"), "false");
    });
    await check(`${locale}: equivalent language route`, async () => {
      const otherPath = locale === "zh" ? "/skills/catalog" : "/zh/skills/catalog";
      await follow(page, page.locator(".language-switch"), otherPath);
      await follow(page, page.locator(".language-switch"), `${prefix}/skills/catalog`);
    });

    for (const section of ["worldview", "skills", "body", "research", "services", "contact"]) {
      const path = `${prefix}/${section}`;
      await check(`${locale}: primary navigation ${section}`, async () => {
        await follow(page, page.locator(`.desktop-nav .nav-group > a[href="${path}"]`), path);
      });
    }
    for (const path of ["/worldview/source", "/skills/catalog", "/body/self-host", "/research/contribute", "/services/deployment", "/contact#service-contact"]) {
      await check(`${locale}: submenu ${path}`, async () => {
        const link = page.locator(`.desktop-nav .nav-panel a[href="${prefix}${path}"]`);
        await link.locator("..").locator("..").hover();
        await follow(page, link, `${prefix}${path}`);
      });
    }
    await check(`${locale}: subscription tabs (no send)`, async () => {
      const tabs = page.locator(".subscription-tabs button");
      await tabs.nth(1).click();
      await eventually(() => tabs.nth(1).getAttribute("aria-selected"), "true");
      await page.keyboard.press("ArrowLeft");
      await eventually(() => tabs.first().getAttribute("aria-selected"), "true");
      await page.keyboard.press("End");
      await eventually(() => tabs.nth(1).getAttribute("aria-selected"), "true");
      await page.keyboard.press("Home");
      await eventually(() => tabs.first().getAttribute("aria-selected"), "true");
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await check(`${locale}: mobile menu and navigation`, async () => {
      await page.locator(".menu-button").click();
      assert.equal(await page.locator(".mobile-menu").getAttribute("inert"), null);
      await follow(page, page.locator(`.mobile-menu a[href="${prefix}/research"]`), `${prefix}/research`);
      await eventually(() => page.locator(".menu-button").getAttribute("aria-expanded"), "false");
      await page.locator(".menu-button").focus();
      await page.keyboard.press("Enter");
      await eventually(() => page.locator(".menu-button").getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      await eventually(() => page.locator(".menu-button").getAttribute("aria-expanded"), "false");
    });
    await check(`${locale}: mobile theme control`, async () => {
      await page.locator(".theme-trigger").click();
      await page.locator(".swatch-orbit").click();
      await eventually(() => page.locator(".site-shell").getAttribute("data-theme"), "orbit");
      await page.reload({ waitUntil: "networkidle" });
      await eventually(() => page.locator(".site-shell").getAttribute("data-theme"), "orbit");
    });

    if (checkSources) {
      for (const [slug, relationship] of [["skill-conceptualization", "SOURCE"], ["body-calibration", "SOURCE"], ["information-inheritance", "BACKGROUND"]]) {
        await check(`${locale}: ${slug} direct source`, async () => {
          await page.goto(`${origin}${prefix}/skills/${slug}`, { waitUntil: "networkidle" });
          const link = page.locator(".skill-documents a");
          assert.equal(await link.count(), 1);
          assert.match(await link.getAttribute("href"), /^https:\/\/github\.com\/weakdreamer\/worldview\/blob\/main\/[^?#]+\.(?:md)$/);
          assert.ok((await page.locator(".skill-documents").textContent()).includes(relationship));
        });
      }
      for (const slug of ["browser-interface", "sync-recovery", "problem-solving"]) {
        await check(`${locale}: ${slug} unpublished file is explicit`, async () => {
          await page.goto(`${origin}${prefix}/skills/${slug}`, { waitUntil: "networkidle" });
          assert.equal(await page.locator(".skill-documents a").count(), 0);
          assert.match(await page.locator(".skill-documents").textContent(), /尚未公开|not public yet/);
        });
      }
    }
    await context.close();
  }

  if (checkSources) {
    await check("storage denied: controls still work", async () => {
      const context = await browser.newContext();
      await context.route("**/*", (route) => {
        if (["GET", "HEAD"].includes(route.request().method())) return route.continue();
        errors.push(`storage denied: prevented mutation ${route.request().method()} ${route.request().url()}`);
        return route.abort();
      });
      await context.addInitScript(() => {
        Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Test: storage denied", "SecurityError"); } });
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`storage denied: ${error.message}`));
      await page.goto(`${origin}/zh`, { waitUntil: "networkidle" });
      await page.locator(".theme-trigger").click();
      await page.locator(".swatch-tide").click();
      await eventually(() => page.locator(".site-shell").getAttribute("data-theme"), "tide");
      await page.locator(".atlas-filters button").nth(3).click();
      await eventually(() => page.locator(".atlas-skill").count(), 1);
      await context.close();
    });
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), viewport: [1440, 375], total: checks.length, passed: checks.filter((entry) => entry.ok).length, failures: checks.filter((entry) => !entry.ok), errors, ...(process.argv.includes("--verbose") ? { checks } : {}) }, null, 2));
if (errors.length || checks.some((entry) => !entry.ok)) process.exitCode = 1;
