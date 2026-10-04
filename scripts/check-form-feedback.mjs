import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// All form requests are fulfilled or aborted inside this isolated browser.
// No subscription, contact record or email is created, even on the local server.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = new URL(process.argv[2] || "http://localhost:3014").origin;
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname), "Use a loopback preview, never the public site.");
const feedbackSource = readFileSync(new URL("../app/lib/form-feedback.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(feedbackSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { formErrorMessage } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
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

function readable(message, locale) {
  assert.ok(message?.trim());
  assert.doesNotMatch(message, /Cannot read properties|Failed to fetch|synthetic-provider|Request failed/);
  if (locale === "zh") assert.match(message, /[\u3400-\u9fff]/);
}

try {
  for (const locale of ["en", "zh"]) {
    const prefix = locale === "zh" ? "/zh" : "";
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const mocked = [];
    const mode = { code: "ok", verify: "ok", preferences: "ok", contact: "ok", wasSubscribed: true };
    await context.route("**/*", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const respond = (status, body) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      if (path === "/api/subscription/preferences" && request.method() === "GET") {
        if (mode.preferences === "network") return route.abort();
        if (mode.preferences === "invalid") return respond(404, { error: "This subscription link is unavailable." });
        return respond(200, { email: "r***@example.test", topics: ["skills"], status: "verified", locale });
      }
      if (request.method() === "POST") {
        mocked.push({ path, payload: request.postDataJSON() });
        if (path === "/api/subscription/request-code") {
          if (mode.code === "network") return route.abort();
          if (mode.code === "limit") return respond(429, { error: "A code was sent recently. Please wait one minute." });
          return respond(200, { ok: true, delivery: "preview", previewCode: "246810" });
        }
        if (path === "/api/subscription/verify") {
          if (mode.verify === "wrong") return respond(400, { error: "The code is incorrect." });
          return respond(200, { ok: true, wasSubscribed: mode.wasSubscribed });
        }
        if (path === "/api/subscription/preferences") {
          if (mode.preferences === "save-fail") return respond(500, { error: "synthetic-provider-error" });
          const topics = request.postDataJSON().topics;
          return respond(200, { ok: true, topics, status: topics.length ? "verified" : "unsubscribed" });
        }
        if (path === "/api/contact") {
          if (mode.contact === "network") return route.abort();
          if (mode.contact === "invalid") return respond(400, { error: "Complete every field and provide a brief of at least 20 characters." });
          return respond(201, { ok: true, recorded: true, forwarded: false });
        }
        errors.push(`${locale}: unexpected mutation was blocked: ${path}`);
        return route.abort();
      }
      if (!["GET", "HEAD"].includes(request.method())) {
        errors.push(`${locale}: unexpected method was blocked: ${request.method()} ${path}`);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    page.on("pageerror", (error) => errors.push(`${locale}: ${error.message}`));
    const center = page.locator(".subscription-center");
    const openSubscription = async (unsubscribe = false) => {
      await page.goto(`${origin}${prefix}/updates/subscribe`, { waitUntil: "networkidle" });
      if (unsubscribe) await center.locator('[role="tab"]').last().click();
      await center.locator('input[type="email"]').fill("copy-review@example.test");
    };
    const requestCode = () => center.locator('button[type="submit"]').click();
    const codeInput = center.locator('input[autocomplete="one-time-code"]');
    const message = center.locator(".form-message");

    await check(`${locale}: choose at least one topic without contacting the API`, async () => {
      await openSubscription();
      for (const input of await center.locator('input[type="checkbox"]').all()) {
        if (await input.isChecked()) await input.uncheck();
      }
      const count = mocked.length;
      await requestCode();
      await message.waitFor();
      readable(await message.textContent(), locale);
      assert.equal(mocked.length, count);
    });
    await check(`${locale}: rate limit has localized retry advice`, async () => {
      mode.code = "limit";
      await openSubscription();
      await requestCode();
      await page.waitForFunction((expected) => document.querySelector(".subscription-center .form-message")?.textContent === expected,
        formErrorMessage("A code was sent recently. Please wait one minute.", locale, "request-code"));
    });
    await check(`${locale}: requesting a code handles connection failure`, async () => {
      mode.code = "network";
      await openSubscription();
      await requestCode();
      await page.waitForFunction((expected) => document.querySelector(".subscription-center .form-message")?.textContent === expected,
        formErrorMessage("synthetic-unknown", locale, "request-code"));
    });
    await check(`${locale}: preview code opens verification without sending email`, async () => {
      mode.code = "ok";
      await openSubscription();
      await requestCode();
      await codeInput.waitFor();
      assert.match(await message.textContent(), /246810/);
    });
    await check(`${locale}: wrong verification code stays on the verification step`, async () => {
      mode.verify = "wrong";
      await codeInput.fill("000000");
      await requestCode();
      await page.waitForFunction((expected) => document.querySelector(".subscription-center .form-message")?.textContent === expected,
        formErrorMessage("The code is incorrect.", locale, "verify-code"));
      assert.ok(await codeInput.isVisible());
    });
    await check(`${locale}: successful verification shows confirmation`, async () => {
      mode.verify = "ok";
      await codeInput.fill("246810");
      await requestCode();
      await center.locator(".form-complete").waitFor();
      readable(await center.locator(".form-complete p").textContent(), locale);
    });
    for (const wasSubscribed of [true, false]) {
      await check(`${locale}: self-unsubscribe confirms ${wasSubscribed ? "existing" : "absent"} subscription`, async () => {
        mode.wasSubscribed = wasSubscribed;
        await openSubscription(true);
        await requestCode();
        await codeInput.waitFor();
        assert.equal(mocked.findLast((entry) => entry.path === "/api/subscription/request-code").payload.intent, "unsubscribe");
        await codeInput.fill("246810");
        await requestCode();
        await center.locator(".form-complete").waitFor();
        readable(await center.locator(".form-complete p").textContent(), locale);
      });
    }
    const notLoading = async () => {
      assert.doesNotMatch(await page.locator(".subscription-form .form-heading").textContent(), /Loading subscription|正在读取订阅/);
    };
    await check(`${locale}: missing management token does not claim to be loading`, async () => {
      await page.goto(`${origin}${prefix}/unsubscribe`, { waitUntil: "networkidle" });
      await page.waitForFunction((expected) => document.querySelector(".subscription-form .form-message")?.textContent === expected,
        formErrorMessage("This subscription link is unavailable.", locale, "load-preferences"));
      await notLoading();
    });
    await check(`${locale}: invalid management link explains the alternative`, async () => {
      mode.preferences = "invalid";
      await page.goto(`${origin}${prefix}/unsubscribe?token=synthetic-copy-review`, { waitUntil: "networkidle" });
      await page.waitForFunction((expected) => document.querySelector(".subscription-form .form-message")?.textContent === expected,
        formErrorMessage("This subscription link is unavailable.", locale, "load-preferences"));
      await notLoading();
    });
    await check(`${locale}: preference connection failure is not an invalid-link warning`, async () => {
      mode.preferences = "network";
      await page.goto(`${origin}${prefix}/unsubscribe?token=synthetic-copy-review`, { waitUntil: "networkidle" });
      await page.waitForFunction((expected) => document.querySelector(".subscription-form .form-message")?.textContent === expected,
        formErrorMessage("synthetic-network", locale, "load-preferences"));
      await notLoading();
    });
    await check(`${locale}: saving preferences confirms the selected topics`, async () => {
      mode.preferences = "ok";
      await page.goto(`${origin}${prefix}/unsubscribe?token=synthetic-copy-review`, { waitUntil: "networkidle" });
      await page.locator('.subscription-form input[type="checkbox"]').first().check();
      await page.locator('.subscription-form button[type="submit"]').click();
      await page.locator(".subscription-form .form-message").waitFor();
      readable(await page.locator(".subscription-form .form-message").textContent(), locale);
      assert.deepEqual(mocked.findLast((entry) => entry.path === "/api/subscription/preferences").payload.topics, ["skills", "worldview"]);
    });
    await check(`${locale}: failed preference save hides internal errors`, async () => {
      mode.preferences = "save-fail";
      await page.goto(`${origin}${prefix}/unsubscribe?token=synthetic-copy-review`, { waitUntil: "networkidle" });
      await page.locator('.subscription-form button[type="submit"]').click();
      await page.waitForFunction((expected) => document.querySelector(".subscription-form .form-message")?.textContent === expected,
        formErrorMessage("synthetic-provider-error", locale, "save-preferences"));
    });
    const submitContact = async () => {
      await page.goto(`${origin}${prefix}/contact`, { waitUntil: "networkidle" });
      const form = page.locator(".contact-form");
      await form.locator('[name="name"]').fill("Synthetic copy review");
      await form.locator('[name="email"]').fill("copy-review@example.test");
      await form.locator('[name="brief"]').fill("A synthetic request, intercepted in the browser. No database or email is used.");
      await form.locator('button[type="submit"]').click();
      await form.locator(".form-message").waitFor();
      return form;
    };
    await check(`${locale}: recorded contact succeeds and clears the form`, async () => {
      mode.contact = "ok";
      const form = await submitContact();
      readable(await form.locator(".form-message").textContent(), locale);
      assert.equal(await form.locator('[name="name"]').inputValue(), "");
    });
    await check(`${locale}: contact validation explains what to fix`, async () => {
      mode.contact = "invalid";
      const form = await submitContact();
      assert.equal(await form.locator(".form-message").textContent(),
        formErrorMessage("Complete every field and provide a brief of at least 20 characters.", locale, "contact"));
      assert.notEqual(await form.locator('[name="name"]').inputValue(), "");
    });
    await check(`${locale}: contact connection failure does not claim non-delivery`, async () => {
      mode.contact = "network";
      const form = await submitContact();
      assert.equal(await form.locator(".form-message").textContent(), formErrorMessage("synthetic-unknown", locale, "contact"));
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = checks.filter((item) => !item.ok);
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), total: checks.length, passed: checks.length - failures.length, failures, errors, requests: "All form requests intercepted; no server-side mutations or email." }, null, 2));
if (failures.length || errors.length) process.exitCode = 1;
