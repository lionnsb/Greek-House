"use client";

import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo, useState } from "react";
import type { DayStatusMap } from "@/lib/types";
import type { SeasonDefinition } from "@/lib/seasonPricing";
import { seasonForDate } from "@/lib/seasonPricing";

const statusStyles: Record<string, string> = {
  FREE: "bg-emerald-50 text-emerald-900 border-emerald-200",
  BLOCKED: "bg-slate-200 text-slate-800 border-slate-300",
  HOLD: "bg-amber-50 text-amber-900 border-amber-200",
  CONFIRMED: "bg-rose-50 text-rose-900 border-rose-200"
};

const statusLabelsDe: Record<string, string> = {
  FREE: "Frei",
  BLOCKED: "Gesperrt",
  HOLD: "Reserviert",
  CONFIRMED: "Belegt"
};

const statusLabelsEn: Record<string, string> = {
  FREE: "Free",
  BLOCKED: "Blocked",
  HOLD: "On hold",
  CONFIRMED: "Booked"
};

export function AvailabilityCalendar({
  initialMonth = new Date(),
  dayStatus,
  filter = "ALL",
  seasons = [],
  locale = "de"
}: {
  initialMonth?: Date;
  dayStatus: DayStatusMap;
  filter?: "ALL" | "FREE" | "BLOCKED" | "HOLD" | "CONFIRMED";
  seasons?: SeasonDefinition[];
  locale?: "de" | "en";
}) {
  const [month, setMonth] = useState(startOfMonth(initialMonth));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfMonth(month);
    const list: Date[] = [];
    let cursor = start;
    while (cursor <= end || list.length % 7 !== 0) {
      list.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return list;
  }, [month]);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-outline"
          onClick={() => setMonth(addDays(month, -30))}
        >
          Zurück
        </button>
        <p className="text-sm font-semibold">
          {format(month, "MMMM yyyy", { locale: de })}
        </p>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setMonth(addDays(month, 30))}
        >
          Weiter
        </button>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 text-xs">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div key={day} className="text-center text-ink/60">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const status = dayStatus[key] ?? "FREE";
          if (filter !== "ALL" && status !== filter) {
            return (
              <div
                key={key}
                className="rounded-lg border border-transparent px-2 py-3 text-center text-xs text-transparent"
              >
                <div className="font-semibold">{format(day, "d")}</div>
                <div className="mt-1 text-[10px]">.</div>
              </div>
            );
          }
          const style = statusStyles[status] ?? statusStyles.FREE;
          const season = seasons.length ? seasonForDate(key, seasons) : null;
          const price =
            season && season.pricePerNight
              ? `${season.pricePerNight}€`
              : "";
          const minStay =
            season && season.minNights ? ` · Min. ${season.minNights}N` : "";
          const statusLabel =
            locale === "en" ? statusLabelsEn[status] : statusLabelsDe[status];
          return (
            <div
              key={key}
              className={`rounded-lg border px-2 py-3 text-center text-xs ${style}`}
              title={`${format(day, "dd.MM.yyyy")}: ${statusLabel}${price ? ` · ${price}` : ""}${minStay}`}
            >
              <div className="font-semibold">{format(day, "d")}</div>
              <div className="mt-1 text-[10px] uppercase">{status}</div>
              {price && (
                <div className="mt-1 text-[10px] text-ink/70">{price}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink/70">
        <span className="badge">FREE</span>
        <span className="badge">BLOCKED</span>
        <span className="badge">HOLD</span>
        <span className="badge">CONFIRMED</span>
      </div>
    </div>
  );
}
