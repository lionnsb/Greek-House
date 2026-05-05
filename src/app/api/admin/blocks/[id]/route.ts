import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ message }, { status: 401 });
  }

  const docRef = adminDb.collection("availability_blocks").doc(context.params.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
