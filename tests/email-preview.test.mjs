import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function moduleUrl(source) {
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
}
const runtimeUrl = moduleUrl(readFileSync(new URL("../app/lib/runtime-env.ts", import.meta.url), "utf8"));
const source = readFileSync(new URL("../app/lib/server.ts", import.meta.url), "utf8")
  .replace('from "./runtime-env"', `from "${runtimeUrl}"`);
const { sendVerificationEmail, sendUpdateEmail, forwardContactRequest } = await import(moduleUrl(source));
const syntheticEnv = {
  AWS_SES_REGION: "us-east-1",
  AWS_SES_ACCESS_KEY_ID: "synthetic-test-key",
  AWS_SES_SECRET_ACCESS_KEY: "synthetic-test-secret",
  SES_FROM_EMAIL: "test@example.com",
  SERVICE_INBOX_EMAIL: "inbox@example.com",
};
const update = { email: "reader@example.com", locale: "en", topic: "skills", title: "Test release", summary: "A synthetic update.", url: "https://example.com/update", subscriberToken: "test-token" };
const contact = { name: "Test reader", email: "reader@example.com", kind: "research", brief: "A synthetic contact request.", locale: "en" };

test("local preview blocks verification, update and contact email even when SES is configured", async () => {
  const previousEnv = globalThis.__GRIPSKY_ENV__;
  const previousFetch = globalThis.fetch;
  let attempts = 0;
  globalThis.__GRIPSKY_ENV__ = { ...syntheticEnv, LOCAL_EMAIL_PREVIEW: "true" };
  globalThis.fetch = async () => { attempts += 1; throw new Error("No network is allowed in this test."); };
  try {
    assert.equal(await sendVerificationEmail("reader@example.com", "123456", "en"), "preview");
    assert.equal(await sendVerificationEmail("reader@example.com", "123456", "en", "unsubscribe"), "preview");
    assert.deepEqual(await sendUpdateEmail(update), { delivery: "preview", messageId: "preview" });
    assert.equal(await forwardContactRequest(contact), false);
    assert.equal(attempts, 0);
  } finally {
    globalThis.__GRIPSKY_ENV__ = previousEnv;
    globalThis.fetch = previousFetch;
  }
});

test("mail delivery without preview retains SES payloads and unsubscribe headers using a stub", async () => {
  const previousEnv = globalThis.__GRIPSKY_ENV__;
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.__GRIPSKY_ENV__ = { ...syntheticEnv, LOCAL_EMAIL_PREVIEW: "false" };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, payload: JSON.parse(options.body) });
    return new Response(JSON.stringify({ MessageId: "synthetic-message" }), { status: 200 });
  };
  try {
    assert.equal(await sendVerificationEmail("reader@example.com", "123456", "en"), "sent");
    assert.deepEqual(await sendUpdateEmail(update), { delivery: "sent", messageId: "synthetic-message" });
    assert.equal(await forwardContactRequest(contact), true);
    assert.equal(requests.length, 3);
    assert.ok(requests.every((request) => new URL(request.url).hostname === "email.us-east-1.amazonaws.com"));
    const headers = requests[1].payload.Content.Simple.Headers;
    assert.equal(headers.find((header) => header.Name === "List-Unsubscribe-Post").Value, "List-Unsubscribe=One-Click");
    assert.deepEqual(requests[2].payload.ReplyToAddresses, ["reader@example.com"]);
  } finally {
    globalThis.__GRIPSKY_ENV__ = previousEnv;
    globalThis.fetch = previousFetch;
  }
});

test("Chinese email declares its language and keeps verification separate from release unsubscribe", async () => {
  const previousEnv = globalThis.__GRIPSKY_ENV__;
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.__GRIPSKY_ENV__ = { ...syntheticEnv, LOCAL_EMAIL_PREVIEW: "false" };
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ MessageId: "synthetic-zh-message" }), { status: 200 });
  };
  try {
    await sendVerificationEmail("reader@example.com", "123456", "zh");
    await sendUpdateEmail({ ...update, locale: "zh", title: "合成测试", summary: "不发送真实邮件。" });
    assert.equal(requests.length, 2);
    for (const request of requests) assert.match(request.Content.Simple.Body.Html.Data, /<html lang="zh-CN">/);
    assert.equal(requests[0].Content.Simple.Headers, undefined, "A requested verification email is not an update subscription.");
    const updateMessage = requests[1].Content.Simple;
    assert.ok(updateMessage.Headers.some((header) => header.Name === "List-Unsubscribe"));
    assert.match(updateMessage.Body.Html.Data, /管理订阅或退订/);
    assert.match(updateMessage.Body.Text.Data, /\/zh\/unsubscribe\?token=/);
  } finally {
    globalThis.__GRIPSKY_ENV__ = previousEnv;
    globalThis.fetch = previousFetch;
  }
});
