"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getSession } from "@/lib/supabase/auth";

type Arrival = {
  id: string;
  start_date: string;
  end_date: string;
  name: string;
  email: string;
  phone: string | null;
  guests: number;
  includes_studio: boolean;
  message: string | null;
  created_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("de-DE");
}

export default function AdminAnreisenPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Arrival[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState(""); // search

  async function ensureAuth() {
    const { data } = await getSession();
    if (!data.session) {
      router.push("/admin/login");
      return false;
    }
    return true;
  }

  async function load() {
    setError(null);
    setLoading(true);

    const ok = await ensureAuth();
    if (!ok) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id,start_date,end_date,name,email,phone,guests,includes_studio,message,created_at,status"
      )
      .eq("status", "CONFIRMED")
      .order("start_date", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data ?? []) as Arrival[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((x) => {
      const hay = [
        x.name,
        x.email,
        x.phone ?? "",
        x.message ?? "",
        x.start_date,
        x.end_date,
        x.includes_studio ? "studio" : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [items, q]);

  if (loading) return <div className="py-10 text-sm text-gray-600">Lade Anreisen…</div>;

  return (
    <div className="py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Anreisen</h1>

        <button
          onClick={load}
          className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Aktualisieren
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="w-full md:w-96 rounded-xl border px-3 py-2 text-sm"
          placeholder="Suchen (Name, Email, Telefon, Studio, Nachricht)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="text-sm text-gray-600">
          {filtered.length} / {items.length} bestätigt
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-gray-600">
          Keine bestätigten Anreisen gefunden.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-3xl border p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">
                  {formatDate(r.start_date)} → {formatDate(r.end_date)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border px-3 py-1">
                    Gäste: {r.guests}
                  </span>
                  <span className="rounded-full border px-3 py-1">
                    Studio: {r.includes_studio ? "Ja" : "Nein"}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="space-y-1">
                  <div>
                    <strong>Name:</strong> {r.name}
                  </div>
                  <div>
                    <strong>E-Mail:</strong>{" "}
                    <a className="underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  </div>
                  {r.phone && (
                    <div>
                      <strong>Telefon:</strong>{" "}
                      <a className="underline" href={`tel:${r.phone}`}>
                        {r.phone}
                      </a>
                    </div>
                  )}
                </div>

                {r.message && (
                  <div>
                    <strong>Nachricht:</strong>
                    <div className="mt-1 whitespace-pre-line rounded-2xl bg-gray-50 p-3">
                      {r.message}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                ID: <span className="font-mono">{r.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
