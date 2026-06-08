"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import type { PricingSeason } from "@/lib/types";

type SeasonFormState = {
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: string;
  studioSurchargePerNight: string;
  minNights: string;
};

const SEASON_NAME_OPTIONS = [
  "Hauptsaison",
  "Vorsaison",
  "Nachsaison",
  "Winter",
  "Standard"
] as const;

const DEFAULT_SEASON_NAME = "Hauptsaison";

function isStandardSeasonName(name: string) {
  return name === "Standard";
}

function seasonToFormState(season: PricingSeason): SeasonFormState {
  return {
    name: season.name,
    startDate: season.startDate ?? "",
    endDate: season.endDate ?? "",
    pricePerNight: String(season.pricePerNight),
    studioSurchargePerNight: String(season.studioSurchargePerNight),
    minNights: String(season.minNights)
  };
}

function buildSeasonPayload(form: SeasonFormState) {
  return {
    name: form.name,
    startDate: form.startDate,
    endDate: form.endDate,
    pricePerNight: form.pricePerNight,
    studioSurchargePerNight: form.studioSurchargePerNight,
    minNights: form.minNights
  };
}

export default function AdminPreisePage() {
  const [seasons, setSeasons] = useState<PricingSeason[]>([]);
  const [seasonStatus, setSeasonStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [selectedSeasonName, setSelectedSeasonName] =
    useState(DEFAULT_SEASON_NAME);
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SeasonFormState | null>(null);
  const [editStatus, setEditStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [editError, setEditError] = useState<string | null>(null);

  const isCreateStandardSeason = isStandardSeasonName(selectedSeasonName);
  const isEditStandardSeason = isStandardSeasonName(editForm?.name ?? "");

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
    const payload = buildSeasonPayload({
      name: String(formData.get("name") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      pricePerNight: String(formData.get("pricePerNight") ?? ""),
      studioSurchargePerNight: String(
        formData.get("studioSurchargePerNight") ?? ""
      ),
      minNights: String(formData.get("minNights") ?? "")
    });

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

      const nextSeason: PricingSeason = data.item ?? {
        id: data.id,
        name: payload.name,
        startDate: isCreateStandardSeason ? null : payload.startDate,
        endDate: isCreateStandardSeason ? null : payload.endDate,
        pricePerNight: Number(payload.pricePerNight ?? 0),
        studioSurchargePerNight: Number(payload.studioSurchargePerNight ?? 0),
        minNights: Number(payload.minNights ?? 1),
        createdAt: new Date().toISOString()
      };

      setSeasons((prev) => [...prev, nextSeason]);
      event.currentTarget.reset();
      setSelectedSeasonName(DEFAULT_SEASON_NAME);
      setSeasonStatus("success");
    } catch (err) {
      setSeasonStatus("error");
      setSeasonError(err instanceof Error ? err.message : "Fehler");
    }
  }

  function handleStartEditSeason(item: PricingSeason) {
    setEditingSeasonId(item.id);
    setEditForm(seasonToFormState(item));
    setEditStatus("idle");
    setEditError(null);
  }

  function handleCancelEditSeason() {
    setEditingSeasonId(null);
    setEditForm(null);
    setEditStatus("idle");
    setEditError(null);
  }

  function handleEditFormChange(field: keyof SeasonFormState, value: string) {
    setEditForm((prev) => {
      if (!prev) return prev;
      if (field === "name" && isStandardSeasonName(value)) {
        return {
          ...prev,
          name: value,
          startDate: "",
          endDate: ""
        };
      }

      return {
        ...prev,
        [field]: value
      };
    });
  }

  async function handleUpdateSeason(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSeasonId || !editForm) return;

    setEditStatus("loading");
    setEditError(null);

    try {
      const response = await adminFetch(`/api/admin/seasons/${editingSeasonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSeasonPayload(editForm))
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Saison konnte nicht aktualisiert werden.");
      }

      const updatedSeason: PricingSeason = data.item ?? {
        id: editingSeasonId,
        name: editForm.name,
        startDate: isEditStandardSeason ? null : editForm.startDate,
        endDate: isEditStandardSeason ? null : editForm.endDate,
        pricePerNight: Number(editForm.pricePerNight ?? 0),
        studioSurchargePerNight: Number(editForm.studioSurchargePerNight ?? 0),
        minNights: Number(editForm.minNights ?? 1),
        createdAt:
          seasons.find((item) => item.id === editingSeasonId)?.createdAt ??
          new Date().toISOString()
      };

      setSeasons((prev) =>
        prev.map((item) => (item.id === editingSeasonId ? updatedSeason : item))
      );
      setEditingSeasonId(null);
      setEditForm(null);
      setEditStatus("success");
    } catch (err) {
      setEditStatus("error");
      setEditError(
        err instanceof Error ? err.message : "Fehler beim Aktualisieren"
      );
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
      if (editingSeasonId === id) {
        handleCancelEditSeason();
      }
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
            <select
              name="name"
              className="input"
              required
              value={selectedSeasonName}
              onChange={(event) => setSelectedSeasonName(event.target.value)}
            >
              {SEASON_NAME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Startdatum</label>
              <input
                name="startDate"
                type="date"
                className="input"
                required={!isCreateStandardSeason}
                disabled={isCreateStandardSeason}
              />
            </div>
            <div>
              <label className="label">Enddatum</label>
              <input
                name="endDate"
                type="date"
                className="input"
                required={!isCreateStandardSeason}
                disabled={isCreateStandardSeason}
              />
              <p className="mt-1 text-xs text-ink/60">
                {isCreateStandardSeason
                  ? "Beim Standardpreis ist kein Zeitraum noetig. Er gilt immer, ausser eine datumsgebundene Saison ueberschreibt ihn."
                  : "Enddatum wird inklusive gerechnet."}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Preis pro Nacht</label>
              <div className="relative">
                <span className="currency-icon">€</span>
                <input
                  name="pricePerNight"
                  type="number"
                  min={0}
                  className="input input-currency"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Studio-Aufpreis pro Nacht</label>
              <div className="relative">
                <span className="currency-icon">€</span>
                <input
                  name="studioSurchargePerNight"
                  type="number"
                  min={0}
                  className="input input-currency"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Mindestaufenthalt (Nächte)</label>
            <input
              name="minNights"
              type="number"
              min={1}
              className="input"
              defaultValue={1}
              required
            />
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
                  {item.name}:{" "}
                  {item.startDate && item.endDate
                    ? `${item.startDate} → ${item.endDate}`
                    : "immer aktiv"}
                </p>
                <p className="mt-1">
                  {item.pricePerNight} €/Nacht · Studio +{item.studioSurchargePerNight} € ·
                  Min. {item.minNights} Nächte
                </p>
                {editingSeasonId === item.id && editForm ? (
                  <form
                    className="mt-4 grid gap-4 border-t border-stone/70 pt-4"
                    onSubmit={handleUpdateSeason}
                  >
                    <div>
                      <label className="label">Saison</label>
                      <select
                        className="input"
                        value={editForm.name}
                        onChange={(event) =>
                          handleEditFormChange("name", event.target.value)
                        }
                        required
                      >
                        {SEASON_NAME_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="label">Startdatum</label>
                        <input
                          type="date"
                          className="input"
                          value={editForm.startDate}
                          onChange={(event) =>
                            handleEditFormChange("startDate", event.target.value)
                          }
                          required={!isEditStandardSeason}
                          disabled={isEditStandardSeason}
                        />
                      </div>
                      <div>
                        <label className="label">Enddatum</label>
                        <input
                          type="date"
                          className="input"
                          value={editForm.endDate}
                          onChange={(event) =>
                            handleEditFormChange("endDate", event.target.value)
                          }
                          required={!isEditStandardSeason}
                          disabled={isEditStandardSeason}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="label">Preis pro Nacht</label>
                        <div className="relative">
                          <span className="currency-icon">€</span>
                          <input
                            type="number"
                            min={0}
                            className="input input-currency"
                            value={editForm.pricePerNight}
                            onChange={(event) =>
                              handleEditFormChange("pricePerNight", event.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Studio-Aufpreis pro Nacht</label>
                        <div className="relative">
                          <span className="currency-icon">€</span>
                          <input
                            type="number"
                            min={0}
                            className="input input-currency"
                            value={editForm.studioSurchargePerNight}
                            onChange={(event) =>
                              handleEditFormChange(
                                "studioSurchargePerNight",
                                event.target.value
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label">Mindestaufenthalt (Nächte)</label>
                      <input
                        type="number"
                        min={1}
                        className="input"
                        value={editForm.minNights}
                        onChange={(event) =>
                          handleEditFormChange("minNights", event.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn" type="submit" disabled={editStatus === "loading"}>
                        Änderungen speichern
                      </button>
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={handleCancelEditSeason}
                      >
                        Abbrechen
                      </button>
                    </div>
                    {editStatus === "error" && (
                      <p className="text-sm text-rose-700">{editError}</p>
                    )}
                  </form>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      className="btn-outline"
                      type="button"
                      onClick={() => handleStartEditSeason(item)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="btn-outline"
                      type="button"
                      onClick={() => handleDeleteSeason(item.id)}
                    >
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {editStatus === "success" && (
            <p className="mt-4 text-sm text-emerald-700">
              Saison wurde aktualisiert.
            </p>
          )}
          {seasonError && seasonStatus !== "error" && (
            <p className="mt-4 text-sm text-rose-700">{seasonError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
