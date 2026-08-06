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

export type SubscriptionTopic = (typeof SUBSCRIPTION_TOPICS)[number];
export type SubscriptionIntent = "subscribe" | "unsubscribe";

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
    schemaReady = (async () => {
      await database.batch([
        database.prepare(`
          CREATE TABLE IF NOT EXISTS subscription_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            intent TEXT NOT NULL DEFAULT 'subscribe',
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
            updated_at INTEGER NOT NULL,
            public_id TEXT,
            unsubscribed_at INTEGER,
            suppression_reason TEXT
          )
        `),
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
            created_at INTEGER NOT NULL,
            claim_id TEXT
          )
        `),
        database.prepare(`
          CREATE TABLE IF NOT EXISTS update_publications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL,
            topic TEXT NOT NULL,
            title_en TEXT NOT NULL,
            title_zh TEXT NOT NULL,
            summary_en TEXT NOT NULL,
            summary_zh TEXT NOT NULL,
            url TEXT NOT NULL,
            published_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
          )
        `),
        database.prepare(`
          CREATE TABLE IF NOT EXISTS update_deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            publication_id INTEGER NOT NULL REFERENCES update_publications(id),
            subscriber_id INTEGER NOT NULL REFERENCES subscribers(id),
            status TEXT NOT NULL DEFAULT 'pending',
            attempts INTEGER NOT NULL DEFAULT 0,
            next_attempt_at INTEGER NOT NULL,
            claim_token TEXT,
            provider_message_id TEXT,
            last_error TEXT,
            created_at INTEGER NOT NULL,
            sent_at INTEGER
          )
        `),
      ]);

      await addColumn(database, "ALTER TABLE subscribers ADD COLUMN public_id TEXT");
      await addColumn(database, "ALTER TABLE subscribers ADD COLUMN unsubscribed_at INTEGER");
      await addColumn(database, "ALTER TABLE subscribers ADD COLUMN suppression_reason TEXT");
      await addColumn(database, "ALTER TABLE email_rate_events ADD COLUMN claim_id TEXT");
      await addColumn(database, "ALTER TABLE subscription_codes ADD COLUMN intent TEXT NOT NULL DEFAULT 'subscribe'");

      await database.batch([
        database.prepare(
          "CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_unique ON subscribers (email)",
        ),
        database.prepare(
          "CREATE UNIQUE INDEX IF NOT EXISTS subscribers_public_id_unique ON subscribers (public_id)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS email_rate_events_scope_subject_created_at_idx ON email_rate_events (scope, subject_hash, created_at)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS email_rate_events_claim_id_idx ON email_rate_events (claim_id)",
        ),
        database.prepare(
          "CREATE UNIQUE INDEX IF NOT EXISTS update_publications_slug_unique ON update_publications (slug)",
        ),
        database.prepare(
          "CREATE UNIQUE INDEX IF NOT EXISTS update_deliveries_publication_subscriber_unique ON update_deliveries (publication_id, subscriber_id)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS update_deliveries_status_next_attempt_idx ON update_deliveries (status, next_attempt_at)",
        ),
      ]);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

async function addColumn(database: D1DatabaseLike, statement: string): Promise<void> {
  try {
    await database.prepare(statement).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/duplicate column|already exists/i.test(message)) return;
    throw error;
  }
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

export function normalizeSubscriptionIntent(value: unknown): SubscriptionIntent {
  return value === "unsubscribe" ? "unsubscribe" : "subscribe";
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
  const data = new TextEncoder().encode(`${email}:${code}:${subscriptionPepper()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function subscriptionPepper(): string {
  const pepper = workerEnv().SUBSCRIPTION_CODE_PEPPER;
  if (pepper) return pepper;
  if (workerEnv().LOCAL_EMAIL_PREVIEW === "true") return "local-preview-only";
  throw new Error("SUBSCRIPTION_CODE_PEPPER is required when email preview is disabled.");
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

async function subscriberSignature(publicId: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(subscriptionPepper()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`unsubscribe:${publicId}`),
  ));
}

export async function createSubscriberToken(publicId: string): Promise<string> {
  return `${publicId}.${base64Url(await subscriberSignature(publicId))}`;
}

export async function verifySubscriberToken(token: unknown): Promise<string | null> {
  if (typeof token !== "string" || token.length > 160) return null;
  const match = token.match(/^([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/i);
  if (!match) return null;
  const expected = base64Url(await subscriberSignature(match[1]));
  const actualBytes = new TextEncoder().encode(match[2]);
  const expectedBytes = new TextEncoder().encode(expected);
  if (actualBytes.length !== expectedBytes.length) return null;
  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }
  return difference === 0 ? match[1] : null;
}

export function createSubscriberPublicId(): string {
  return crypto.randomUUID();
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export async function authorizeUpdateRequest(request: Request): Promise<boolean> {
  const expected = workerEnv().UPDATE_PUBLISH_TOKEN ?? (
    workerEnv().LOCAL_EMAIL_PREVIEW === "true"
      ? "local-preview-update-token-0000000000000000"
      : undefined
  );
  if (!expected || expected.length < 32) return false;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expectedDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected));
  const suppliedDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(supplied));
  const left = new Uint8Array(expectedDigest);
  const right = new Uint8Array(suppliedDigest);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
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
): Promise<
  { ok: true; claimId: string } |
  { ok: false; retryAfterSeconds: number }
