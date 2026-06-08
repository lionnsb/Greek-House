import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";

function serializeSeason(
  id: string,
  data: {
    name?: string;
    start_date?: string | null;
    end_date?: string | null;
    price_per_night?: number;
    studio_surcharge_per_night?: number;
    min_nights?: number;
    created_at?: string;
  }
) {
  return {
    id,
    name: data.name ?? "",
    startDate: data.start_date ?? null,
    endDate: data.end_date ?? null,
    pricePerNight: data.price_per_night ?? 0,
    studioSurchargePerNight: data.studio_surcharge_per_night ?? 0,
    minNights: data.min_nights ?? 1,
    createdAt: data.created_at ?? new Date().toISOString()
  };
}

function validateSeasonPayload(payload: Record<string, unknown>) {
  const startDate = payload.startDate as string | undefined;
  const endDate = payload.endDate as string | undefined;
  const name = payload.name as string | undefined;
  const pricePerNight = Number(payload.pricePerNight ?? 0);
  const studioSurchargePerNight = Number(payload.studioSurchargePerNight ?? 0);
  const minNights = Number(payload.minNights ?? 1);
  const isStandard = name === "Standard";

  if (
    !name ||
    (!isStandard && (!startDate || !endDate || startDate > endDate)) ||
    !Number.isFinite(pricePerNight) ||
    pricePerNight < 0 ||
    !Number.isFinite(studioSurchargePerNight) ||
    studioSurchargePerNight < 0 ||
    !Number.isInteger(minNights) ||
    minNights < 1
  ) {
    return null;
  }

  return {
    name,
    startDate: isStandard ? null : startDate,
    endDate: isStandard ? null : endDate,
    pricePerNight,
    studioSurchargePerNight,
    minNights
  };
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  const docRef = adminDb.collection("pricing_seasons").doc(context.params.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const rawPayload = (await request.json()) as Record<string, unknown>;
  const payload = validateSeasonPayload(rawPayload);

  if (!payload) {
    return NextResponse.json(
      { message: "Ungültige Saison-Daten." },
      { status: 400 }
    );
  }

  const currentData = doc.data() ?? {};
  await docRef.update({
    name: payload.name,
    start_date: payload.startDate,
    end_date: payload.endDate,
    price_per_night: payload.pricePerNight,
    studio_surcharge_per_night: payload.studioSurchargePerNight,
    min_nights: payload.minNights
  });

  return NextResponse.json({
    ok: true,
    item: serializeSeason(docRef.id, {
      ...currentData,
      name: payload.name,
      start_date: payload.startDate,
      end_date: payload.endDate,
      price_per_night: payload.pricePerNight,
      studio_surcharge_per_night: payload.studioSurchargePerNight,
      min_nights: payload.minNights
    })
  });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  const docRef = adminDb.collection("pricing_seasons").doc(context.params.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
