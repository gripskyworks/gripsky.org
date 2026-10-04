import assert from "node:assert/strict";

// Touch-event emulation, not a claim of testing a physical phone or Safari app.
const playwright = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = new URL(process.argv[2] || "http://localhost:3014").origin;
const engines = (process.argv.find((arg) => arg.startsWith("--browsers="))?.split("=")[1] || "chromium").split(",");
assert.ok(engines.length && engines.every((name) => ["chromium", "webkit"].includes(name)), "Use chromium and/or webkit.");
const viewports = [{ width: 375, height: 812 }, { width: 1024, height: 768 }];
const checks = [];
const errors = [];
const capabilities = [];

async function check(label, run) {
  try { await run(); checks.push({ label, ok: true }); }
  catch (error) { checks.push({ label, ok: false, error: error.message }); }
  if (process.argv.includes("--progress")) console.log(`${checks.at(-1).ok ? "PASS" : "FAIL"} ${label}`);
}

async function settled(page, selector, attribute, expected) {
  await page.waitForFunction(({ selector, attribute, expected }) =>
    document.querySelector(selector)?.getAttribute(attribute) === expected,
  { selector, attribute, expected }, { timeout: 10_000 });
}

async function follow(page, link, path) {
  // One real touchscreen tap. Never force-click or synthesize the click handler.
  await link.tap();
  await page.waitForURL(`${origin}${path}`, { timeout: 15_000 });
  await settled(page, ".site-shell", "data-locale", path === "/zh" || path.startsWith("/zh/") ? "zh" : "en");
}

async function panelsClosed(page) {
  await settled(page, ".menu-button", "aria-expanded", "false");
  await settled(page, ".theme-trigger", "aria-expanded", "false");
  assert.equal(await page.locator(".mobile-menu").getAttribute("inert"), "");
}

