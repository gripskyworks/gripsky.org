import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const subscriptionCodes = sqliteTable(
  "subscription_codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    locale: text("locale").notNull().default("zh"),
    topics: text("topics").notNull(),
    expiresAt: integer("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    requestedAt: integer("requested_at").notNull(),
    consumedAt: integer("consumed_at"),
  },
  (table) => [
    index("subscription_codes_email_idx").on(table.email),
    index("subscription_codes_requested_at_idx").on(table.requestedAt),
  ],
);

export const subscribers = sqliteTable(
  "subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    locale: text("locale").notNull().default("zh"),
    topics: text("topics").notNull(),
    status: text("status").notNull().default("verified"),
    createdAt: integer("created_at").notNull(),
    verifiedAt: integer("verified_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    publicId: text("public_id"),
    unsubscribedAt: integer("unsubscribed_at"),
    suppressionReason: text("suppression_reason"),
  },
  (table) => [
    uniqueIndex("subscribers_email_unique").on(table.email),
    uniqueIndex("subscribers_public_id_unique").on(table.publicId),
  ],
);

export const updatePublications = sqliteTable(
  "update_publications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    topic: text("topic").notNull(),
    titleEn: text("title_en").notNull(),
    titleZh: text("title_zh").notNull(),
    summaryEn: text("summary_en").notNull(),
    summaryZh: text("summary_zh").notNull(),
    url: text("url").notNull(),
    publishedAt: integer("published_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [uniqueIndex("update_publications_slug_unique").on(table.slug)],
);

export const updateDeliveries = sqliteTable(
  "update_deliveries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    publicationId: integer("publication_id").notNull().references(() => updatePublications.id),
    subscriberId: integer("subscriber_id").notNull().references(() => subscribers.id),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    nextAttemptAt: integer("next_attempt_at").notNull(),
    claimToken: text("claim_token"),
    providerMessageId: text("provider_message_id"),
    lastError: text("last_error"),
    createdAt: integer("created_at").notNull(),
    sentAt: integer("sent_at"),
  },
  (table) => [
    uniqueIndex("update_deliveries_publication_subscriber_unique").on(
      table.publicationId,
      table.subscriberId,
    ),
    index("update_deliveries_status_next_attempt_idx").on(table.status, table.nextAttemptAt),
  ],
);

export const emailRateEvents = sqliteTable(
  "email_rate_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    scope: text("scope").notNull(),
    subjectHash: text("subject_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    claimId: text("claim_id"),
  },
  (table) => [
    index("email_rate_events_scope_subject_created_at_idx").on(
      table.scope,
      table.subjectHash,
      table.createdAt,
    ),
    index("email_rate_events_claim_id_idx").on(table.claimId),
  ],
);

export const contactRequests = sqliteTable(
  "contact_requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    kind: text("kind").notNull(),
    brief: text("brief").notNull(),
    locale: text("locale").notNull().default("zh"),
    status: text("status").notNull().default("recorded"),
    createdAt: integer("created_at").notNull(),
    forwardedAt: integer("forwarded_at"),
  },
  (table) => [index("contact_requests_created_at_idx").on(table.createdAt)],
);
