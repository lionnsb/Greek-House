import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function isAuthorized(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.replace("Bearer ", "");
  const queryToken = new URL(request.url).searchParams.get("token");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return token === secret || queryToken === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const snap = await adminDb
    .collection("reservations")
    .where("status", "==", "HOLD")
    .get();

  const expired = snap.docs.filter((doc) => {
    const data = doc.data();
    return data.hold_until && data.hold_until < now;
  });

  await Promise.all(
    expired.map((doc) => doc.ref.update({ status: "REJECTED" }))
  );

  return NextResponse.json({ updated: expired.length });
}
