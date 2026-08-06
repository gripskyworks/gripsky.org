import {
  createSubscriberToken,
  D1DatabaseLike,
  ensureSchema,
  sendUpdateEmail,
  SUBSCRIPTION_TOPICS,
  SubscriptionTopic,
} from "./server";

const MAX_UPDATE_EMAILS_PER_DAY = 500;
const DEFAULT_BATCH_SIZE = 10;

export type PublicationInput = {
  slug: string;
  topic: SubscriptionTopic;
  titleEn: string;
  titleZh: string;
  summaryEn: string;
  summaryZh: string;
  url: string;
  publishedAt: number;
};

type SubscriberRow = {
  id: number;
  topics: string;
};

type DeliveryRow = {
  id: number;
  attempts: number;
  email: string;
  locale: "zh" | "en";
  subscriber_status: string;
  public_id: string | null;
  topics: string;
  topic: SubscriptionTopic;
  title_en: string;
  title_zh: string;
  summary_en: string;
  summary_zh: string;
  url: string;
};

function plainText(value: unknown, maximum: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export function normalizePublication(value: unknown): PublicationInput | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const slug = plainText(body.slug, 80).toLowerCase();
  const topic = plainText(body.topic, 40);
  const titleEn = plainText(body.titleEn, 180);
  const titleZh = plainText(body.titleZh, 180);
  const summaryEn = plainText(body.summaryEn, 2_000);
  const summaryZh = plainText(body.summaryZh, 2_000);
  const urlValue = plainText(body.url, 500);
  const publishedAt = typeof body.publishedAt === "number"
    ? Math.floor(body.publishedAt)
    : Date.parse(plainText(body.publishedAt, 80));

  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    return null;
  }
  if (
    !/^[a-z0-9][a-z0-9-]{2,79}$/.test(slug) ||
    !SUBSCRIPTION_TOPICS.includes(topic as SubscriptionTopic) ||
    !titleEn || !titleZh || !summaryEn || !summaryZh ||
    url.protocol !== "https:" || !Number.isFinite(publishedAt)
  ) return null;

  return {
    slug,
    topic: topic as SubscriptionTopic,
    titleEn,
    titleZh,
    summaryEn,
    summaryZh,
    url: url.toString(),
    publishedAt,
  };
}

function selectedTopics(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((topic) => typeof topic === "string") : [];
  } catch {
    return [];
  }
}

export async function publishUpdate(database: D1DatabaseLike, input: PublicationInput) {
  await ensureSchema(database);
  const now = Date.now();
  const existing = await database
    .prepare("SELECT id FROM update_publications WHERE slug = ? LIMIT 1")
    .bind(input.slug)
    .first<{ id: number }>();
  if (existing) {
    return { publicationId: existing.id, created: false, eligibleSubscribers: 0 };
  }
  await database.prepare(`
    INSERT INTO update_publications
      (slug, topic, title_en, title_zh, summary_en, summary_zh, url, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO NOTHING
  `).bind(
    input.slug,
    input.topic,
    input.titleEn,
    input.titleZh,
    input.summaryEn,
    input.summaryZh,
    input.url,
    input.publishedAt,
    now,
  ).run();

  const publication = await database
    .prepare("SELECT id FROM update_publications WHERE slug = ? LIMIT 1")
    .bind(input.slug)
    .first<{ id: number }>();
  if (!publication) throw new Error("Publication was not stored.");

  const subscribersResult = await database
    .prepare("SELECT id, topics FROM subscribers WHERE status = 'verified' AND public_id IS NOT NULL")
    .all<SubscriberRow>();
  const subscribers = (subscribersResult.results ?? []).filter((subscriber) => (
    selectedTopics(subscriber.topics).includes(input.topic)
  ));

  for (let offset = 0; offset < subscribers.length; offset += 100) {
    await database.batch(subscribers.slice(offset, offset + 100).map((subscriber) => database.prepare(`
      INSERT INTO update_deliveries
        (publication_id, subscriber_id, status, attempts, next_attempt_at, created_at)
      VALUES (?, ?, 'pending', 0, ?, ?)
      ON CONFLICT(publication_id, subscriber_id) DO NOTHING
    `).bind(publication.id, subscriber.id, now, now)));
  }

  return {
    publicationId: publication.id,
    created: true,
    eligibleSubscribers: subscribers.length,
  };
}

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[\r\n]+/g, " ").slice(0, 300);
}

