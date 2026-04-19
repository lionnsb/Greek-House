"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/supabase/auth";

export default function AdminHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return <div className="py-10 text-sm text-gray-600">Lade...</div>;
  }

  return (
    <div className="py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={async () => {
            await signOut();
            router.push("/admin/login");
          }}
          className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/anfragen" className="rounded-3xl border p-6 hover:bg-gray-50">
          <div className="font-medium">Anfragen</div>
          <div className="mt-1 text-sm text-gray-600">HOLDs ansehen & entscheiden</div>
        </Link>

        <Link href="/admin/kalender" className="rounded-3xl border p-6 hover:bg-gray-50">
          <div className="font-medium">Kalender</div>
          <div className="mt-1 text-sm text-gray-600">Sperrzeiten & Buchungen</div>
        </Link>

        <Link href="/admin/anreisen" className="rounded-3xl border p-6 hover:bg-gray-50">
          <div className="font-medium">Anreisen</div>
          <div className="mt-1 text-sm text-gray-600">Bestätigte Buchungen nach Datum</div>
        </Link>
      </div>
    </div>
  );
}
