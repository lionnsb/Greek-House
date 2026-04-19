"use client";

import { useEffect, useState } from "react";
import type { AvailabilityBlock } from "@/lib/types";
import { adminFetch } from "@/lib/adminFetch";

type FormState = {
  startDate: string;
  endDate: string;
  reason: string;
};

export default function AdminKalenderPage() {
  const [items, setItems] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await adminFetch("/api/admin/blocks");
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


  async function handleCreateBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await adminFetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Sperre konnte nicht erstellt werden.");
      }

      setItems((prev) => [
        ...prev,
        {
          id: data.id,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason || null,
          createdAt: new Date().toISOString()
        }
      ]);
      setForm({ startDate: "", endDate: "", reason: "" });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Fehler");
    }
  }

  async function handleDeleteBlock(id: string) {
    if (!confirm("Sperre wirklich löschen?")) return;
    try {
      const response = await adminFetch(`/api/admin/blocks/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Löschen fehlgeschlagen.");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen");
    }
  }


  return (
    <div className="container pb-16">
      <h1 className="text-2xl font-semibold">Kalender</h1>
      <p className="mt-2 text-sm text-ink/70">
        Sperrzeiten hinzufügen und entfernen.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form className="card grid gap-4 p-6" onSubmit={handleCreateBlock}>
          <h2 className="text-lg font-semibold">Neue Sperre</h2>
          <div>
            <label className="label">Startdatum</label>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Enddatum</label>
            <input
              type="date"
              className="input"
              value={form.endDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Grund (optional)</label>
            <input
              type="text"
              className="input"
              value={form.reason}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reason: event.target.value }))
              }
            />
          </div>
          <button type="submit" className="btn" disabled={status === "loading"}>
            Sperre speichern
          </button>
          {status === "success" && (
            <p className="text-sm text-emerald-700">
              Sperre wurde gespeichert.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-rose-700">{error}</p>
          )}
        </form>
        <div>
          <h2 className="text-lg font-semibold">Aktuelle Sperren</h2>
          <div className="mt-4 grid gap-3">
            {loading && <p className="text-sm text-ink/70">Lade...</p>}
            {!loading && items.length === 0 && (
              <p className="text-sm text-ink/70">Keine Sperren vorhanden.</p>
            )}
            {items.map((item) => (
              <div key={item.id} className="card p-4 text-sm text-ink/70">
                <p className="font-semibold text-ink">
                  {item.startDate} → {item.endDate}
                </p>
                <p className="mt-1">{item.reason ?? "-"}</p>
                <button
                  className="btn-outline mt-3"
                  type="button"
                  onClick={() => handleDeleteBlock(item.id)}
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
          {error && status !== "error" && (
            <p className="mt-4 text-sm text-rose-700">{error}</p>
          )}
        </div>
      </div>

    </div>
  );
}
