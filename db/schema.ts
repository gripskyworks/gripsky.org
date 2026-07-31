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
  },
  (table) => [uniqueIndex("subscribers_email_unique").on(table.email)],
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
