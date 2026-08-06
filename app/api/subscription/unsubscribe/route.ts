import {
  ensureSchema,
  getD1,
  SUBSCRIPTION_TOPICS,
  verifySubscriberToken,
} from "@/app/lib/server";

type Subscriber = {
  topics: string;
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

export async function POST(request: Request) {
  const url = new URL(request.url);
  const publicId = await verifySubscriberToken(url.searchParams.get("token"));
  if (!publicId) return new Response("Subscription link unavailable.", { status: 404 });

  const requestedTopic = url.searchParams.get("topic");
  const topic = requestedTopic && allowedTopics.has(requestedTopic)
    ? requestedTopic
    : null;
  const database = getD1();
  await ensureSchema(database);
  const subscriber = await database
    .prepare("SELECT topics FROM subscribers WHERE public_id = ? LIMIT 1")
    .bind(publicId)
    .first<Subscriber>();
  if (!subscriber) return new Response("Subscription link unavailable.", { status: 404 });

  const topics = topic ? parseTopics(subscriber.topics).filter((item) => item !== topic) : [];
  const now = Date.now();
  await database
    .prepare(`
      UPDATE subscribers
      SET topics = ?, status = ?, unsubscribed_at = ?, updated_at = ?
      WHERE public_id = ?
    `)
    .bind(
      JSON.stringify(topics),
      topics.length ? "verified" : "unsubscribed",
      topics.length ? null : now,
      now,
      publicId,
    )
    .run();

  return new Response("Unsubscribed", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
