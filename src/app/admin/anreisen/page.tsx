"use client";

import { useEffect, useMemo, useState } from "react";
import type { Reservation } from "@/lib/types";
import { adminFetch } from "@/lib/adminFetch";

export default function AdminAnreisenPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await adminFetch("/api/admin/arrivals");
        const data = await response.json();
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      [item.name, item.email, item.startDate, item.endDate].some((value) =>
        (value ?? "").toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Phone", "Guests", "Studio", "Start", "End"],
      ...filtered.map((item) => [
        item.name,
        item.email,
        item.phone ?? "",
        String(item.guests),
        item.includesStudio ? "yes" : "no",
        item.startDate,
        item.endDate
      ])
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anreisen.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container pb-16">
      <h1 className="text-2xl font-semibold">Anreisen</h1>
      <p className="mt-2 text-sm text-ink/70">
        Bestätigte Buchungen nach Startdatum.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <input
          className="input max-w-xs"
          placeholder="Suche nach Name, E-Mail oder Datum"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="btn-outline" onClick={exportCsv}>
          CSV exportieren
        </button>
      </div>
      <div className="mt-6 grid gap-4">
        {loading && <p className="text-sm text-ink/70">Lade...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-ink/70">Keine Anreisen gefunden.</p>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="card p-6 text-sm text-ink/70">
            <p className="text-base font-semibold text-ink">{item.name}</p>
            <p className="mt-1">
              {item.startDate} → {item.endDate} | Gäste: {item.guests} | Studio:{" "}
              {item.includesStudio ? "ja" : "nein"}
            </p>
            <p className="mt-2">Kontakt: {item.email}</p>
            <p>Telefon: {item.phone ?? "-"}</p>
            <p>Nachricht: {item.message ?? "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
