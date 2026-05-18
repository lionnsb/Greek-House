import { NextResponse } from "next/server";
import { addDays, format, parseISO } from "date-fns";
import { reservationBlocksUntil } from "@/lib/bookingRules";
import { dateKeysBetween } from "@/lib/date";
import { buildSeasonsFromEnv } from "@/lib/seasonPricing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [{ adminDb }, { cleanupExpiredHolds }] = await Promise.all([
      import("@/lib/firebaseAdmin"),
      import("@/lib/cleanupHolds")
    ]);

    await cleanupExpiredHolds();
    const blocksSnap = await adminDb.collection("availability_blocks").get();
    const reservationsSnap = await adminDb
      .collection("reservations")
      .where("status", "in", ["HOLD", "ACCEPTED_AWAITING_PAYMENT", "CONFIRMED"])
      .get();
    const seasonsSnap = await adminDb.collection("pricing_seasons").get();
    const seasons = seasonsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        name: data.name,
        start: data.start_date,
        end: data.end_date,
        pricePerNight: data.price_per_night,
        studioSurchargePerNight: data.studio_surcharge_per_night,
        minNights: data.min_nights ?? 1
      };
    });

    const dayStatus: Record<string, "BLOCKED" | "HOLD" | "CONFIRMED"> = {};
    const now = new Date().toISOString();
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const seasonList = seasons.length ? seasons : buildSeasonsFromEnv();

    function applyStatus(key: string, status: "BLOCKED" | "HOLD" | "CONFIRMED") {
      const current = dayStatus[key];
      if (current === "CONFIRMED") return;
      if (current === "BLOCKED" && status !== "CONFIRMED") return;
      dayStatus[key] = status;
    }

    blocksSnap.forEach((doc) => {
      const data = doc.data();
      if (data.end_date && data.end_date < todayKey) {
        return;
      }
      const blockEndExclusive = format(addDays(parseISO(data.end_date), 1), "yyyy-MM-dd");
      const keys = dateKeysBetween(data.start_date, blockEndExclusive);
      keys.forEach((key) => {
        applyStatus(key, "BLOCKED");
      });
    });

    reservationsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === "HOLD" && data.hold_until && data.hold_until < now) {
        return;
      }
      const blockedUntil = reservationBlocksUntil(data.end_date);
      const keys = dateKeysBetween(data.start_date, blockedUntil);
      keys.forEach((key) => {
        if (data.status === "CONFIRMED") applyStatus(key, "CONFIRMED");
        if (data.status === "HOLD") applyStatus(key, "HOLD");
        if (data.status === "ACCEPTED_AWAITING_PAYMENT") {
          applyStatus(key, "HOLD");
        }
      });
    });

    return NextResponse.json({ dayStatus, seasons: seasonList });
  } catch (error) {
    console.error("GET /api/public/availability failed", error);
    return NextResponse.json({ dayStatus: {}, seasons: buildSeasonsFromEnv() });
  }
}
