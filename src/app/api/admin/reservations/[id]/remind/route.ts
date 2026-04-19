import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendPaymentReminderEmail } from "@/lib/mailer";

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const docRef = adminDb.collection("reservations").doc(context.params.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const data = doc.data();
  if (data?.status !== "ACCEPTED_AWAITING_PAYMENT") {
    return NextResponse.json(
      { message: "Nur akzeptierte Buchungen können erinnert werden." },
      { status: 400 }
    );
  }

  if (!data?.payment_due_until) {
    return NextResponse.json(
      { message: "Keine Zahlungsfrist gesetzt." },
      { status: 400 }
    );
  }

  try {
    await sendPaymentReminderEmail({
      to: data?.email,
      name: data?.name,
      startDate: data?.start_date,
      endDate: data?.end_date,
      paymentDue: data?.payment_due_until,
      reservationId: docRef.id,
      includesStudio: data?.includes_studio ?? false,
      language: data?.language ?? "de"
    });
  } catch (error) {
    console.error("E-Mail konnte nicht gesendet werden", error);
    return NextResponse.json({ message: "E-Mail Fehler" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
