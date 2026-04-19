import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email/mailer";

export async function POST() {
  try {
    await sendMail({
      to: process.env.SMTP_USER!,
      subject: "SMTP Test ✅",
      text: "Wenn du diese Mail bekommst, funktioniert SMTP.",
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "SMTP Test fehlgeschlagen" },
      { status: 500 }
    );
  }
}

