import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb
    .collection("reservations")
    .where("status", "==", "CONFIRMED")
    .get();

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
        createdAt: data.created_at
      };
    })
    .sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

  return NextResponse.json({ items });
}
