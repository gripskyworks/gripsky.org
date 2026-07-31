import { NextResponse } from "next/server";
import {
  ensureSchema,
  forwardContactRequest,
  getD1,
  normalizeEmail,
  normalizeLocale,
} from "@/app/lib/server";

function field(value: unknown, maximum: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = field(body.name, 80);
    const email = normalizeEmail(body.email);
    const kind = field(body.kind, 80);
    const brief = field(body.brief, 4_000);
    const locale = normalizeLocale(body.locale);

    if (!name || !email || !kind || brief.length < 20) {
      return NextResponse.json(
        { error: "Complete every field and provide a brief of at least 20 characters." },
        { status: 400 },
      );
    }

    const database = getD1();
    await ensureSchema(database);
    const now = Date.now();
    await database
      .prepare(`
        INSERT INTO contact_requests (name, email, kind, brief, locale, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'recorded', ?)
      `)
      .bind(name, email, kind, brief, locale, now)
      .run();

    let forwarded = false;
    try {
      forwarded = await forwardContactRequest({ name, email, kind, brief, locale });
    } catch (error) {
      console.error("contact forwarding failed", error);
    }

    if (forwarded) {
      await database
        .prepare(`
          UPDATE contact_requests
          SET status = 'forwarded', forwarded_at = ?
          WHERE email = ? AND created_at = ?
        `)
        .bind(Date.now(), email, now)
        .run();
    }

    return NextResponse.json({ ok: true, recorded: true, forwarded }, { status: 201 });
  } catch (error) {
    console.error("contact request failed", error);
    return NextResponse.json({ error: "The request could not be recorded." }, { status: 500 });
  }
}
