import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendAcceptedEmail } from "@/lib/mailer";

type AcceptPayload = {
  id?: string;
  priceTotal?: number;
  depositAmount?: number | null;
  paymentDueUntil?: string;
};

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as AcceptPayload;
  const reservationId = payload.id?.trim();

  if (!reservationId) {
    return NextResponse.json({ message: "Reservation ID fehlt." }, { status: 400 });
  }

  if (typeof payload.priceTotal !== "number" || payload.priceTotal <= 0) {
    return NextResponse.json({ message: "Gesamtpreis erforderlich." }, { status: 400 });
  }

  if (!payload.paymentDueUntil) {
    return NextResponse.json({ message: "Zahlungsfrist erforderlich." }, { status: 400 });
  }

  const docRef = adminDb.collection("reservations").doc(reservationId);
  const doc = await docRef.get();
  const data = doc.data();

  if (!doc.exists || !data) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (data.status !== "HOLD") {
    return NextResponse.json({ message: "Nur HOLD kann angenommen werden." }, { status: 400 });
  }

  await docRef.update({
    status: "ACCEPTED_AWAITING_PAYMENT",
    price_total: payload.priceTotal,
    deposit_amount: payload.depositAmount ?? null,
    payment_due_until: payload.paymentDueUntil
  });

  try {
    await sendAcceptedEmail({
      to: data.email,
      name: data.name,
      reservationId,
      priceTotal: payload.priceTotal,
      depositAmount: payload.depositAmount ?? null,
      paymentDue: payload.paymentDueUntil,
      iban: process.env.BANK_IBAN ?? "",
      bic: process.env.BANK_BIC ?? "",
      owner: process.env.BANK_OWNER ?? "",
      startDate: data.start_date,
      endDate: data.end_date,
      includesStudio: data.includes_studio ?? false,
      pricePerNight: Number(process.env.NEXT_PUBLIC_PRICE_PER_NIGHT ?? "0"),
      studioSurchargePerNight: Number(
        process.env.NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT ?? "0"
      ),
      language: data.language ?? "de"
    });
  } catch (error) {
    console.error("Accepted E-Mail konnte nicht gesendet werden", error);
  }

  return NextResponse.json({ ok: true });
}
