"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getSession } from "@/lib/supabase/auth";

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  hold_until: string | null;

  includes_studio: boolean;

  name: string;
  email: string;
  phone: string | null;
  guests: number;
  message: string | null;

  price_total: number | null;
  deposit_amount: number | null;
  payment_due_until: string | null;

  created_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("de-DE");
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("de-DE");
}

function toDateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function AdminAnfragenPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Accept-Form State pro selected reservation
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [priceTotal, setPriceTotal] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [paymentDueLocal, setPaymentDueLocal] = useState<string>("");

  const defaultDueLocal = useMemo(() => {
    // Default: 48h ab jetzt (MVP hardcoded)
    const d = new Date(Date.now() + 48 * 60 * 60 * 1000);
    return toDateTimeLocalValue(d);
  }, []);

  async function load() {
    setError(null);
    setLoading(true);

    const { data: sessionData } = await getSession();
    if (!sessionData.session) {
      router.push("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    setItems((data ?? []) as Reservation[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function getAccessTokenOrThrow() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) {
      throw new Error("Nicht eingeloggt.");
    }
    return data.session.access_token;
  }

  async function reject(id: string) {
    setActionLoading(id);
    setError(null);

    try {
      const accessToken = await getAccessTokenOrThrow();

      const res = await fetch("/api/admin/reservations/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, reservationId: id }),
      });

      const data = await res.json();
      setActionLoading(null);

      if (!res.ok) {
        setError(data?.error || "Fehler beim Ablehnen.");
        return;
      }

      // close accept form if open
      if (acceptId === id) setAcceptId(null);
      load();
    } catch (e: any) {
      setActionLoading(null);
      setError(e?.message || "Fehler beim Ablehnen.");
    }
  }

  function openAcceptForm(r: Reservation) {
    setAcceptId(r.id);
    setPriceTotal(r.price_total?.toString() ?? "");
    setDepositAmount(r.deposit_amount?.toString() ?? "");
    setPaymentDueLocal(
      r.payment_due_until
        ? toDateTimeLocalValue(new Date(r.payment_due_until))
        : defaultDueLocal
    );
  }

  function closeAcceptForm() {
    setAcceptId(null);
    setPriceTotal("");
    setDepositAmount("");
    setPaymentDueLocal("");
  }

  async function accept(id: string) {
    setError(null);

    // Validation
    const price = priceTotal.trim() ? Number(priceTotal) : NaN;
    if (!Number.isFinite(price) || price <= 0) {
      setError("Bitte einen gültigen Gesamtpreis eingeben.");
      return;
    }

    const deposit = depositAmount.trim() ? Number(depositAmount) : null;
    if (depositAmount.trim() && (!Number.isFinite(deposit!) || deposit! < 0)) {
      setError("Bitte eine gültige Anzahlung eingeben (oder leer lassen).");
      return;
    }

    if (!paymentDueLocal) {
      setError("Bitte eine Zahlungsfrist setzen.");
      return;
    }

    const dueIso = new Date(paymentDueLocal).toISOString();

    setActionLoading(id);
    try {
      const accessToken = await getAccessTokenOrThrow();

      const res = await fetch("/api/admin/reservations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          reservationId: id,
          priceTotal: price,
          depositAmount: deposit,
          paymentDueUntilIso: dueIso,
        }),
      });

      const data = await res.json();
      setActionLoading(null);

      if (!res.ok) {
        setError(data?.error || "Fehler beim Annehmen.");
        return;
      }

      closeAcceptForm();
      load();
    } catch (e: any) {
      setActionLoading(null);
      setError(e?.message || "Fehler beim Annehmen.");
    }
  }

  async function markPaid(id: string) {
    setActionLoading(id);
    setError(null);

    const { error } = await supabase
      .from("reservations")
      .update({ status: "CONFIRMED" })
      .eq("id", id);

    setActionLoading(null);

    if (error) {
      setError(error.message);
      return;
    }

    load();
  }

  if (loading) return <div className="py-10 text-sm text-gray-600">Lade Anfragen…</div>;

  return (
    <div className="py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Anfragen</h1>
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

      {items.length === 0 && (
        <div className="rounded-2xl border p-6 text-sm text-gray-600">
          Keine Anfragen vorhanden.
        </div>
      )}

      <div className="space-y-4">
        {items.map((r) => (
          <div key={r.id} className="rounded-3xl border p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-medium">
                {formatDate(r.start_date)} → {formatDate(r.end_date)}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full border px-3 py-1">{r.status}</span>

                {r.hold_until && r.status === "HOLD" && (
                  <span className="text-gray-500">
                    Hold bis {formatDateTime(r.hold_until)}
                  </span>
                )}

                {r.payment_due_until && r.status === "ACCEPTED_AWAITING_PAYMENT" && (
                  <span className="text-gray-500">
                    Zahlung bis {formatDateTime(r.payment_due_until)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-sm space-y-1">
                <div><strong>Name:</strong> {r.name}</div>
                <div><strong>E-Mail:</strong> {r.email}</div>
                {r.phone && <div><strong>Telefon:</strong> {r.phone}</div>}
                <div><strong>Gäste:</strong> {r.guests}</div>
                <div><strong>Studio:</strong> {r.includes_studio ? "Ja" : "Nein"}</div>

                {(r.price_total || r.deposit_amount) && (
                  <div className="pt-2 text-sm text-gray-700">
                    {r.price_total != null && (
                      <div><strong>Preis:</strong> {r.price_total.toFixed(2)} €</div>
                    )}
                    {r.deposit_amount != null && (
                      <div><strong>Anzahlung:</strong> {r.deposit_amount.toFixed(2)} €</div>
                    )}
                  </div>
                )}
              </div>

              {r.message && (
                <div className="text-sm">
                  <strong>Nachricht:</strong>
                  <div className="mt-1 whitespace-pre-line rounded-2xl bg-gray-50 p-3">
                    {r.message}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {r.status === "HOLD" && (
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={actionLoading === r.id}
                  onClick={() => openAcceptForm(r)}
                  className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  Annehmen…
                </button>

                <button
                  disabled={actionLoading === r.id}
                  onClick={() => reject(r.id)}
                  className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Ablehnen
                </button>
              </div>
            )}

            {r.status === "ACCEPTED_AWAITING_PAYMENT" && (
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={actionLoading === r.id}
                  onClick={() => markPaid(r.id)}
                  className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  Zahlung bestätigt → CONFIRMED
                </button>

                <button
                  disabled={actionLoading === r.id}
                  onClick={() => reject(r.id)}
                  className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Stornieren/Ablehnen
                </button>
              </div>
            )}

            {/* Accept Form */}
            {acceptId === r.id && r.status === "HOLD" && (
              <div className="rounded-2xl border bg-gray-50 p-4 space-y-3">
                <div className="font-medium">Annahme: Preis & Zahlungsfrist</div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-sm text-gray-700">Gesamtpreis (€) *</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
                      value={priceTotal}
                      onChange={(e) => setPriceTotal(e.target.value)}
                      placeholder="z.B. 1200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Anzahlung (€)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="optional"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Zahlungsfrist *</label>
                    <input
                      type="datetime-local"
                      className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
                      value={paymentDueLocal}
                      onChange={(e) => setPaymentDueLocal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={actionLoading === r.id}
                    onClick={() => accept(r.id)}
                    className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Jetzt annehmen
                  </button>

                  <button
                    disabled={actionLoading === r.id}
                    onClick={closeAcceptForm}
                    className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                </div>

                <div className="text-xs text-gray-600">
                  Tipp: Sobald du später E-Mails aktivierst, schicken wir bei „Jetzt annehmen“ automatisch Preis + IBAN + Frist.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
