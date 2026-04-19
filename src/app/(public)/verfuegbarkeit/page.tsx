"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { supabase } from "@/lib/supabase/client";

type ApiSuccess = { success: true; reservationId: string; holdUntil: string };
type ApiError = { error: string };

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  status: "HOLD" | "ACCEPTED_AWAITING_PAYMENT" | "CONFIRMED" | string;
  includes_studio: boolean;
};

type Block = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
};

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toDateInputValue(d: Date) {
  return toISODate(d);
}

function formatGermanDateTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}
function isBetweenInclusive(day: string, start: string, end: string) {
  return day >= start && day <= end;
}

export default function VerfuegbarkeitPage() {
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(Date.now() + 24 * 60 * 60 * 1000), []);

  // Form state
  const [startDate, setStartDate] = useState<string>(toDateInputValue(today));
  const [endDate, setEndDate] = useState<string>(toDateInputValue(tomorrow));
  const [guests, setGuests] = useState<number>(2);
  const [includesStudio, setIncludesStudio] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ApiSuccess | null>(null);

  // Calendar state
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [calLoading, setCalLoading] = useState(true);
  const [calError, setCalError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Range select via calendar clicks (optional UX)
  const [pickStart, setPickStart] = useState<string>("");
  const [pickEnd, setPickEnd] = useState<string>("");

  const monthStart = useMemo(() => startOfMonth(month), [month]);
  const monthEnd = useMemo(() => endOfMonth(month), [month]);
  const monthStartISO = useMemo(() => toISODate(monthStart), [monthStart]);
  const monthEndISO = useMemo(() => toISODate(monthEnd), [monthEnd]);

  const gridDays = useMemo(() => {
    const first = monthStart;
    const dow = (first.getDay() + 6) % 7; // Monday=0
    const gridStart = addDays(first, -dow);

    const last = monthEnd;
    const dowEnd = (last.getDay() + 6) % 7;
    const gridEnd = addDays(last, 6 - dowEnd);

    const days: string[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) {
      days.push(toISODate(d));
    }
    return days;
  }, [monthStart, monthEnd]);

  function prevMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function dayInfo(day: string) {
    const inMonth = day >= monthStartISO && day <= monthEndISO;

    const dayBlocks = blocks.filter((b) => isBetweenInclusive(day, b.start_date, b.end_date));
    const dayRes = reservations.filter((r) => isBetweenInclusive(day, r.start_date, r.end_date));

    const isBlocked = dayBlocks.length > 0;

    const hasConfirmed = dayRes.some((r) => r.status === "CONFIRMED");
    const hasAccepted = dayRes.some((r) => r.status === "ACCEPTED_AWAITING_PAYMENT");
    const hasHold = dayRes.some((r) => r.status === "HOLD");

    // Priority label
    const label = hasConfirmed
      ? "CONF"
      : isBlocked
      ? "BLOCK"
      : hasAccepted
      ? "PAY"
      : hasHold
      ? "HOLD"
      : "";

    const isUnavailable = hasConfirmed || isBlocked || hasAccepted || hasHold;

    return { inMonth, dayBlocks, dayRes, isBlocked, hasConfirmed, hasAccepted, hasHold, label, isUnavailable };
  }

  function clickDay(day: string) {
    const info = dayInfo(day);
    if (!info.inMonth) return;

    // Optional: allow picking a range by clicking start then end
    if (!pickStart || (pickStart && pickEnd)) {
      setPickStart(day);
      setPickEnd("");
      return;
    }

    // second click sets end
    if (day < pickStart) {
      setPickEnd(pickStart);
      setPickStart(day);
    } else {
      setPickEnd(day);
    }
  }

  function applyPickedRangeToForm() {
    if (!pickStart) return;
    const s = pickStart;
    const e = pickEnd || pickStart;

    // In booking forms, end date is usually "checkout day" (exclusive),
    // so we set Abreise to next day after e.
    const ePlusOne = toISODate(addDays(new Date(e + "T00:00:00"), 1));

    setStartDate(s);
    setEndDate(ePlusOne);

    // clear selection
    setPickStart("");
    setPickEnd("");
  }

  async function loadCalendar() {
    setCalError(null);
    setCalLoading(true);

    try {
      // reservations overlapping this month (also include edge overlaps)
      const { data: resData, error: resErr } = await supabase
        .from("reservations")
        .select("id,start_date,end_date,status,includes_studio")
        .in("status", ["HOLD", "ACCEPTED_AWAITING_PAYMENT", "CONFIRMED"])
        .lte("start_date", monthEndISO)
        .gte("end_date", monthStartISO)
        .order("start_date", { ascending: true });

      if (resErr) {
        setCalError(resErr.message);
        setCalLoading(false);
        return;
      }

      const { data: blockData, error: blockErr } = await supabase
        .from("availability_blocks")
        .select("id,start_date,end_date,reason")
        .lte("start_date", monthEndISO)
        .gte("end_date", monthStartISO)
        .order("start_date", { ascending: true });

      if (blockErr) {
        setCalError(blockErr.message);
        setCalLoading(false);
        return;
      }

      setReservations((resData ?? []) as Reservation[]);
      setBlocks((blockData ?? []) as Block[]);
    } catch {
      setCalError("Kalender konnte nicht geladen werden.");
    } finally {
      setCalLoading(false);
    }
  }

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthStartISO, monthEndISO]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Simple client-side validation
    if (!startDate || !endDate || !name.trim() || !email.trim() || !guests) {
      setError("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    if (!privacyAccepted) {
      setError("Bitte bestätige die Datenschutzerklärung.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("Abreisedatum muss nach dem Anreisedatum liegen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          guests,
          includesStudio,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      const data = (await res.json()) as ApiSuccess | ApiError;

      if (!res.ok) {
        setError("error" in data ? data.error : "Fehler beim Senden der Anfrage.");
        return;
      }

      setSuccess(data as ApiSuccess);
      setMessage("");

      // Refresh calendar so user sees HOLD immediately
      loadCalendar();
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Verfügbarkeit & Anfrage</h1>
          <p className="text-gray-600">
            Du stellst eine Anfrage – wir melden uns per E-Mail. Keine Online-Zahlung.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Kalender */}
          <div className="rounded-3xl border p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Kalender</h2>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={prevMonth}
                  type="button"
                >
                  ←
                </button>
                <div className="text-sm font-medium">{monthLabel(monthStart)}</div>
                <button
                  className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={nextMonth}
                  type="button"
                >
                  →
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              <span className="rounded-full border px-3 py-1">frei</span>
              <span className="rounded-full border px-3 py-1 bg-gray-50">blockiert</span>
              <span className="rounded-full border px-3 py-1 bg-black text-white">belegt</span>
              <span className="rounded-full border px-3 py-1">hold/zahlung</span>
            </div>

            {calError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                {calError}
              </div>
            )}

            {calLoading ? (
              <div className="text-sm text-gray-600">Lade Kalender…</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((x) => (
                  <div key={x} className="text-xs text-gray-500 px-1">
                    {x}
                  </div>
                ))}

                {gridDays.map((day) => {
                  const info = dayInfo(day);
                  const selected =
                    (pickStart && day === pickStart) ||
                    (pickEnd && day === pickEnd) ||
                    (pickStart && pickEnd && day > pickStart && day < pickEnd);

                  const base =
                    "rounded-2xl border p-2 text-sm select-none transition";
                  const inMonthStyle = info.inMonth ? "" : " opacity-40";
                  const selectedStyle = selected ? " ring-2 ring-black" : "";
                  const blockedStyle = info.isBlocked ? " bg-gray-50" : " bg-white";
                  const bookedStyle = info.hasConfirmed ? " bg-black text-white" : "";
                  const hoverStyle = info.inMonth ? " hover:bg-gray-50" : "";
                  const cursor = info.inMonth ? " cursor-pointer" : " cursor-default";

                  return (
                    <div
                      key={day}
                      onClick={() => info.inMonth && clickDay(day)}
                      className={base + cursor + inMonthStyle + selectedStyle + blockedStyle + bookedStyle + hoverStyle}
                      title={day}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{day.slice(-2)}</div>
                        <div className="text-[10px] opacity-80">{info.label}</div>
                      </div>

                      {/* mini hint */}
                      <div className="mt-2 text-[11px] text-gray-600">
                        {!info.hasConfirmed && info.isBlocked && (info.dayBlocks[0]?.reason || "Blockiert")}
                        {!info.hasConfirmed && !info.isBlocked && (info.hasAccepted || info.hasHold) && "Reserviert"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={applyPickedRangeToForm}
                disabled={!pickStart}
                className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                Auswahl übernehmen
              </button>
              <button
                type="button"
                onClick={() => {
                  setPickStart("");
                  setPickEnd("");
                }}
                className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Auswahl löschen
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Tipp: Klicke Start- und Endtag im Kalender und übernimm die Auswahl ins Formular.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-3xl border p-6">
            <h2 className="font-semibold">Anfrage stellen</h2>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                <div className="font-medium">Anfrage gesendet ✅</div>
                <div className="mt-1">
                  Wir halten den Zeitraum vorläufig frei bis:{" "}
                  <span className="font-medium">{formatGermanDateTime(success.holdUntil)}</span>
                </div>
                <div className="mt-1 text-green-900/80">
                  Referenz: <span className="font-mono">{success.reservationId}</span>
                </div>
              </div>
            )}

            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-700">Anreise *</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Abreise *</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-700">Gäste *</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value || "1", 10))}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includesStudio}
                  onChange={(e) => setIncludesStudio(e.target.checked)}
                />
                Studio zusätzlich buchen (nur zusammen mit dem Haus)
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-700">Name *</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">E-Mail *</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-700">Telefon (optional)</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Nachricht (optional)</label>
                <textarea
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                />
                <span>Ich habe die Datenschutzerklärung gelesen und akzeptiere sie. *</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-black px-5 py-2.5 text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sende Anfrage..." : "Anfrage senden"}
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500">
              Hinweis: Die Zahlung erfolgt nicht online, sondern später per E-Mail & Überweisung.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