> {
  const now = Date.now();
  const claimId = crypto.randomUUID();
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
      .prepare("INSERT INTO email_rate_events (scope, subject_hash, created_at, claim_id) VALUES (?, ?, ?, ?)")
      .bind(limit.scope, limit.subjectHash, now, claimId)),
  ]);
  return { ok: true, claimId };
}

export async function releaseEmailSendBudget(
  database: D1DatabaseLike,
  claimId: string,
): Promise<void> {
  await database.prepare("DELETE FROM email_rate_events WHERE claim_id = ?").bind(claimId).run();
}

type SesEmailRequest = {
  FromEmailAddress: string;
  Destination: { ToAddresses: string[] };
  ReplyToAddresses?: string[];
  Content: {
    Simple: {
      Subject: { Data: string; Charset: "UTF-8" };
      Headers?: Array<{ Name: string; Value: string }>;
      Body: {
        Text: { Data: string; Charset: "UTF-8" };
        Html: { Data: string; Charset: "UTF-8" };
      };
    };
  };
};

function sesConfig(): {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  from: string;
} | null {
  const values = workerEnv();
  if (
    !values.AWS_SES_REGION ||
    !values.AWS_SES_ACCESS_KEY_ID ||
    !values.AWS_SES_SECRET_ACCESS_KEY ||
    !values.SES_FROM_EMAIL
  ) {
    return null;
  }

  return {
    region: values.AWS_SES_REGION,
    accessKeyId: values.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: values.AWS_SES_SECRET_ACCESS_KEY,
    from: values.SES_FROM_EMAIL,
  };
}

const textEncoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));
}

async function hmacSha256(key: Uint8Array, value: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(value)));
}

