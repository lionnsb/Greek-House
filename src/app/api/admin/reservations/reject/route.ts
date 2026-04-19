import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAnon } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email/mailer";

type Body = {
  accessToken: string;
  reservationId: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.accessToken || !body?.reservationId) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(body.accessToken);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { data: reservation, error: resErr } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("id", body.reservationId)
      .single();

    if (resErr || !reservation) {
      return NextResponse.json({ error: "Reservierung nicht gefunden." }, { status: 404 });
    }

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("house_name,email_signature")
      .eq("id", 1)
      .single();

    const houseName = settings?.house_name || "Villa";
    const signature = settings?.email_signature || `Viele Grüße\n${houseName}`;

    const { error: updErr } = await supabaseAdmin
      .from("reservations")
      .update({ status: "REJECTED" })
      .eq("id", body.reservationId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    const subject = `${houseName}: Anfrage leider nicht verfügbar`;
    const text =
`Hallo ${reservation.name},

vielen Dank für deine Anfrage (${reservation.start_date} bis ${reservation.end_date}).
Leider können wir den Zeitraum nicht bestätigen.

Wenn du magst, schick uns gern alternative Daten – wir prüfen das sofort.

${signature}
`;

    await sendMail({ to: reservation.email, subject, text });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
