"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getSession } from "@/lib/supabase/auth";

/* =======================
   Types
======================= */
type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  name: string;
  guests: number;
  includes_studio: boolean;
};

type Block = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
};

/* =======================
   Helpers
======================= */
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function isBetweenInclusive(day: string, start: string, end: string) {
  return day >= start && day <= end;
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

/* =======================
   Page
======================= */
export default function AdminKalenderPage() {
  const router = useRouter();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // 🔑 WICHTIG: Date-Picker States
  const [selectStart, setSelectStart] = useState<string>("");
  const [selectEnd, setSelectEnd] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const monthStart = useMemo(() => startOfMonth(month), [month]);
  const monthEnd = useMemo(() => endOfMonth(month), [month]);
  const monthStartISO = useMemo(() => toISODate(monthStart), [monthStart]);
  const monthEndISO = useMemo(() => toISODate(monthEnd), [monthEnd]);

  /* =======================
     Calendar grid
  ======================= */
  const gridDays = useMemo(() => {
    const first = monthStart;
    const dow = (first.getDay() + 6) % 7; // Monday = 0
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

  /* =======================
     Auth & Load
  ======================= */
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

    if (!(await ensureAuth())) return;

    const { data: resData, error: resErr } = await supabase
      .from("reservations")
      .select("id,start_date,end_date,status,name,guests,includes_studio")
      .in("status", ["HOLD", "ACCEPTED_AWAITING_PAYMENT", "CONFIRMED"]);

    if (resErr) {
      setError(resErr.message);
      setLoading(false);
      return;
    }

    const { data: blockData, error: blockErr } = await supabase
      .from("availability_blocks")
      .select("id,start_date,end_date,reason")
      .lte("start_date", monthEndISO)
      .gte("end_date", monthStartISO);

    if (blockErr) {
      setError(blockErr.message);
      setLoading(false);
      return;
    }

    setReservations(resData ?? []);
    setBlocks(blockData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [monthStartISO, monthEndISO]);

  /* =======================
     Day logic
  ======================= */
  function dayInfo(day: string) {
    const inMonth = day >= monthStartISO && day <= monthEndISO;
    const isBlocked = blocks.some((b) =>
      isBetweenInclusive(day, b.start_date, b.end_date)
    );
    const isBooked = reservations.some(
      (r) =>
        r.status === "CONFIRMED" &&
        isBetweenInclusive(day, r.start_date, r.end_date)
    );

    return { inMonth, isBlocked, isBooked };
  }

  function clickDay(day: string) {
    if (!selectStart || selectEnd) {
      setSelectStart(day);
      setSelectEnd(day);
    } else {
      if (day < selectStart) {
        setSelectStart(day);
      } else {
        setSelectEnd(day);
      }
    }
  }

  /* =======================
     Block CRUD
  ======================= */
  async function createBlock() {
    setError(null);
    if (!selectStart || !selectEnd) {
      setError("Bitte Start- und Enddatum auswählen.");
      return;
    }

    const overlapConfirmed = reservations.some(
      (r) =>
        r.status === "CONFIRMED" &&
        !(selectEnd < r.start_date || selectStart > r.end_date)
    );
    if (overlapConfirmed) {
      setError("Überschneidung mit bestätigter Buchung.");
      return;
    }

    const { error } = await supabase.from("availability_blocks").insert({
      start_date: selectStart,
      end_date: selectEnd,
      reason: reason || null,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSelectStart("");
    setSelectEnd("");
    setReason("");
    load();
  }

  async function deleteBlock(id: string) {
    await supabase.from("availability_blocks").delete().eq("id", id);
    load();
  }

  /* =======================
     Render
  ======================= */
  if (loading) return <div className="py-10 text-sm">Lade Kalender…</div>;

  return (
    <div className="py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Kalender</h1>
        <div className="flex gap-2">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button>
          <div>{monthLabel(month)}</div>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {gridDays.map((day) => {
          const info = dayInfo(day);
          return (
            <div
              key={day}
              onClick={() => info.inMonth && clickDay(day)}
              className={`p-2 border rounded cursor-pointer ${
                info.isBooked ? "bg-black text-white" :
                info.isBlocked ? "bg-gray-200" : ""
              }`}
            >
              {day.slice(-2)}
            </div>
          );
        })}
      </div>

      {/* Block controls – DATE PICKER FIX */}
      <div className="border rounded-3xl p-6 space-y-4">
        <h2 className="font-medium">Zeitraum blocken</h2>

        <div className="grid md:grid-cols-3 gap-3">
          <input type="date" value={selectStart} onChange={(e) => setSelectStart(e.target.value)} />
          <input type="date" value={selectEnd} onChange={(e) => setSelectEnd(e.target.value)} />
          <input placeholder="Grund (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button onClick={createBlock} className="bg-black text-white px-4 py-2 rounded-full">
            Block speichern
          </button>
          <button onClick={() => { setSelectStart(""); setSelectEnd(""); setReason(""); }}>
            Zurücksetzen
          </button>
        </div>

        {blocks.map((b) => (
          <div key={b.id} className="flex justify-between text-sm">
            <span>{b.start_date} → {b.end_date} {b.reason && `(${b.reason})`}</span>
            <button onClick={() => deleteBlock(b.id)}>Entfernen</button>
          </div>
        ))}
      </div>
    </div>
  );
}
