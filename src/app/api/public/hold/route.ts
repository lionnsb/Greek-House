import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Erwarteter Body:
 * {
 *   startDate: "2026-06-01",  // ISO date (YYYY-MM-DD)
 *   endDate: "2026-06-10",    // ISO date (YYYY-MM-DD)
 *   name: string,
 *   email: string,
 *   phone?: string,
 *   guests: number,
 *   message?: string,
 *   includesStudio?: boolean
 * }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const startDate: string | undefined = body?.startDate;
    const endDate: string | undefined = body?.endDate;
    const name: string | undefined = body?.name;
    const email: string | undefined = body?.email;
    const phone: string | undefined = body?.phone;
    const guestsRaw: number | string | undefined = body?.guests;
    const message: string | undefined = body?.message;
    const includesStudio: boolean = !!body?.includesStudio;

    // --- 1) Basic Validation ---
    const guests = typeof guestsRaw === "string" ? parseInt(guestsRaw, 10) : guestsRaw;

    if (!startDate || !endDate || !name || !email || !guests) {
      return NextResponse.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
    }

    if (!Number.isFinite(guests) || guests <= 0) {
      return NextResponse.json({ error: "Ungültige Gästeanzahl." }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Ungültiges Datum." }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json(
        { error: "Abreisedatum muss nach dem Anreisedatum liegen." },
        { status: 400 }
      );
    }

    // --- 2) Check Availability (Overlap) ---
    // Overlap-Regel: start < existing_end AND end > existing_start
    const { data: conflicts, error: conflictError } = await supabase
      .from("availability_blocks")
      .select("start_date,end_date,status,hold_until")
      .lt("start_date", endDate)
      .gt("end_date", startDate);

    if (conflictError) {
      return NextResponse.json({ error: conflictError.message }, { status: 500 });
    }

    // Blocked periods (Sperrzeiten) ebenfalls prüfen
    const { data: blocked, error: blockedError } = await supabase
      .from("availability_blocked")
      .select("start_date,end_date")
      .lt("start_date", endDate)
      .gt("end_date", startDate);

    if (blockedError) {
      return NextResponse.json({ error: blockedError.message }, { status: 500 });
    }

    if ((conflicts?.length ?? 0) > 0 || (blocked?.length ?? 0) > 0) {
      return NextResponse.json(
        { error: "Der Zeitraum ist leider nicht mehr verfügbar." },
        { status: 409 }
      );
    }

    // --- 3) Hold Duration ---
    // MVP: hardcoded 24h (Settings lesen ist public wegen RLS nicht erlaubt)
    const holdHours = 24;
    const holdUntil = new Date(Date.now() + holdHours * 60 * 60 * 1000).toISOString();

    // --- 4) Insert Reservation (HOLD) ---
    // Wichtig: KEIN .select() nach insert, weil public (anon) sonst SELECT-Rechte bräuchte.
    const reservationId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("reservations").insert({
      id: reservationId,
      start_date: startDate,
      end_date: endDate,
      status: "HOLD",
      hold_until: holdUntil,
      includes_studio: includesStudio,
      name,
      email,
      phone,
      guests,
      message,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // --- 5) Success ---
    return NextResponse.json({
      success: true,
      reservationId,
      holdUntil,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unerwarteter Fehler." }, { status: 500 });
  }
}
