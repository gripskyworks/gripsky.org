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
  await ses.client.send(new ses.SendEmailCommand({
    FromEmailAddress: ses.from,
    Destination: { ToAddresses: [email] },
    Content: {
      Simple: {
        Subject: { Data: isZh ? "GripSky 订阅验证码" : "GripSky subscription code", Charset: "UTF-8" },
        Body: {
          Text: {
            Data: isZh
              ? `你的验证码是 ${code}，10 分钟内有效。若不是你发起的请求，请忽略此邮件。`
              : `Your verification code is ${code}. It expires in 10 minutes. Ignore this email if you did not request it.`,
            Charset: "UTF-8",
          },
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
    FromEmailAddress: ses.from,
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
        },
      },
    },
  }));
  return true;
}

export function localPreviewEnabled(): boolean {
  return workerEnv().LOCAL_EMAIL_PREVIEW === "true";
}
