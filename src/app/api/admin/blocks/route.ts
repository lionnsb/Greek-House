import { NextResponse } from "next/server";
import { format } from "date-fns";
import { reservationBlocksUntil } from "@/lib/bookingRules";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  const includeExpired =
    new URL(request.url).searchParams.get("includeExpired") === "1";
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const snap = await adminDb.collection("availability_blocks").get();
  const items = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      startDate: data.start_date,
      endDate: data.end_date,
      reason: data.reason ?? null,
      createdAt: data.created_at
    };
  })
  .filter((item) => includeExpired || item.endDate >= todayKey)
  .sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  const payload = await request.json();
  const startDate = payload.startDate as string | undefined;
  const endDate = payload.endDate as string | undefined;
  const reason = payload.reason as string | undefined;

  if (!startDate || !endDate || startDate >= endDate) {
    return NextResponse.json(
      { message: "Ungültiger Zeitraum." },
      { status: 400 }
    );
  }

  const reservationsSnap = await adminDb
    .collection("reservations")
    .where("status", "==", "CONFIRMED")
    .get();

  const hasConfirmedConflict = reservationsSnap.docs.some((doc) => {
    const data = doc.data();
    return overlaps(startDate, endDate, data.start_date, reservationBlocksUntil(data.end_date));
  });

  if (hasConfirmedConflict) {
    return NextResponse.json(
      { message: "Sperre überschneidet eine bestätigte Buchung." },
      { status: 409 }
    );
  }

  const blocksSnap = await adminDb.collection("availability_blocks").get();
  const todayKeyForCreate = format(new Date(), "yyyy-MM-dd");
  const hasBlockConflict = blocksSnap.docs.some((doc) => {
    const data = doc.data();
    if (data.end_date && data.end_date < todayKeyForCreate) {
      return false;
    }
    return overlaps(startDate, endDate, data.start_date, data.end_date);
  });

  if (hasBlockConflict) {
    return NextResponse.json(
      { message: "Es gibt bereits eine Sperre in diesem Zeitraum." },
      { status: 409 }
    );
  }

  const docRef = await adminDb.collection("availability_blocks").add({
    start_date: startDate,
    end_date: endDate,
    reason: reason ?? null,
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ id: docRef.id });
}
