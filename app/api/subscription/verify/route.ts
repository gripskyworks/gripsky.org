import { NextResponse } from "next/server";
import {
  createSubscriberPublicId,
  createSubscriberToken,
  ensureSchema,
  getD1,
  hashVerificationCode,
  normalizeEmail,
  localPreviewEnabled,
} from "@/app/lib/server";

type PendingCode = {
  id: number;
  code_hash: string;
  locale: string;
  topics: string;
  expires_at: number;
  attempts: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit code from the email." }, { status: 400 });
    }

    const database = getD1();
    await ensureSchema(database);
    const pending = await database
      .prepare(`
        SELECT id, code_hash, locale, topics, expires_at, attempts
        FROM subscription_codes
        WHERE email = ? AND consumed_at IS NULL
        ORDER BY requested_at DESC
        LIMIT 1
      `)
      .bind(email)
      .first<PendingCode>();

    const now = Date.now();
    if (!pending || pending.expires_at < now || pending.attempts >= 5) {
      return NextResponse.json(
        { error: "The code is unavailable or expired. Request a new one." },
        { status: 400 },
      );
    }

    const codeHash = await hashVerificationCode(email, code);
    if (codeHash !== pending.code_hash) {
      await database
        .prepare("UPDATE subscription_codes SET attempts = attempts + 1 WHERE id = ?")
        .bind(pending.id)
        .run();
      return NextResponse.json({ error: "The code is incorrect." }, { status: 400 });
    }

    const publicId = createSubscriberPublicId();
    await database.batch([
      database
        .prepare("UPDATE subscription_codes SET consumed_at = ? WHERE id = ?")
        .bind(now, pending.id),
      database
        .prepare(`
          INSERT INTO subscribers
            (email, locale, topics, status, created_at, verified_at, updated_at, public_id, unsubscribed_at, suppression_reason)
          VALUES (?, ?, ?, 'verified', ?, ?, ?, ?, NULL, NULL)
          ON CONFLICT(email) DO UPDATE SET
            locale = excluded.locale,
            topics = excluded.topics,
            status = 'verified',
            verified_at = excluded.verified_at,
            updated_at = excluded.updated_at,
            public_id = COALESCE(subscribers.public_id, excluded.public_id),
            unsubscribed_at = NULL,
            suppression_reason = NULL
        `)
        .bind(email, pending.locale, pending.topics, now, now, now, publicId),
    ]);

    if (localPreviewEnabled()) {
      const verified = await database
        .prepare("SELECT public_id FROM subscribers WHERE email = ? LIMIT 1")
        .bind(email)
        .first<{ public_id: string | null }>();
      return NextResponse.json({
        ok: true,
        ...(verified?.public_id
          ? { previewManageToken: await createSubscriberToken(verified.public_id) }
          : {}),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("subscription verify failed", error);
    return NextResponse.json({ error: "Subscription verification failed." }, { status: 500 });
  }
}
