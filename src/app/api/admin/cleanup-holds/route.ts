import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
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
