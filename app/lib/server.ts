import type { SESv2Client } from "@aws-sdk/client-sesv2";
import { getRuntimeEnv } from "./runtime-env";
import type { D1DatabaseLike } from "./runtime-env";

export type { D1DatabaseLike } from "./runtime-env";

export const SUBSCRIPTION_TOPICS = [
  "worldview",
  "skills",
  "compatibility",
  "research",
  "services",
] as const;

type SubscriptionTopic = (typeof SUBSCRIPTION_TOPICS)[number];

function workerEnv() {
  return getRuntimeEnv();
}

export function getD1(): D1DatabaseLike {
  const database = workerEnv().DB;
  if (!database) {
    throw new Error("D1 binding DB is not available.");
  }
  return database;
}

let schemaReady: Promise<void> | null = null;

export async function ensureSchema(database: D1DatabaseLike): Promise<void> {
  if (!schemaReady) {
    schemaReady = database
      .batch([
        database.prepare(`
          CREATE TABLE IF NOT EXISTS subscription_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            locale TEXT NOT NULL DEFAULT 'zh',
            topics TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            requested_at INTEGER NOT NULL,
            consumed_at INTEGER
          )
        `),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS subscription_codes_email_idx ON subscription_codes (email)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS subscription_codes_requested_at_idx ON subscription_codes (requested_at)",
        ),
        database.prepare(`
          CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            locale TEXT NOT NULL DEFAULT 'zh',
            topics TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'verified',
            created_at INTEGER NOT NULL,
            verified_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          )
        `),
        database.prepare(
          "CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_unique ON subscribers (email)",
        ),
        database.prepare(`
          CREATE TABLE IF NOT EXISTS contact_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            kind TEXT NOT NULL,
            brief TEXT NOT NULL,
            locale TEXT NOT NULL DEFAULT 'zh',
            status TEXT NOT NULL DEFAULT 'recorded',
            created_at INTEGER NOT NULL,
            forwarded_at INTEGER
          )
        `),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS contact_requests_created_at_idx ON contact_requests (created_at)",
        ),
        database.prepare(`
          CREATE TABLE IF NOT EXISTS email_rate_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scope TEXT NOT NULL,
            subject_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        `),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS email_rate_events_scope_subject_created_at_idx ON email_rate_events (scope, subject_hash, created_at)",
        ),
      ])
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }

  return schemaReady;
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function normalizeLocale(value: unknown): "zh" | "en" {
  return value === "en" ? "en" : "zh";
}

export function normalizeTopics(value: unknown): SubscriptionTopic[] {
  if (!Array.isArray(value)) return ["worldview", "skills"];
  const allowed = new Set<string>(SUBSCRIPTION_TOPICS);
  const topics = [...new Set(value.filter((item): item is SubscriptionTopic => (
    typeof item === "string" && allowed.has(item)
  )))];
  return topics.length ? topics : ["worldview", "skills"];
}

export function createVerificationCode(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, "0");
}

