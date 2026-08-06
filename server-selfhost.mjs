import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { startProdServer } from "vinext/server/prod-server";

const root = dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.GRIPSKY_DB_PATH ?? join(root, "data", "gripsky.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });

const sqlite = new DatabaseSync(databasePath);
sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA foreign_keys = ON");
sqlite.exec("PRAGMA busy_timeout = 5000");

class D1StatementAdapter {
  constructor(database, query, values = []) {
    this.database = database;
    this.query = query;
    this.values = values;
  }

  bind(...values) {
    return new D1StatementAdapter(this.database, this.query, values);
  }

  async first() {
    return this.database.prepare(this.query).get(...this.values) ?? null;
  }

  async run() {
    this.database.prepare(this.query).run(...this.values);
    return { success: true };
  }

  async all() {
    return {
      results: this.database.prepare(this.query).all(...this.values),
      success: true,
    };
  }
}

class D1DatabaseAdapter {
  constructor(database) {
    this.database = database;
  }

  prepare(query) {
    return new D1StatementAdapter(this.database, query);
  }

  async batch(statements) {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      const results = [];
      for (const statement of statements) {
        await statement.run();
        results.push({ success: true });
      }
      this.database.exec("COMMIT");
      return results;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}

globalThis.__GRIPSKY_ENV__ = {
  DB: new D1DatabaseAdapter(sqlite),
  AWS_SES_REGION: process.env.AWS_SES_REGION,
  AWS_SES_ACCESS_KEY_ID: process.env.AWS_SES_ACCESS_KEY_ID,
  AWS_SES_SECRET_ACCESS_KEY: process.env.AWS_SES_SECRET_ACCESS_KEY,
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
  SERVICE_INBOX_EMAIL: process.env.SERVICE_INBOX_EMAIL,
  SUBSCRIPTION_CODE_PEPPER: process.env.SUBSCRIPTION_CODE_PEPPER,
  LOCAL_EMAIL_PREVIEW: process.env.LOCAL_EMAIL_PREVIEW,
  UPDATE_PUBLISH_TOKEN: process.env.UPDATE_PUBLISH_TOKEN,
};

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

await startProdServer({
  port,
  host,
  outDir: join(root, "dist"),
});
