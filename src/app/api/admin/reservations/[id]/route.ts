import { NextResponse } from "next/server";
import {
  isGuestCountValid,
  MAX_GUESTS,
  normalizeStudioSelection
} from "@/lib/bookingRules";
import { resolveBankAccount } from "@/lib/bankAccount";
import { isCountryCode } from "@/lib/countries";
import { adminDb } from "@/lib/firebaseAdmin";
import { loadHouseRulesAttachment } from "@/lib/houseRulesAttachment";
import { requireAdmin } from "@/lib/adminAuth";
import { sendAcceptedEmail, sendConfirmedEmail, sendRejectedEmail } from "@/lib/mailer";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
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

  const nextGuestsRaw = payload.guests ?? data?.guests;
  const nextGuests = Number(nextGuestsRaw);
  const storedCountryCode = isCountryCode(data?.country_code) ? data.country_code : null;
  const nextCountryCodeInput =
    payload.countryCode === undefined ? storedCountryCode : payload.countryCode;

  if (nextCountryCodeInput !== null && nextCountryCodeInput !== undefined && !isCountryCode(nextCountryCodeInput)) {
    return NextResponse.json(
      { message: "Ungültiges Land." },
      { status: 400 }
    );
  }
  if (!isGuestCountValid(nextGuests)) {
    return NextResponse.json(
      { message: `Ungültige Gästeanzahl. Erlaubt sind 1-${MAX_GUESTS} Gäste.` },
      { status: 400 }
    );
  }
  const nextCountryCode = nextCountryCodeInput ?? null;
  const nextIncludesStudio = normalizeStudioSelection(
    nextGuests,
    Boolean(payload.includesStudio ?? data?.includes_studio ?? false)
  );
  const nextStartDate = payload.startDate ?? data?.start_date;
  const nextEndDate = payload.endDate ?? data?.end_date;
  const nextMessage = payload.message ?? data?.message ?? null;
  const nextStatusValue = nextStatus ?? data?.status;
  const nextPriceTotal = payload.priceTotal ?? data?.price_total ?? null;
  const nextDepositAmount = payload.depositAmount ?? data?.deposit_amount ?? null;
  const nextPaymentDueUntil = payload.paymentDueUntil ?? data?.payment_due_until ?? null;
  const nextHoldUntil = payload.holdUntil ?? data?.hold_until ?? null;

  let acceptedBankAccount: ReturnType<typeof resolveBankAccount> | null = null;
  if (payload.status === "ACCEPTED_AWAITING_PAYMENT") {
    try {
      acceptedBankAccount = resolveBankAccount(nextCountryCode);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Bankverbindung ist unvollständig.";
      return NextResponse.json({ message }, { status: 500 });
    }
  }

  await docRef.update({
    status: nextStatusValue,
    price_total: nextPriceTotal,
    deposit_amount: nextDepositAmount,
    payment_due_until: nextPaymentDueUntil,
    hold_until: nextHoldUntil,
    start_date: nextStartDate,
    end_date: nextEndDate,
    guests: nextGuests,
    includes_studio: nextIncludesStudio,
    country_code: nextCountryCode,
    message: nextMessage
  });

  try {
    if (payload.status === "ACCEPTED_AWAITING_PAYMENT") {
      await sendAcceptedEmail({
        to: data?.email,
        name: data?.name,
        reservationId: docRef.id,
        priceTotal: nextPriceTotal ?? 0,
        depositAmount: nextDepositAmount,
        paymentDue: nextPaymentDueUntil,
        iban: acceptedBankAccount!.iban,
        bic: acceptedBankAccount!.bic,
        owner: acceptedBankAccount!.owner,
        startDate: nextStartDate,
        endDate: nextEndDate,
        includesStudio: nextIncludesStudio,
        pricePerNight: Number(process.env.NEXT_PUBLIC_PRICE_PER_NIGHT ?? "0"),
        studioSurchargePerNight: Number(
          process.env.NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT ?? "0"
        ),
        language: data?.language ?? "de"
      });
    }

    if (payload.status === "CONFIRMED") {
      const houseRulesAttachment = await loadHouseRulesAttachment(new URL(request.url).origin);

      await sendConfirmedEmail({
        to: data?.email,
        name: data?.name,
        startDate: nextStartDate,
        endDate: nextEndDate,
        includesStudio: nextIncludesStudio,
        houseRulesAttachment,
        language: data?.language ?? "de"
      });
    }

    if (payload.status === "REJECTED") {
      await sendRejectedEmail({
        to: data?.email,
        name: data?.name,
        startDate: nextStartDate,
        endDate: nextEndDate,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  const docRef = adminDb.collection("reservations").doc(context.params.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
