import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function requireAdmin(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing auth token");
  }
  const token = header.replace("Bearer ", "");
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(token);

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowed.length > 0 && !allowed.includes(decoded.email ?? "")) {
    throw new Error("Not allowed");
  }

  return decoded;
}