export async function processUpdateDeliveries(
  database: D1DatabaseLike,
  requestedLimit = DEFAULT_BATCH_SIZE,
) {
  await ensureSchema(database);
  const now = Date.now();
  await database.batch([
    database.prepare("DELETE FROM subscription_codes WHERE expires_at < ? OR (consumed_at IS NOT NULL AND requested_at < ?)")
      .bind(now, now - 24 * 60 * 60_000),
    database.prepare("DELETE FROM email_rate_events WHERE created_at < ?")
      .bind(now - 31 * 24 * 60 * 60_000),
    database.prepare(`
      UPDATE update_deliveries
      SET status = 'retry', claim_token = NULL
      WHERE status = 'sending' AND next_attempt_at <= ?
    `).bind(now),
  ]);
  const sentToday = await database
    .prepare("SELECT COUNT(*) AS count FROM update_deliveries WHERE sent_at >= ?")
    .bind(now - 24 * 60 * 60_000)
    .first<{ count: number }>();
  const remainingDaily = Math.max(0, MAX_UPDATE_EMAILS_PER_DAY - (sentToday?.count ?? 0));
  const limit = Math.min(Math.max(1, requestedLimit), DEFAULT_BATCH_SIZE, remainingDaily);
  if (!limit) return { processed: 0, sent: 0, skipped: 0, retrying: 0, failed: 0, dailyLimitReached: true };

  const result = await database.prepare(`
    SELECT
      d.id, d.attempts,
      s.email, s.locale, s.status AS subscriber_status, s.public_id, s.topics,
      p.topic, p.title_en, p.title_zh, p.summary_en, p.summary_zh, p.url
    FROM update_deliveries d
    JOIN subscribers s ON s.id = d.subscriber_id
    JOIN update_publications p ON p.id = d.publication_id
    WHERE d.status IN ('pending', 'retry') AND d.next_attempt_at <= ? AND d.attempts < 5
    ORDER BY d.id
    LIMIT ?
  `).bind(now, limit).all<DeliveryRow>();
  const deliveries = result.results ?? [];
  const counts = { processed: 0, sent: 0, skipped: 0, retrying: 0, failed: 0, dailyLimitReached: false };

  for (const delivery of deliveries) {
    counts.processed += 1;
    if (
      delivery.subscriber_status !== "verified" ||
      !delivery.public_id ||
      !selectedTopics(delivery.topics).includes(delivery.topic)
    ) {
      await database.prepare("UPDATE update_deliveries SET status = 'skipped', last_error = 'subscriber not eligible' WHERE id = ?")
        .bind(delivery.id).run();
      counts.skipped += 1;
      continue;
    }

    const claimToken = crypto.randomUUID();
    await database.prepare(`
      UPDATE update_deliveries
      SET status = 'sending', claim_token = ?, attempts = attempts + 1, next_attempt_at = ?
      WHERE id = ? AND status IN ('pending', 'retry')
    `).bind(claimToken, Date.now() + 10 * 60_000, delivery.id).run();
    const claim = await database.prepare("SELECT claim_token FROM update_deliveries WHERE id = ?")
      .bind(delivery.id).first<{ claim_token: string | null }>();
    if (claim?.claim_token !== claimToken) continue;

    try {
      const subscriberToken = await createSubscriberToken(delivery.public_id);
      const response = await sendUpdateEmail({
        email: delivery.email,
        locale: delivery.locale === "en" ? "en" : "zh",
        topic: delivery.topic,
        title: delivery.locale === "en" ? delivery.title_en : delivery.title_zh,
        summary: delivery.locale === "en" ? delivery.summary_en : delivery.summary_zh,
        url: delivery.url,
        subscriberToken,
      });
      await database.prepare(`
        UPDATE update_deliveries
        SET status = 'sent', provider_message_id = ?, sent_at = ?, claim_token = NULL, last_error = NULL
        WHERE id = ? AND claim_token = ?
      `).bind(response.messageId, Date.now(), delivery.id, claimToken).run();
      counts.sent += 1;
    } catch (error) {
      const attempts = delivery.attempts + 1;
      const failed = attempts >= 5;
      const retryAt = Date.now() + Math.min(6 * 60 * 60_000, 60_000 * (2 ** attempts));
      await database.prepare(`
        UPDATE update_deliveries
        SET status = ?, next_attempt_at = ?, claim_token = NULL, last_error = ?
        WHERE id = ? AND claim_token = ?
      `).bind(failed ? "failed" : "retry", retryAt, safeError(error), delivery.id, claimToken).run();
      if (failed) counts.failed += 1;
      else counts.retrying += 1;
    }
  }

  return counts;
}
