"use client";

import { useEffect, useState } from "react";
import type { PricingSeason } from "@/lib/types";
import { adminFetch } from "@/lib/adminFetch";

export default function AdminPreisePage() {
  const [seasons, setSeasons] = useState<PricingSeason[]>([]);
  const [seasonStatus, setSeasonStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [seasonError, setSeasonError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const response = await adminFetch("/api/admin/seasons");
        const data = await response.json();
        setSeasons(data.items ?? []);
      } catch {
        setSeasons([]);
      }
    }
    loadSeasons();
  }, []);

  async function handleCreateSeason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSeasonStatus("loading");
    setSeasonError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      pricePerNight: formData.get("pricePerNight"),
      studioSurchargePerNight: formData.get("studioSurchargePerNight"),
      minNights: formData.get("minNights")
    };

    try {
      const response = await adminFetch("/api/admin/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Saison konnte nicht gespeichert werden.");
      }
      setSeasons((prev) => [
        ...prev,
        {
          id: data.id,
          name: String(payload.name),
          startDate: String(payload.startDate),
          endDate: String(payload.endDate),
          pricePerNight: Number(payload.pricePerNight ?? 0),
          studioSurchargePerNight: Number(payload.studioSurchargePerNight ?? 0),
          minNights: Number(payload.minNights ?? 1),
          createdAt: new Date().toISOString()
        }
      ]);
      event.currentTarget.reset();
      setSeasonStatus("success");
    } catch (err) {
      setSeasonStatus("error");
      setSeasonError(err instanceof Error ? err.message : "Fehler");
    }
  }

  async function handleDeleteSeason(id: string) {
    if (!confirm("Saison wirklich löschen?")) return;
    try {
      const response = await adminFetch(`/api/admin/seasons/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Löschen fehlgeschlagen.");
      }
      setSeasons((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setSeasonError(err instanceof Error ? err.message : "Fehler beim Löschen");
    }
  }

  return (
    <div className="container pb-16">
      <h1 className="text-2xl font-semibold">Preise</h1>
      <p className="mt-2 text-sm text-ink/70">
        Saisonpreise und Mindestaufenthalt pflegen.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form className="card grid gap-4 p-6" onSubmit={handleCreateSeason}>
          <h2 className="text-lg font-semibold">Saison anlegen</h2>
          <div>
            <label className="label">Saison</label>
            <select name="name" className="input" required>
              <option value="Sommer">Sommer</option>
              <option value="Winter">Winter</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Startdatum</label>
              <input name="startDate" type="date" className="input" required />
            </div>
            <div>
              <label className="label">Enddatum</label>
              <input name="endDate" type="date" className="input" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Preis pro Nacht</label>
              <div className="relative">
                <span className="currency-icon">
                  €
                </span>
                <input
                  name="pricePerNight"
                  type="number"
                  className="input input-currency"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Studio-Aufpreis pro Nacht</label>
              <div className="relative">
                <span className="currency-icon">
                  €
                </span>
                <input
                  name="studioSurchargePerNight"
                  type="number"
                  className="input input-currency"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Mindestaufenthalt (Nächte)</label>
            <input name="minNights" type="number" min={1} className="input" defaultValue={1} />
          </div>
          <button type="submit" className="btn" disabled={seasonStatus === "loading"}>
            Saison speichern
          </button>
          {seasonStatus === "success" && (
            <p className="text-sm text-emerald-700">Saison gespeichert.</p>
          )}
          {seasonStatus === "error" && (
            <p className="text-sm text-rose-700">{seasonError}</p>
          )}
        </form>
        <div>
          <h2 className="text-lg font-semibold">Aktuelle Saisonpreise</h2>
          <div className="mt-4 grid gap-3">
            {seasons.length === 0 && (
              <p className="text-sm text-ink/70">Keine Saisonpreise vorhanden.</p>
            )}
            {seasons.map((item) => (
              <div key={item.id} className="card p-4 text-sm text-ink/70">
                <p className="font-semibold text-ink">
                  {item.name}: {item.startDate} → {item.endDate}
                </p>
                <p className="mt-1">
                  {item.pricePerNight} €/Nacht · Studio +{item.studioSurchargePerNight} € ·
                  Min. {item.minNights} Nächte
                </p>
                <button
                  className="btn-outline mt-3"
                  type="button"
                  onClick={() => handleDeleteSeason(item.id)}
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
          {seasonError && seasonStatus !== "error" && (
            <p className="mt-4 text-sm text-rose-700">{seasonError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
