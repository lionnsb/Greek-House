import { adminDb } from "@/lib/firebaseAdmin";

export async function cleanupExpiredHolds() {
  const now = new Date().toISOString();
  const snap = await adminDb
    .collection("reservations")
    .where("status", "==", "HOLD")
    .get();

  const expired = snap.docs.filter((doc) => {
    const data = doc.data();
    return data.hold_until && data.hold_until < now;
  });

  if (expired.length === 0) return 0;

  await Promise.all(
    expired.map((doc) => doc.ref.update({ status: "REJECTED" }))
  );

  return expired.length;
}