export async function hashVerificationCode(email: string, code: string): Promise<string> {
  const pepper = workerEnv().SUBSCRIPTION_CODE_PEPPER;
  const localPreview = workerEnv().LOCAL_EMAIL_PREVIEW === "true";
  if (!pepper && !localPreview) {
    throw new Error("SUBSCRIPTION_CODE_PEPPER is required when email preview is disabled.");
  }
  const data = new TextEncoder().encode(`${email}:${code}:${pepper ?? "local-preview-only"}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function clientAddress(request: Request): string {
  const cloudflareAddress = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareAddress) return cloudflareAddress;
  const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedAddress || "unknown";
}

async function hashRateSubject(scope: string, value: string): Promise<string> {
  const pepper = workerEnv().SUBSCRIPTION_CODE_PEPPER ?? "local-preview-only";
  const data = new TextEncoder().encode(`rate:${scope}:${value}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

type EmailRateLimit = {
  scope: string;
  subject: string;
  windowMs: number;
  maximum: number;
};

export async function claimEmailSendBudget(
  database: D1DatabaseLike,
  request: Request,
  kind: "subscription-code" | "contact-forward",
  email: string,
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const now = Date.now();
  const address = clientAddress(request);
  const limits: EmailRateLimit[] = kind === "subscription-code"
    ? [
      { scope: "subscription-email-hour", subject: email, windowMs: 60 * 60_000, maximum: 3 },
      { scope: "subscription-email-day", subject: email, windowMs: 24 * 60 * 60_000, maximum: 8 },
      { scope: "subscription-ip-hour", subject: address, windowMs: 60 * 60_000, maximum: 10 },
      { scope: "subscription-ip-day", subject: address, windowMs: 24 * 60 * 60_000, maximum: 30 },
    ]
    : [
      { scope: "contact-email-hour", subject: email, windowMs: 60 * 60_000, maximum: 2 },
      { scope: "contact-email-day", subject: email, windowMs: 24 * 60 * 60_000, maximum: 5 },
      { scope: "contact-ip-hour", subject: address, windowMs: 60 * 60_000, maximum: 5 },
      { scope: "contact-ip-day", subject: address, windowMs: 24 * 60 * 60_000, maximum: 12 },
    ];

  const hashedLimits = await Promise.all(limits.map(async (limit) => ({
    ...limit,
    subjectHash: await hashRateSubject(limit.scope, limit.subject),
  })));

  for (const limit of hashedLimits) {
    const since = now - limit.windowMs;
    const result = await database
      .prepare("SELECT COUNT(*) AS count FROM email_rate_events WHERE scope = ? AND subject_hash = ? AND created_at >= ?")
      .bind(limit.scope, limit.subjectHash, since)
      .first<{ count: number }>();
    if ((result?.count ?? 0) >= limit.maximum) {
      return { ok: false, retryAfterSeconds: Math.ceil(limit.windowMs / 1_000) };
    }
  }

  await database.batch([
    database.prepare("DELETE FROM email_rate_events WHERE created_at < ?").bind(now - 31 * 24 * 60 * 60_000),
    ...hashedLimits.map((limit) => database
      .prepare("INSERT INTO email_rate_events (scope, subject_hash, created_at) VALUES (?, ?, ?)")
      .bind(limit.scope, limit.subjectHash, now)),
  ]);
  return { ok: true };
}

type SesModule = typeof import("@aws-sdk/client-sesv2");

const sesModuleName = ["@aws-sdk", "client-sesv2"].join("/");
let sesModulePromise: Promise<SesModule> | null = null;

function loadSesModule(): Promise<SesModule> {
  sesModulePromise ??= import(/* @vite-ignore */ sesModuleName) as Promise<SesModule>;
  return sesModulePromise;
}

async function sesClient(): Promise<{
  client: SESv2Client;
  from: string;
  SendEmailCommand: SesModule["SendEmailCommand"];
} | null> {
  const values = workerEnv();
  if (
    !values.AWS_SES_REGION ||
    !values.AWS_SES_ACCESS_KEY_ID ||
    !values.AWS_SES_SECRET_ACCESS_KEY ||
    !values.SES_FROM_EMAIL
  ) {
    return null;
  }

  const { SESv2Client, SendEmailCommand } = await loadSesModule();

  return {
    client: new SESv2Client({
      region: values.AWS_SES_REGION,
      credentials: {
        accessKeyId: values.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: values.AWS_SES_SECRET_ACCESS_KEY,
      },
    }),
    from: values.SES_FROM_EMAIL,
    SendEmailCommand,
  };
}

function fromEmailAddress(address: string): string {
  return address.includes("<") ? address : `GripSky <${address}>`;
}

function escapeEmailHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function brandedEmailHtml(title: string, content: string): string {
  return `<!doctype html>
<html lang="en"><body style="margin:0;background:#f4f7fb;color:#18202b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <main style="max-width:560px;margin:32px auto;padding:0 20px">
    <section style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;box-shadow:0 12px 36px rgba(15,23,42,.08)">
      <img src="https://gripsky.org/icon-192.png" width="56" height="56" alt="GripSky" style="display:block;border-radius:14px;margin:0 0 20px" />
      <div style="font-size:12px;letter-spacing:.12em;color:#64748b">GRIPSKY</div>
      <h1 style="margin:10px 0 16px;font-size:24px;line-height:1.25">${escapeEmailHtml(title)}</h1>
      <div style="font-size:16px;line-height:1.7;color:#334155">${content}</div>
    </section>
  </main>
</body></html>`;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  locale: "zh" | "en",
): Promise<"sent" | "preview"> {
  const ses = await sesClient();
  if (!ses) {
    if (workerEnv().LOCAL_EMAIL_PREVIEW === "true") return "preview";
    throw new Error("SES is not configured.");
  }

  const isZh = locale === "zh";
  const subject = isZh ? "GripSky 订阅验证码" : "GripSky subscription code";
  const text = isZh
    ? `你的验证码是 ${code}，10 分钟内有效。若不是你发起的请求，请忽略此邮件。`
    : `Your verification code is ${code}. It expires in 10 minutes. Ignore this email if you did not request it.`;
  const html = brandedEmailHtml(
    subject,
    isZh
      ? `<p>你的验证码是：</p><p style="margin:20px 0;font-size:32px;font-weight:700;letter-spacing:.18em;color:#0f766e">${code}</p><p>10 分钟内有效。若不是你发起的请求，请忽略此邮件。</p>`
      : `<p>Your verification code is:</p><p style="margin:20px 0;font-size:32px;font-weight:700;letter-spacing:.18em;color:#0f766e">${code}</p><p>It expires in 10 minutes. Ignore this email if you did not request it.</p>`,
  );
  await ses.client.send(new ses.SendEmailCommand({
    FromEmailAddress: fromEmailAddress(ses.from),
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: text, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    },
  }));
  return "sent";
}

export async function forwardContactRequest(input: {
  name: string;
  email: string;
  kind: string;
  brief: string;
  locale: "zh" | "en";
}): Promise<boolean> {
  const ses = await sesClient();
  const inbox = workerEnv().SERVICE_INBOX_EMAIL;
  if (!ses || !inbox) return false;

  await ses.client.send(new ses.SendEmailCommand({
    FromEmailAddress: fromEmailAddress(ses.from),
    Destination: { ToAddresses: [inbox] },
    ReplyToAddresses: [input.email],
    Content: {
      Simple: {
        Subject: { Data: `[GripSky] ${input.kind} — ${input.name}`, Charset: "UTF-8" },
        Body: {
          Text: {
            Data: [
              `Name: ${input.name}`,
              `Email: ${input.email}`,
              `Locale: ${input.locale}`,
              `Type: ${input.kind}`,
              "",
              input.brief,
            ].join("\n"),
            Charset: "UTF-8",
          },
          Html: {
            Data: brandedEmailHtml(
              `[GripSky] ${input.kind}`,
              `<p><strong>Name:</strong> ${escapeEmailHtml(input.name)}<br /><strong>Email:</strong> ${escapeEmailHtml(input.email)}<br /><strong>Locale:</strong> ${escapeEmailHtml(input.locale)}<br /><strong>Type:</strong> ${escapeEmailHtml(input.kind)}</p><p style="white-space:pre-wrap">${escapeEmailHtml(input.brief)}</p>`,
            ),
            Charset: "UTF-8",
          },
        },
      },
    },
  }));
  return true;
}

export function localPreviewEnabled(): boolean {
  return workerEnv().LOCAL_EMAIL_PREVIEW === "true";
}
