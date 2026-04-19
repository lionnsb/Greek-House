"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebaseClient";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("idle");
      router.push("/admin");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    }
  }

  return (
    <div className="container py-16">
      <div className="card mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
          <div>
            <label className="label">E-Mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Passwort</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={status === "loading"}>
            Einloggen
          </button>
          {status === "error" && (
            <p className="text-sm text-rose-700">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
