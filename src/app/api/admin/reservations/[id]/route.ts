import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendAcceptedEmail, sendConfirmedEmail, sendRejectedEmail } from "@/lib/mailer";

export async function PATCH(request: Request, context: { params: { id: string } }) {
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

  const payload = await request.json();
  const nextStatus = payload.status as string | undefined;
  const data = doc.data();
  const currentStatus = data?.status as string | undefined;

  if (currentStatus === "CONFIRMED" && nextStatus) {
    return NextResponse.json(
      { message: "Status ist final und kann nicht geändert werden." },
      { status: 400 }
    );
  }
  if (currentStatus === "REJECTED" && nextStatus && nextStatus !== "HOLD") {
    return NextResponse.json(
      { message: "Status ist final und kann nicht geändert werden." },
      { status: 400 }
    );
  }

  if (nextStatus === "ACCEPTED_AWAITING_PAYMENT") {
    if (currentStatus && currentStatus !== "HOLD") {
      return NextResponse.json(
        { message: "Nur HOLD kann angenommen werden." },
        { status: 400 }
      );
    }
    if (typeof payload.priceTotal !== "number" || payload.priceTotal <= 0) {
      return NextResponse.json(
        { message: "Gesamtpreis erforderlich." },
        { status: 400 }
      );
    }
    if (!payload.paymentDueUntil) {
      return NextResponse.json(
        { message: "Zahlungsfrist erforderlich." },
        { status: 400 }
      );
    }
  }
  if (nextStatus === "CONFIRMED") {
    if (currentStatus && currentStatus !== "ACCEPTED_AWAITING_PAYMENT") {
      return NextResponse.json(
        { message: "Nur akzeptierte Anfragen können bestätigt werden." },
        { status: 400 }
      );
    }
  }
  if (nextStatus === "HOLD") {
    if (currentStatus !== "REJECTED") {
      return NextResponse.json(
        { message: "Reaktivierung nur aus REJECTED möglich." },
        { status: 400 }
      );
    }
    const createdAt = data?.created_at;
    if (!createdAt) {
      return NextResponse.json(
        { message: "Reaktivierung nicht möglich (fehlendes Datum)." },
        { status: 400 }
      );
    }
    const limit = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString();
    if (limit < new Date().toISOString()) {
      return NextResponse.json(
        { message: "Reaktivierungsfenster (48h) abgelaufen." },
        { status: 400 }
      );
    }
  }

  await docRef.update({
    status: nextStatus ?? data?.status,
    price_total: payload.priceTotal ?? data?.price_total ?? null,
    deposit_amount: payload.depositAmount ?? data?.deposit_amount ?? null,
    payment_due_until: payload.paymentDueUntil ?? data?.payment_due_until ?? null,
    hold_until: payload.holdUntil ?? data?.hold_until ?? null,
    start_date: payload.startDate ?? data?.start_date,
    end_date: payload.endDate ?? data?.end_date,
    guests: payload.guests ?? data?.guests,
    includes_studio: payload.includesStudio ?? data?.includes_studio,
    message: payload.message ?? data?.message ?? null
  });

  try {
    if (payload.status === "ACCEPTED_AWAITING_PAYMENT") {
      await sendAcceptedEmail({
        to: data?.email,
        name: data?.name,
        reservationId: docRef.id,
        priceTotal: payload.priceTotal ?? 0,
        depositAmount: payload.depositAmount ?? null,
        paymentDue: payload.paymentDueUntil,
        iban: process.env.BANK_IBAN ?? "",
        bic: process.env.BANK_BIC ?? "",
        owner: process.env.BANK_OWNER ?? "",
        startDate: data?.start_date,
        endDate: data?.end_date,
        includesStudio: data?.includes_studio ?? false,
        pricePerNight: Number(process.env.NEXT_PUBLIC_PRICE_PER_NIGHT ?? "0"),
        studioSurchargePerNight: Number(
          process.env.NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT ?? "0"
        ),
        language: data?.language ?? "de"
      });
    }

    if (payload.status === "CONFIRMED") {
      await sendConfirmedEmail({
        to: data?.email,
        name: data?.name,
        startDate: data?.start_date,
        endDate: data?.end_date,
        includesStudio: data?.includes_studio,
        language: data?.language ?? "de"
      });
    }

    if (payload.status === "REJECTED") {
      await sendRejectedEmail({
        to: data?.email,
        name: data?.name,
        startDate: data?.start_date,
        endDate: data?.end_date,
        language: data?.language ?? "de"
      });
    }
  } catch (error) {
    console.error("E-Mail konnte nicht gesendet werden", error);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
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

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
