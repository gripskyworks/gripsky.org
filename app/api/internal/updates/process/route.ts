import { NextResponse } from "next/server";
import { authorizeUpdateRequest, getD1 } from "@/app/lib/server";
import { processUpdateDeliveries } from "@/app/lib/update-mailer";

export async function POST(request: Request) {
  if (!await authorizeUpdateRequest(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    return NextResponse.json({ ok: true, ...await processUpdateDeliveries(getD1()) });
  } catch (error) {
    console.error("update processing failed", error);
    return NextResponse.json({ error: "Queued updates were not processed." }, { status: 500 });
  }
}
