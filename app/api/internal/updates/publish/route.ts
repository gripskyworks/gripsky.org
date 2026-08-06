import { NextResponse } from "next/server";
import { authorizeUpdateRequest, getD1 } from "@/app/lib/server";
import { normalizePublication, publishUpdate } from "@/app/lib/update-mailer";

export async function POST(request: Request) {
  if (!await authorizeUpdateRequest(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const publication = normalizePublication(await request.json());
  if (!publication) {
    return NextResponse.json({ error: "The publication payload is invalid." }, { status: 400 });
  }
  try {
    return NextResponse.json({ ok: true, ...await publishUpdate(getD1(), publication) });
  } catch (error) {
    console.error("update publication failed", error);
    return NextResponse.json({ error: "The update was not published." }, { status: 500 });
  }
}
