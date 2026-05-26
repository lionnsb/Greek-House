import { addDays, addHours, format, parseISO } from "date-fns";
import { NextResponse } from "next/server";
import {
  hasShortNotice,
  isGuestCountValid,
  MAX_GUESTS,
  normalizeStudioSelection,
  reservationBlocksUntil
} from "@/lib/bookingRules";
import type { InquiryPayload } from "@/lib/types";
import { buildSeasonCatalog, calculateSeasonalTotal } from "@/lib/seasonPricing";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export async function POST(request: Request) {
  try {
    const [{ adminDb }, { cleanupExpiredHolds }] = await Promise.all([
      import("@/lib/firebaseAdmin"),
      import("@/lib/cleanupHolds")
    ]);

    await cleanupExpiredHolds();
    const payload = (await request.json()) as InquiryPayload;
    const guests = Number(payload.guests);

    if (!payload.acceptPrivacy) {
      return NextResponse.json({ message: "AGB müssen akzeptiert werden." }, { status: 400 });
    }
    if (!payload.acceptHouseRules) {
      return NextResponse.json(
        { message: "Hausregeln müssen akzeptiert werden." },
        { status: 400 }
      );
    }
    if (!isGuestCountValid(guests)) {
      return NextResponse.json(
        { message: `Ungültige Gästeanzahl. Erlaubt sind 1-${MAX_GUESTS} Gäste.` },
        { status: 400 }
      );
    }
    const includesStudio = normalizeStudioSelection(guests, Boolean(payload.includesStudio));
    const shortNotice = hasShortNotice(payload.startDate);
    const shortNoticeWarningDe =
      "Achtung: Wir können die Verfügbarkeit für Ihren gewünschten Termin aufgrund der kurzfristigen Anfrage nicht garantieren.";
    const shortNoticeWarningEn =
      "Attention: We cannot guarantee availability for this short-notice request.";
    const shortNoticeWarning =
      shortNotice
        ? (payload.language === "en" ? shortNoticeWarningEn : shortNoticeWarningDe)
        : "";
    const baseMessage = payload.message?.trim() ?? "";
    const enrichedMessage = shortNoticeWarning
      ? [baseMessage, shortNoticeWarning].filter(Boolean).join("\n")
      : baseMessage || null;

    const blocksSnap = await adminDb.collection("availability_blocks").get();
    const seasonsSnap = await adminDb.collection("pricing_seasons").get();
    const seasons = seasonsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        name: data.name,
        start: data.start_date,
        end: data.end_date,
        pricePerNight: data.price_per_night,
        studioSurchargePerNight: data.studio_surcharge_per_night,
        minNights: data.min_nights ?? 1,
        createdAt: data.created_at,
        source: "admin" as const
      };
    });
    const seasonList = buildSeasonCatalog(seasons);
    const reservationsSnap = await adminDb
      .collection("reservations")
      .where("status", "in", ["HOLD", "ACCEPTED_AWAITING_PAYMENT", "CONFIRMED"])
      .get();

    const todayKey = format(new Date(), "yyyy-MM-dd");
    const hasConflict = blocksSnap.docs.some((doc) => {
      const data = doc.data();
      if (data.end_date && data.end_date < todayKey) {
        return false;
      }
      const blockEndExclusive = format(addDays(parseISO(data.end_date), 1), "yyyy-MM-dd");
      return overlaps(payload.startDate, payload.endDate, data.start_date, blockEndExclusive);
    });

    const now = new Date().toISOString();
    const hasReservationConflict = reservationsSnap.docs.some((doc) => {
      const data = doc.data();
      if (data.status === "HOLD" && data.hold_until && data.hold_until < now) {
        return false;
      }
      const blockedUntil = reservationBlocksUntil(data.end_date);
      return overlaps(payload.startDate, payload.endDate, data.start_date, blockedUntil);
    });

    if (hasConflict || hasReservationConflict) {
      return NextResponse.json({ message: "Zeitraum nicht verfügbar." }, { status: 409 });
    }

    const seasonal = calculateSeasonalTotal({
      startDate: payload.startDate,
      endDate: payload.endDate,
      includesStudio,
      seasons: seasonList
    });
    const maxMinNights = seasonal.breakdown.reduce(
      (max, item) => Math.max(max, item.minNights ?? 1),
      1
    );
    if (seasonal.nights < maxMinNights) {
      return NextResponse.json(
        { message: `Mindestaufenthalt: ${maxMinNights} Nächte.` },
        { status: 400 }
      );
    }

    const holdUntil = addHours(new Date(), 48).toISOString();

    const docRef = await adminDb.collection("reservations").add({
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: "HOLD",
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      guests,
      message: enrichedMessage,
      includes_studio: includesStudio,
      short_notice: shortNotice,
      min_nights_applied: maxMinNights,
      language: payload.language ?? "de",
      hold_until: holdUntil,
      created_at: new Date().toISOString()
    });

    try {
      const { sendAdminNewInquiryEmail, sendInquiryReceivedEmail } =
        await import("@/lib/mailer");

      await sendInquiryReceivedEmail({
        to: payload.email,
        name: payload.name,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reservationId: docRef.id,
        includesStudio,
        shortNotice,
        language: payload.language ?? "de"
      });

      const adminTargets =
        process.env.ADMIN_NOTIFY_EMAILS ?? process.env.ADMIN_EMAILS ?? "";
      const recipients = adminTargets
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await Promise.all(
        recipients.map((recipient) =>
          sendAdminNewInquiryEmail({
            to: recipient,
            name: payload.name,
            email: payload.email,
            phone: payload.phone ?? null,
            guests,
            startDate: payload.startDate,
            endDate: payload.endDate,
            includesStudio,
            message: enrichedMessage,
            shortNotice,
            reservationId: docRef.id,
            language: payload.language ?? "de"
          })
        )
      );
    } catch (error) {
      console.error("E-Mail konnte nicht gesendet werden", error);
    }

    return NextResponse.json({
      id: docRef.id,
      holdUntil,
      shortNotice
    });
  } catch (error) {
    console.error("POST /api/public/hold failed", error);
    const message =
      error instanceof Error ? error.message : "Unbekannter Serverfehler";
    return NextResponse.json({ message }, { status: 500 });
  }
}
