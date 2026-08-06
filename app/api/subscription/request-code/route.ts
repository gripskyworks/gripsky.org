import { NextResponse } from "next/server";
import {
  createVerificationCode,
  claimEmailSendBudget,
  ensureSchema,
  getD1,
  hashVerificationCode,
  localPreviewEnabled,
  normalizeEmail,
  normalizeLocale,
  normalizeSubscriptionIntent,
  normalizeTopics,
  releaseEmailSendBudget,
  sendVerificationEmail,
} from "@/app/lib/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const database = getD1();
    await ensureSchema(database);
    const now = Date.now();
    const intent = normalizeSubscriptionIntent(body.intent);
    await database
      .prepare("DELETE FROM subscription_codes WHERE expires_at < ? OR (consumed_at IS NOT NULL AND requested_at < ?)")
      .bind(now, now - 24 * 60 * 60_000)
      .run();
    const latest = await database
      .prepare("SELECT requested_at FROM subscription_codes WHERE email = ? AND intent = ? ORDER BY requested_at DESC LIMIT 1")
      .bind(email, intent)
      .first<{ requested_at: number }>();

    if (latest && now - latest.requested_at < 60_000) {
      return NextResponse.json(
        { error: "A code was sent recently. Please wait one minute." },
        {
          status: 429,
          headers: { "retry-after": String(Math.ceil((60_000 - (now - latest.requested_at)) / 1_000)) },
        },
      );
    }

    const budget = await claimEmailSendBudget(database, request, "subscription-code", email);
    if (!budget.ok) {
      return NextResponse.json(
        { error: "Too many verification emails were requested. Please try again later." },
        { status: 429, headers: { "retry-after": String(budget.retryAfterSeconds) } },
      );
    }

    try {
      const code = createVerificationCode();
      const locale = normalizeLocale(body.locale);
      const topics = intent === "unsubscribe" ? [] : normalizeTopics(body.topics);
      const codeHash = await hashVerificationCode(email, code);

      await database
        .prepare(`
          INSERT INTO subscription_codes
            (email, code_hash, intent, locale, topics, expires_at, attempts, requested_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        `)
        .bind(email, codeHash, intent, locale, JSON.stringify(topics), now + 10 * 60_000, now)
        .run();

      const delivery = await sendVerificationEmail(email, code, locale, intent);
      return NextResponse.json({
        ok: true,
        delivery,
        ...(delivery === "preview" && localPreviewEnabled() ? { previewCode: code } : {}),
      });
    } catch (error) {
      await Promise.allSettled([
        database
          .prepare("DELETE FROM subscription_codes WHERE email = ? AND requested_at = ?")
          .bind(email, now)
          .run(),
        releaseEmailSendBudget(database, budget.claimId),
      ]);
      throw error;
    }
  } catch (error) {
    console.error("subscription request-code failed", error);
    return NextResponse.json(
      { error: "The verification email could not be sent." },
      { status: 500 },
    );
  }
}
