import { auth } from "@/lib/firebaseClient";

export async function adminFetch(input: RequestInfo, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Kein Admin-Token vorhanden.");
  }
  const headers = new Headers(init?.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