async function sendSesEmail(request: SesEmailRequest): Promise<{ MessageId?: string }> {
  const config = sesConfig();
  if (!config) throw new Error("SES is not configured.");

  const body = JSON.stringify(request);
  const hostname = `email.${config.region}.amazonaws.com`;
  const path = "/v2/email/outbound-emails";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = bytesToHex(await sha256(body));
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalHeaders = `content-type:application/json\nhost:${hostname}\nx-amz-date:${amzDate}\n`;
  const canonicalRequest = ["POST", path, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/ses/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    bytesToHex(await sha256(canonicalRequest)),
  ].join("\n");
  const dateKey = await hmacSha256(textEncoder.encode(`AWS4${config.secretAccessKey}`), dateStamp);
  const regionKey = await hmacSha256(dateKey, config.region);
  const serviceKey = await hmacSha256(regionKey, "ses");
  const signingKey = await hmacSha256(serviceKey, "aws4_request");
  const signature = bytesToHex(await hmacSha256(signingKey, stringToSign));
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${hostname}${path}`, {
    method: "POST",
    headers: {
      authorization,
      "content-type": "application/json",
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body,
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`SES SendEmail failed (${response.status}): ${detail}`);
  }
  return await response.json() as { MessageId?: string };
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
      <img src="https://gripsky.org/gripsky-favicon-light-20260806-192.png" width="56" height="56" alt="GripSky" style="display:block;border-radius:14px;margin:0 0 20px" />
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
  intent: SubscriptionIntent = "subscribe",
): Promise<"sent" | "preview"> {
  const ses = sesConfig();
  if (!ses) {
    if (workerEnv().LOCAL_EMAIL_PREVIEW === "true") return "preview";
    throw new Error("SES is not configured.");
  }

  const isZh = locale === "zh";
  const isUnsubscribe = intent === "unsubscribe";
  const subject = isUnsubscribe
    ? isZh ? "GripSky 退订验证码" : "GripSky unsubscribe code"
    : isZh ? "GripSky 订阅验证码" : "GripSky subscription code";
  const purpose = isUnsubscribe
    ? isZh ? "用于解除 GripSky 更新订阅" : "to unsubscribe from GripSky updates"
    : isZh ? "用于确认 GripSky 更新订阅" : "to confirm your GripSky update subscription";
  const text = isZh
    ? `你的验证码是 ${code}，${purpose}，10 分钟内有效。若不是你发起的请求，请忽略此邮件。`
    : `Your verification code is ${code}, ${purpose}. It expires in 10 minutes. Ignore this email if you did not request it.`;
  const html = brandedEmailHtml(
    subject,
    isZh
      ? `<p>你的验证码是：</p><p style="margin:20px 0;font-size:32px;font-weight:700;letter-spacing:.18em;color:#0f766e">${code}</p><p>${purpose}，10 分钟内有效。若不是你发起的请求，请忽略此邮件。</p>`
      : `<p>Your verification code is:</p><p style="margin:20px 0;font-size:32px;font-weight:700;letter-spacing:.18em;color:#0f766e">${code}</p><p>Use it ${purpose}. It expires in 10 minutes. Ignore this email if you did not request it.</p>`,
  );
  await sendSesEmail({
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
  });
  return "sent";
}

export async function sendUpdateEmail(input: {
  email: string;
  locale: "zh" | "en";
  topic: SubscriptionTopic;
  title: string;
  summary: string;
  url: string;
  subscriberToken: string;
}): Promise<{ delivery: "sent" | "preview"; messageId: string }> {
  const preferencesUrl = new URL(input.locale === "zh" ? "/zh/unsubscribe" : "/unsubscribe", "https://gripsky.org");
  preferencesUrl.searchParams.set("token", input.subscriberToken);
  const oneClickUrl = new URL("/api/subscription/unsubscribe", "https://gripsky.org");
  oneClickUrl.searchParams.set("token", input.subscriberToken);
  oneClickUrl.searchParams.set("topic", input.topic);

  const isZh = input.locale === "zh";
  const action = isZh ? "阅读这次更新" : "Read this update";
  const manage = isZh ? "管理订阅或退订" : "Manage or unsubscribe";
  const text = [
    input.title,
    "",
    input.summary,
    "",
    `${action}: ${input.url}`,
    `${manage}: ${preferencesUrl.toString()}`,
  ].join("\n");
  const html = brandedEmailHtml(
    input.title,
    `<p>${escapeEmailHtml(input.summary)}</p><p style="margin:26px 0"><a href="${escapeEmailHtml(input.url)}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px">${action}</a></p><hr style="border:0;border-top:1px solid #e2e8f0;margin:28px 0 18px" /><p style="font-size:13px;color:#64748b">${isZh ? "您收到这封邮件，是因为已订阅 GripSky 的相关更新。" : "You received this message because you subscribed to this GripSky update topic."}<br /><a href="${escapeEmailHtml(preferencesUrl.toString())}" style="color:#475569">${manage}</a></p>`,
  );

  const ses = sesConfig();
  if (!ses) {
    if (workerEnv().LOCAL_EMAIL_PREVIEW === "true") {
      return { delivery: "preview", messageId: "preview" };
    }
    throw new Error("SES is not configured.");
  }

  const result = await sendSesEmail({
    FromEmailAddress: fromEmailAddress(ses.from),
    Destination: { ToAddresses: [input.email] },
    Content: {
      Simple: {
        Subject: { Data: `[GripSky] ${input.title}`, Charset: "UTF-8" },
        Headers: [
          { Name: "List-Unsubscribe", Value: `<${oneClickUrl.toString()}>` },
          { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
        ],
        Body: {
          Text: { Data: text, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    },
  });
  return { delivery: "sent", messageId: result.MessageId ?? "accepted" };
}

export async function forwardContactRequest(input: {
  name: string;
  email: string;
  kind: string;
  brief: string;
  locale: "zh" | "en";
}): Promise<boolean> {
  const ses = sesConfig();
  const inbox = workerEnv().SERVICE_INBOX_EMAIL;
  if (!ses || !inbox) return false;

  await sendSesEmail({
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
  });
  return true;
}

export function localPreviewEnabled(): boolean {
  return workerEnv().LOCAL_EMAIL_PREVIEW === "true";
}
