"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getClientAuth } from "@/lib/firebaseClient";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const allowedEmails = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
    return raw
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAuthed(false);
        setEmail(null);
        setLoading(false);
        return;
      }
      const allowed =
        allowedEmails.length === 0 ||
        allowedEmails.includes((user.email ?? "").toLowerCase());
      setIsAuthed(allowed);
      setEmail(user.email ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, [allowedEmails]);

  if (loading) {
    return (
      <div className="container py-16">
        <p className="text-sm text-ink/70">Lade Admin-Bereich...</p>
      </div>
    );
  }

  if (pathname?.startsWith("/admin/login") && isAuthed) {
    router.replace("/admin");
    return null;
  }

  if (pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  if (!isAuthed) {
    router.replace("/admin/login");
    return (
      <div className="container py-16">
        <h1 className="text-2xl font-semibold">Admin Login erforderlich</h1>
        <p className="mt-2 text-sm text-ink/70">
          Bitte anmelden, um fortzufahren.
        </p>
        <Link href="/admin/login" className="btn mt-6">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-stone bg-white">
        <div className="container flex items-center justify-between py-4 text-sm">
          <p className="text-ink/70">Eingeloggt als {email}</p>
          <button
            type="button"
            onClick={() => signOut(getClientAuth())}
            className="btn-outline"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
