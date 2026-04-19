"use client";

import { useEffect, useMemo, useState } from "react";
import type { Reservation } from "@/lib/types";
import { adminFetch } from "@/lib/adminFetch";
import { calculateTotal } from "@/lib/pricing";
import { buildSeasonsFromEnv, calculateSeasonalTotal } from "@/lib/seasonPricing";
import type { SeasonDefinition } from "@/lib/seasonPricing";

type ActionState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

type FormValues = {
  priceTotal: string;
  depositAmount: string;
  paymentDueUntil: string;
  startDate: string;
  endDate: string;
  guests: string;
  includesStudio: boolean;
  message: string;
};

export default function AdminAnfragenPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Record<string, ActionState>>({});
  const [formValues, setFormValues] = useState<Record<string, FormValues>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [cleanupStatus, setCleanupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "HOLD" | "ACCEPTED_AWAITING_PAYMENT" | "CONFIRMED" | "REJECTED"
  >("ALL");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  const pricePerNight = Number(process.env.NEXT_PUBLIC_PRICE_PER_NIGHT ?? "0");
  const studioSurchargePerNight = Number(process.env.NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT ?? "0");
  const [seasons, setSeasons] = useState<SeasonDefinition[]>(buildSeasonsFromEnv());

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...sortedItems];
    if (statusFilter !== "ALL") {
      result = result.filter((item) => item.status === statusFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((item) =>
        [item.name, item.email, item.startDate, item.endDate].some((value) =>
          (value ?? "").toLowerCase().includes(q)
        )
      );
    }
    return result;
  }, [sortedItems, statusFilter, query]);

  useEffect(() => {
    async function load() {
      try {
        const response = await adminFetch("/api/admin/reservations");
        const data = await response.json();
        setItems(data.items ?? []);
        const nextFormValues: typeof formValues = {};
        (data.items ?? []).forEach((item: Reservation) => {
          nextFormValues[item.id] = {
            priceTotal: item.priceTotal?.toString() ?? "",
            depositAmount: item.depositAmount?.toString() ?? "",
            paymentDueUntil: item.paymentDueUntil ?? "",
            startDate: item.startDate,
            endDate: item.endDate,
            guests: item.guests?.toString() ?? "",
            includesStudio: item.includesStudio,
            message: item.message ?? ""
          };
        });
        setFormValues(nextFormValues);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const response = await adminFetch("/api/admin/seasons");
        const data = await response.json();
        if (data?.items?.length) {
          setSeasons(
            data.items.map((item: { name: string; startDate: string; endDate: string; pricePerNight: number; studioSurchargePerNight: number; minNights: number }) => ({
              name: item.name,
              start: item.startDate,
              end: item.endDate,
              pricePerNight: item.pricePerNight,
              studioSurchargePerNight: item.studioSurchargePerNight,
              minNights: item.minNights ?? 1
            }))
          );
        }
      } catch {
        // fallback to env
      }
    }
    loadSeasons();
  }, []);

  async function runCleanup() {
    setCleanupStatus("loading");
    try {
      const response = await adminFetch("/api/admin/cleanup-holds", {
        method: "POST"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Cleanup fehlgeschlagen");
      }
      setCleanupStatus("success");
      setItems((prev) =>
        prev.map((item) =>
          item.status === "HOLD" &&
          item.holdUntil &&
          item.holdUntil < new Date().toISOString()
            ? { ...item, status: "REJECTED" }
            : item
        )
      );
    } catch {
      setCleanupStatus("error");
    }
  }

  function updateFormValue(id: string, field: keyof FormValues, value: string | boolean) {
    setFormValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
    setFieldErrors((prev) => ({ ...prev, [id]: null }));
  }

  async function updateReservation(id: string, payload: Record<string, unknown>) {
    setActions((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, success: null }
    }));

    try {
      const response = await adminFetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Aktion fehlgeschlagen");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: (payload.status as Reservation["status"]) ?? item.status,
                priceTotal:
                  typeof payload.priceTotal === "number"
                    ? payload.priceTotal
                    : item.priceTotal ?? null,
                depositAmount:
                  typeof payload.depositAmount === "number"
                    ? payload.depositAmount
                    : item.depositAmount ?? null,
                paymentDueUntil:
                  typeof payload.paymentDueUntil === "string"
                    ? payload.paymentDueUntil
                    : item.paymentDueUntil ?? null,
                startDate:
                  typeof payload.startDate === "string" ? payload.startDate : item.startDate,
                endDate:
                  typeof payload.endDate === "string" ? payload.endDate : item.endDate,
                guests:
                  typeof payload.guests === "number" ? payload.guests : item.guests,
                includesStudio:
                  typeof payload.includesStudio === "boolean"
                    ? payload.includesStudio
                    : item.includesStudio,
                message:
                  typeof payload.message === "string" ? payload.message : item.message
              }
            : item
        )
      );

      setActions((prev) => ({
        ...prev,
        [id]: { loading: false, error: null, success: "Gespeichert." }
      }));
    } catch (err) {
      setActions((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          error: err instanceof Error ? err.message : "Fehler",
          success: null
        }
      }));
    }
  }

  async function sendPaymentReminder(id: string) {
    setActions((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, success: null }
    }));
    try {
      const response = await adminFetch(`/api/admin/reservations/${id}/remind`, {
        method: "POST"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Erinnerung fehlgeschlagen");
      }
      setActions((prev) => ({
        ...prev,
        [id]: { loading: false, error: null, success: "Erinnerung gesendet." }
      }));
    } catch (err) {
      setActions((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          error: err instanceof Error ? err.message : "Fehler",
          success: null
        }
      }));
    }
  }

  function validateAccept(values: FormValues) {
    if (!values.priceTotal || Number(values.priceTotal) <= 0) {
      return "Bitte einen Gesamtpreis (> 0) eintragen.";
    }
    if (!values.paymentDueUntil) {
      return "Bitte eine Zahlungsfrist setzen.";
    }
    return null;
  }

  function applyAutoPrice(item: Reservation) {
    const seasonal = calculateSeasonalTotal({
      startDate: item.startDate,
      endDate: item.endDate,
      includesStudio: item.includesStudio,
      seasons
    });

    setFormValues((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        priceTotal: seasonal.total ? seasonal.total.toString() : ""
      }
    }));
    setFieldErrors((prev) => ({ ...prev, [item.id]: null }));
  }

  async function deleteReservation(id: string) {
    if (!confirm("Buchung wirklich löschen?")) return;
    setActions((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, success: null }
    }));
    try {
      const response = await adminFetch(`/api/admin/reservations/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Löschen fehlgeschlagen");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      setActions((prev) => ({
        ...prev,
        [id]: { loading: false, error: null, success: "Gelöscht." }
      }));
    } catch (err) {
      setActions((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          error: err instanceof Error ? err.message : "Fehler",
          success: null
        }
      }));
    }
  }

  return (
    <div className="container pb-16">
      <h1 className="text-2xl font-semibold">Anfragen</h1>
      <p className="mt-2 text-sm text-ink/70">
        Neue Anfragen prüfen und Status aktualisieren.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          className="btn-outline"
          onClick={runCleanup}
          disabled={cleanupStatus === "loading"}
        >
          Abgelaufene HOLDs bereinigen
        </button>
        {cleanupStatus === "success" && (
          <span className="text-emerald-700">Cleanup abgeschlossen.</span>
        )}
        {cleanupStatus === "error" && (
          <span className="text-rose-700">Cleanup fehlgeschlagen.</span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <input
          className="input max-w-xs"
          placeholder="Suche nach Name, E-Mail oder Datum"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as typeof statusFilter)
          }
        >
          <option value="ALL">Alle Status</option>
          <option value="HOLD">HOLD</option>
          <option value="ACCEPTED_AWAITING_PAYMENT">AKZEPTIERT</option>
          <option value="CONFIRMED">BESTÄTIGT</option>
          <option value="REJECTED">ABGELEHNT</option>
        </select>
      </div>
      <div className="mt-6 grid gap-4">
        {loading && <p className="text-sm text-ink/70">Lade...</p>}
        {!loading && filteredItems.length === 0 && (
          <p className="text-sm text-ink/70">Keine Anfragen gefunden.</p>
        )}
        {filteredItems.map((item) => {
          const form = formValues[item.id] ?? {
            priceTotal: "",
            depositAmount: "",
            paymentDueUntil: "",
            startDate: item.startDate,
            endDate: item.endDate,
            guests: item.guests?.toString() ?? "",
            includesStudio: item.includesStudio,
            message: item.message ?? ""
          };
          const actionState = actions[item.id];
          const isHold = item.status === "HOLD";
          const isAccepted = item.status === "ACCEPTED_AWAITING_PAYMENT";
          const isConfirmed = item.status === "CONFIRMED";
          const isRejected = item.status === "REJECTED";
          const isExpiredHold =
            isHold && item.holdUntil ? item.holdUntil < new Date().toISOString() : false;
          const reactivatableUntil = item.createdAt
            ? new Date(new Date(item.createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString()
            : null;
          const canReactivate =
            isRejected && reactivatableUntil
              ? reactivatableUntil >= new Date().toISOString()
              : false;
          const pricing = calculateTotal({
            startDate: item.startDate,
            endDate: item.endDate,
            includesStudio: item.includesStudio,
            pricePerNight,
            studioSurchargePerNight
          });
          const seasonal = calculateSeasonalTotal({
            startDate: item.startDate,
            endDate: item.endDate,
            includesStudio: item.includesStudio,
            seasons
          });
          const isOverdue =
            isAccepted &&
            item.paymentDueUntil &&
            item.paymentDueUntil < new Date().toISOString();

          async function deleteReservation(id: string) {
    if (!confirm("Buchung wirklich löschen?")) return;
    setActions((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, success: null }
    }));
    try {
      const response = await adminFetch(`/api/admin/reservations/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Löschen fehlgeschlagen");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      setActions((prev) => ({
        ...prev,
        [id]: { loading: false, error: null, success: "Gelöscht." }
      }));
    } catch (err) {
      setActions((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          error: err instanceof Error ? err.message : "Fehler",
          success: null
        }
      }));
    }
  }

  return (
            <div
              key={item.id}
              className={`card p-6 ${
                isConfirmed ? "border border-emerald-300" : ""
              } ${isRejected ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-ink/70">
                    {item.startDate} → {item.endDate}
                  </p>
                  <p className="text-xs text-ink/60">Status: {item.status}</p>
                  {isConfirmed && (
                    <span className="badge mt-2 border-emerald-200 bg-emerald-50 text-emerald-800">
                      Erfolgreich
                    </span>
                  )}
                  {isOverdue && (
                    <span className="badge mt-2 border-rose-200 bg-rose-50 text-rose-800">
                      Zahlung überfällig
                    </span>
                  )}
                  {isRejected && reactivatableUntil && (
                    <p className="text-xs text-ink/60">
                      Reaktivierbar bis: {new Date(reactivatableUntil).toLocaleString("de-DE")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isRejected ? (
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        updateReservation(item.id, {
                          status: "HOLD",
                          holdUntil: new Date(
                            Date.now() + 48 * 60 * 60 * 1000
                          ).toISOString()
                        })
                      }
                      disabled={actionState?.loading || !canReactivate}
                    >
                      Reaktivieren (48h)
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={() => {
                          if (confirm("Anfrage wirklich ablehnen?")) {
                            updateReservation(item.id, { status: "REJECTED" });
                          }
                        }}
                        disabled={actionState?.loading}
                      >
                        Ablehnen
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => {
                          const error = validateAccept(form);
                          if (error) {
                            setFieldErrors((prev) => ({ ...prev, [item.id]: error }));
                            return;
                          }
                          updateReservation(item.id, {
                            status: "ACCEPTED_AWAITING_PAYMENT",
                            priceTotal: Number(form.priceTotal),
                            depositAmount: form.depositAmount
                              ? Number(form.depositAmount)
                              : null,
                            paymentDueUntil: form.paymentDueUntil || null
                          });
                        }}
                        disabled={actionState?.loading || !isHold || isExpiredHold}
                      >
                        Annehmen
                      </button>
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={() => {
                          if (confirm("Zahlung bestätigt und Buchung fixieren?")) {
                            updateReservation(item.id, { status: "CONFIRMED" });
                          }
                        }}
                        disabled={actionState?.loading || !isAccepted}
                      >
                        Bestätigen
                      </button>
                      {isOverdue && (
                        <button
                          className="btn-outline"
                          type="button"
                          onClick={() => sendPaymentReminder(item.id)}
                          disabled={actionState?.loading}
                        >
                          Zahlung erinnern
                        </button>
                      )}
                      {isConfirmed && (
                        <button
                          className="btn-outline"
                          type="button"
                          onClick={() => deleteReservation(item.id)}
                          disabled={actionState?.loading}
                        >
                          Buchung löschen
                        </button>
                      )}
                      {!isConfirmed && (
                        <button
                          className="btn-outline"
                          type="button"
                          onClick={() =>
                            setEditing((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                          }
                        >
                          {editing[item.id] ? "Bearbeitung schließen" : "Bearbeiten"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {editing[item.id] && !isConfirmed && !isRejected && (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="label">Anreise</label>
                    <input
                      type="date"
                      className="input"
                      value={form.startDate}
                      onChange={(event) =>
                        updateFormValue(item.id, "startDate", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Abreise</label>
                    <input
                      type="date"
                      className="input"
                      value={form.endDate}
                      onChange={(event) =>
                        updateFormValue(item.id, "endDate", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Gäste</label>
                    <input
                      type="number"
                      className="input"
                      value={form.guests}
                      onChange={(event) =>
                        updateFormValue(item.id, "guests", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.includesStudio}
                      onChange={(event) =>
                        updateFormValue(item.id, "includesStudio", event.target.checked)
                      }
                    />
                    <span className="text-sm text-ink/70">Studio gebucht</span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Nachricht</label>
                    <input
                      type="text"
                      className="input"
                      value={form.message}
                      onChange={(event) =>
                        updateFormValue(item.id, "message", event.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        updateReservation(item.id, {
                          startDate: form.startDate,
                          endDate: form.endDate,
                          guests: Number(form.guests),
                          includesStudio: form.includesStudio,
                          message: form.message
                        })
                      }
                    >
                      Änderungen speichern
                    </button>
                  </div>
                </div>
              )}

              <div className={`mt-4 grid gap-4 md:grid-cols-3 ${isRejected ? "opacity-70" : ""}`}>
                <div>
                  <label className="label">Gesamtpreis (EUR)</label>
                  <div className="relative">
                    <span className="currency-icon">€</span>
                    <input
                      type="number"
                      className="input input-currency"
                      value={form.priceTotal}
                      onChange={(event) =>
                        updateFormValue(item.id, "priceTotal", event.target.value)
                      }
                      disabled={isRejected || (!isHold && !isAccepted)}
                    />
                  </div>
                  <div className="mt-2 text-xs text-ink/60">
                    {pricing.nights} Nächte · Basis {pricePerNight}€/Nacht
                    {item.includesStudio
                      ? ` · Studio +${studioSurchargePerNight}€/Nacht`
                      : ""}
                    {seasonal.total > 0 && (
                      <span className="ml-2">
                        · Saisonpreis: {seasonal.total.toFixed(0)} EUR
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label">Anzahlung (optional)</label>
                  <div className="relative">
                    <span className="currency-icon">€</span>
                    <input
                      type="number"
                      className="input input-currency"
                      value={form.depositAmount}
                      onChange={(event) =>
                        updateFormValue(item.id, "depositAmount", event.target.value)
                      }
                      disabled={isRejected || (!isHold && !isAccepted)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Zahlungsfrist</label>
                  <input
                    type="date"
                    className="input"
                    value={form.paymentDueUntil}
                    onChange={(event) =>
                      updateFormValue(item.id, "paymentDueUntil", event.target.value)
                    }
                    disabled={isRejected || (!isHold && !isAccepted)}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => applyAutoPrice(item)}
                  disabled={isRejected || (!isHold && !isAccepted)}
                >
                  Gesamtpreis automatisch berechnen
                </button>
                {seasonal.total > 0 && (
                  <span className="badge">Vorschlag: {seasonal.total.toFixed(0)} EUR</span>
                )}
              </div>
              <div className="mt-4 text-xs text-ink/70">
                <p>E-Mail: {item.email}</p>
                <p>Telefon: {item.phone ?? "-"}</p>
                <p>Gäste: {item.guests}</p>
                <p>Studio: {item.includesStudio ? "ja" : "nein"}</p>
                <p>Nachricht: {item.message ?? "-"}</p>
              </div>
              {isExpiredHold && (
                <p className="mt-4 text-sm text-amber-700">
                  HOLD ist abgelaufen und wird beim Cleanup entfernt.
                </p>
              )}
              {fieldErrors[item.id] && (
                <p className="mt-4 text-sm text-rose-700">
                  {fieldErrors[item.id]}
                </p>
              )}
              {actionState?.error && (
                <p className="mt-4 text-sm text-rose-700">{actionState.error}</p>
              )}
              {actionState?.success && (
                <p className="mt-4 text-sm text-emerald-700">
                  {actionState.success}
                </p>
              )}
              {(isConfirmed || isRejected) && (
                <p className="mt-4 text-xs text-ink/60">
                  {isConfirmed
                    ? "Status ist final und kann nicht mehr geändert werden."
                    : canReactivate
                    ? "Reservierung kann innerhalb von 48h wieder aktiviert werden."
                    : "Reservierung ist abgelehnt."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