for (const engine of engines) {
  const browser = await playwright[engine].launch({ headless: true });
  try {
    for (const viewport of viewports) for (const locale of ["en", "zh"]) {
      const prefix = locale === "zh" ? "/zh" : "";
      const home = prefix || "/";
      const label = `${engine}/${viewport.width}/${locale}`;
      const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await context.addInitScript(() => {
        window.__gripskyTouchEvidence = { pointer: [], touch: [] };
        addEventListener("pointerdown", (event) => {
          window.__gripskyTouchEvidence.pointer.push({ type: event.pointerType, trusted: event.isTrusted });
        }, { passive: true });
        addEventListener("touchstart", (event) => {
          window.__gripskyTouchEvidence.touch.push({ trusted: event.isTrusted });
        }, { passive: true });
      });
      // External source taps are tested against intercepted GETs. Their document
      // identity and availability are verified separately, not by this stub.
      await context.route("**/*", (route) => {
        const request = route.request();
        if (!["GET", "HEAD"].includes(request.method())) {
          errors.push(`${label}: prevented mutation ${request.method()} ${request.url()}`);
          return route.abort();
        }
        if (new URL(request.url()).hostname === "github.com") {
          return route.fulfill({ status: 200, contentType: "text/html", body: "<title>Intercepted source destination</title>" });
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(10_000);
      page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
      const visitHome = () => page.goto(`${origin}${home}`, { waitUntil: "networkidle" });
      await visitHome();

      await check(`${label}: touch capability and bounds`, async () => {
        await page.locator(".menu-button").tap();
        await page.locator(".menu-button").tap();
        const state = await page.evaluate(() => ({
          coarse: matchMedia("(pointer: coarse)").matches,
          noHover: matchMedia("(hover: none)").matches,
          touchPoints: navigator.maxTouchPoints,
          width: innerWidth,
          contentWidth: document.documentElement.scrollWidth,
          pointerEvents: window.__gripskyTouchEvidence.pointer,
          touchEvents: window.__gripskyTouchEvidence.touch,
        }));
        capabilities.push({ engine, locale, viewport, ...state });
        assert.equal(state.coarse, true);
        assert.equal(state.noHover, true);
        // macOS WebKit can report maxTouchPoints=0 even with hasTouch enabled.
        // Observe the actual trusted touch events instead of altering navigator.
        assert.ok(state.pointerEvents.some((event) => event.type === "touch" && event.trusted));
        assert.ok(state.touchEvents.some((event) => event.trusted));
        assert.ok(state.contentWidth <= state.width + 1);
      });

      await check(`${label}: all six menu routes by tap`, async () => {
        for (const section of ["worldview", "skills", "body", "research", "services", "contact"]) {
          await page.locator(".menu-button").tap();
          await follow(page, page.locator(`.mobile-menu a[href="${prefix}/${section}"]`), `${prefix}/${section}`);
          await panelsClosed(page);
        }
      });
      await check(`${label}: language switch dismisses open menu`, async () => {
        await page.locator(".menu-button").tap();
        const otherPath = locale === "zh" ? "/contact" : "/zh/contact";
        await follow(page, page.locator(".language-switch"), otherPath);
        await panelsClosed(page);
        await follow(page, page.locator(".language-switch"), `${prefix}/contact`);
        await panelsClosed(page);
      });
      await check(`${label}: home link dismisses menu on same route`, async () => {
        await visitHome();
        for (let repeat = 0; repeat < 2; repeat++) {
          await page.locator(".menu-button").tap();
          await follow(page, page.locator(".brand-lockup"), home);
          await panelsClosed(page);
        }
      });
      await check(`${label}: home from deep route and history return`, async () => {
        await follow(page, page.locator(".atlas-button").first(), `${prefix}/skills/catalog`);
        await page.locator(".menu-button").tap();
        await follow(page, page.locator(".brand-lockup"), home);
        await panelsClosed(page);
        await page.locator(".menu-button").tap();
        await page.goBack();
        await page.waitForURL(`${origin}${prefix}/skills/catalog`);
        await panelsClosed(page);
      });
      await check(`${label}: five themes and reload persistence`, async () => {
        for (const theme of ["orbit", "retro", "liquid", "tide", "paper"]) {
          await page.locator(".theme-trigger").tap();
          await page.locator(`.swatch-${theme}`).tap();
          await settled(page, ".site-shell", "data-theme", theme);
          await panelsClosed(page);
        }
        await page.reload({ waitUntil: "networkidle" });
        await settled(page, ".site-shell", "data-theme", "paper");
      });
      await check(`${label}: panels are mutually exclusive`, async () => {
        await page.locator(".theme-trigger").tap();
        await settled(page, ".theme-trigger", "aria-expanded", "true");
        await page.locator(".menu-button").tap();
        await settled(page, ".menu-button", "aria-expanded", "true");
        await settled(page, ".theme-trigger", "aria-expanded", "false");
        await page.locator(".theme-trigger").tap();
        await settled(page, ".theme-trigger", "aria-expanded", "true");
        await settled(page, ".menu-button", "aria-expanded", "false");
        await page.locator(".swatch-paper").tap();
      });
      await check(`${label}: tap outside dismisses panels`, async () => {
        for (const selector of [".menu-button", ".theme-trigger"]) {
          await page.locator(selector).tap();
          await page.touchscreen.tap(8, viewport.height - 8);
          await panelsClosed(page);
        }
      });
      await check(`${label}: repeated skill filters by tap`, async () => {
        await visitHome();
        for (const [index, count] of [[3, 1], [0, 6], [1, 2], [2, 3], [0, 6]]) {
          const filter = page.locator(".atlas-filters button").nth(index);
          await filter.tap();
          await settled(page, `.atlas-filters button:nth-child(${index + 1})`, "aria-pressed", "true");
          assert.equal(await page.locator(".atlas-skill").count(), count);
        }
      });
      await check(`${label}: five diagram entry points need only one tap`, async () => {
        await visitHome();
        const paths = ["/worldview/source", "/worldview", "/about", "/skills", "/body"];
        for (let index = 0; index < paths.length; index++) {
          await follow(page, page.locator(".precision-node a").nth(index), `${prefix}${paths[index]}`);
          await page.goBack();
          await page.waitForURL(`${origin}${home}`);
          await settled(page, ".site-shell", "data-locale", locale);
        }
      });
      await check(`${label}: skill detail and catalog return by tap`, async () => {
        await visitHome();
        await follow(page, page.locator(".atlas-skill").first(), `${prefix}/skills/skill-conceptualization`);
        await follow(page, page.locator(`main .related-links a[href="${prefix}/skills/catalog"]`), `${prefix}/skills/catalog`);
        assert.equal(await page.locator(".catalog-grid > a").count(), 6);
      });
      await check(`${label}: three source destinations open by tap (GET intercepted)`, async () => {
        for (const slug of ["skill-conceptualization", "body-calibration", "information-inheritance"]) {
          await page.goto(`${origin}${prefix}/skills/${slug}`, { waitUntil: "networkidle" });
          const link = page.locator(".skill-documents a");
          const expected = await link.getAttribute("href");
          const [popup] = await Promise.all([page.waitForEvent("popup", { timeout: 10_000 }), link.tap()]);
          await popup.waitForURL(expected, { timeout: 10_000 });
          await popup.close();
        }
      });
      await check(`${label}: subscription controls by tap without sending`, async () => {
        await page.goto(`${origin}${prefix}/contact`, { waitUntil: "networkidle" });
        const tabs = page.locator(".subscription-tabs button");
        for (const index of [1, 0, 1, 0]) {
          await tabs.nth(index).tap();
          await settled(page, `.subscription-tabs button:nth-of-type(${index + 1})`, "aria-selected", "true");
        }
        const topic = page.locator(".topic-grid label").first();
        const input = topic.locator("input");
        const checked = await input.isChecked();
        await topic.tap();
        assert.equal(await input.isChecked(), !checked);
        await topic.tap();
        assert.equal(await input.isChecked(), checked);
      });
      await check(`${label}: touch does not start decorative motion`, async () => {
        await visitHome();
        await settled(page, ".precision-scene", "data-motion-running", "false");
        const states = await page.locator("[data-orbit-motion]").evaluateAll((elements) =>
          elements.flatMap((element) => element.getAnimations().map((animation) => animation.playState)));
        assert.ok(states.every((state) => state !== "running"));
      });
      await context.close();
    }
  } finally { await browser.close(); }
}

console.log(JSON.stringify({
  origin, checkedAt: new Date().toISOString(), mode: "emulated-touch-events-not-physical-device",
  engines, viewports, total: checks.length, passed: checks.filter((entry) => entry.ok).length,
  failures: checks.filter((entry) => !entry.ok), errors, capabilities,
  ...(process.argv.includes("--verbose") ? { checks } : {}),
}, null, 2));
if (errors.length || checks.some((entry) => !entry.ok)) process.exitCode = 1;
