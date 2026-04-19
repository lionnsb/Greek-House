import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { dateKeysBetween } from "@/lib/date";
import { buildSeasonsFromEnv, seasonForDate } from "@/lib/seasonPricing";
import { cleanupExpiredHolds } from "@/lib/cleanupHolds";

export async function GET() {
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
  const seasonList = seasons.length ? seasons : buildSeasonsFromEnv();

  function applyStatus(key: string, status: "BLOCKED" | "HOLD" | "CONFIRMED") {
    const current = dayStatus[key];
    if (current === "CONFIRMED") return;
    if (current === "BLOCKED" && status !== "CONFIRMED") return;
    dayStatus[key] = status;
  }

  blocksSnap.forEach((doc) => {
    const data = doc.data();
    const keys = dateKeysBetween(data.start_date, data.end_date);
    keys.forEach((key) => {
      applyStatus(key, "BLOCKED");
    });
  });

  reservationsSnap.forEach((doc) => {
    const data = doc.data();
    if (data.status === "HOLD" && data.hold_until && data.hold_until < now) {
      return;
    }
    const keys = dateKeysBetween(data.start_date, data.end_date);
    keys.forEach((key) => {
      if (data.status === "CONFIRMED") applyStatus(key, "CONFIRMED");
      if (data.status === "HOLD") applyStatus(key, "HOLD");
      if (data.status === "ACCEPTED_AWAITING_PAYMENT") {
        applyStatus(key, "HOLD");
      }
    });
  });

  return NextResponse.json({ dayStatus, seasons: seasonList });
}
