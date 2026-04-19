import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { cleanupExpiredHolds } from "@/lib/cleanupHolds";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await cleanupExpiredHolds();
  const snap = await adminDb.collection("reservations").get();
  const items = snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        name: data.name,
        email: data.email,
        phone: data.phone,
        guests: data.guests,
        message: data.message,
        includesStudio: data.includes_studio,
        holdUntil: data.hold_until,
        priceTotal: data.price_total ?? null,
        depositAmount: data.deposit_amount ?? null,
        paymentDueUntil: data.payment_due_until ?? null,
        language: data.language ?? "de",
        createdAt: data.created_at
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ items });
}
