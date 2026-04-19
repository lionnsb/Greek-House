import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb.collection("pricing_seasons").get();
  const items = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
      pricePerNight: data.price_per_night,
      studioSurchargePerNight: data.studio_surcharge_per_night,
      minNights: data.min_nights ?? 1,
      createdAt: data.created_at
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const startDate = payload.startDate as string | undefined;
  const endDate = payload.endDate as string | undefined;
  const name = payload.name as string | undefined;
  const pricePerNight = Number(payload.pricePerNight ?? 0);
  const studioSurchargePerNight = Number(payload.studioSurchargePerNight ?? 0);
  const minNights = Number(payload.minNights ?? 1);

  if (!name || !startDate || !endDate || startDate >= endDate) {
    return NextResponse.json(
      { message: "Ungültige Saison-Daten." },
      { status: 400 }
    );
  }

  const snap = await adminDb.collection("pricing_seasons").get();
  const conflict = snap.docs.some((doc) => {
    const data = doc.data();
    return overlaps(startDate, endDate, data.start_date, data.end_date);
  });

  if (conflict) {
    return NextResponse.json(
      { message: "Saison überschneidet eine bestehende Saison." },
      { status: 409 }
    );
  }

  const docRef = await adminDb.collection("pricing_seasons").add({
    name,
    start_date: startDate,
    end_date: endDate,
    price_per_night: pricePerNight,
    studio_surcharge_per_night: studioSurchargePerNight,
    min_nights: minNights,
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ id: docRef.id });
}
