import { NextResponse } from "next/server";
import {
  ensureSchema,
  getD1,
  maskEmail,
  SUBSCRIPTION_TOPICS,
  verifySubscriberToken,
} from "@/app/lib/server";

type SubscriberPreferences = {
  email: string;
  locale: "zh" | "en";
  topics: string;
  status: string;
};

const allowedTopics = new Set<string>(SUBSCRIPTION_TOPICS);

function parseTopics(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((topic): topic is string => typeof topic === "string" && allowedTopics.has(topic))
      : [];
  } catch {
    return [];
  }
}

async function subscriberForToken(token: unknown): Promise<{
  publicId: string;
  subscriber: SubscriberPreferences;
} | null> {
  const publicId = await verifySubscriberToken(token);
  if (!publicId) return null;
  const database = getD1();
  await ensureSchema(database);
  const subscriber = await database
    .prepare("SELECT email, locale, topics, status FROM subscribers WHERE public_id = ? LIMIT 1")
    .bind(publicId)
    .first<SubscriberPreferences>();
  return subscriber ? { publicId, subscriber } : null;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const result = await subscriberForToken(token);
  if (!result) {
    return NextResponse.json({ error: "This subscription link is unavailable." }, { status: 404 });
  }
  return NextResponse.json({
    email: maskEmail(result.subscriber.email),
    locale: result.subscriber.locale,
    topics: parseTopics(result.subscriber.topics),
    status: result.subscriber.status,
  }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const result = await subscriberForToken(body.token);
  if (!result) {
    return NextResponse.json({ error: "This subscription link is unavailable." }, { status: 404 });
  }

  const requested = Array.isArray(body.topics) ? body.topics : [];
  const topics = [...new Set(requested.filter(
    (topic): topic is string => typeof topic === "string" && allowedTopics.has(topic),
  ))];
  const now = Date.now();
  const status = topics.length ? "verified" : "unsubscribed";
  const database = getD1();
  await database
    .prepare(`
      UPDATE subscribers
      SET topics = ?, status = ?, unsubscribed_at = ?, updated_at = ?
      WHERE public_id = ?
    `)
    .bind(JSON.stringify(topics), status, topics.length ? null : now, now, result.publicId)
    .run();

  return NextResponse.json({ ok: true, status, topics });
}
