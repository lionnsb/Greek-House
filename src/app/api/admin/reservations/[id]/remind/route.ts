import { NextResponse } from "next/server";
import { resolveBankAccount } from "@/lib/bankAccount";
import { isCountryCode } from "@/lib/countries";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendPaymentReminderEmail } from "@/lib/mailer";

export async function POST(request: Request, context: { params: { id: string } }) {
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
    const bankAccount = resolveBankAccount(
      isCountryCode(data?.country_code) ? data.country_code : null
    );

    await sendPaymentReminderEmail({
      to: data?.email,
      name: data?.name,
      startDate: data?.start_date,
      endDate: data?.end_date,
      paymentDue: data?.payment_due_until,
      reservationId: docRef.id,
      includesStudio: data?.includes_studio ?? false,
      iban: bankAccount.iban,
      bic: bankAccount.bic,
      owner: bankAccount.owner,
      language: data?.language ?? "de"
    });
  } catch (error) {
    console.error("E-Mail konnte nicht gesendet werden", error);
    const message =
      error instanceof Error ? error.message : "E-Mail konnte nicht gesendet werden.";
    return NextResponse.json({ message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
