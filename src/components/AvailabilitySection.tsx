"use client";

import { useEffect, useMemo, useState } from "react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { buildPlaceholderStatus } from "@/lib/availability";
import type { DayStatusMap } from "@/lib/types";
import type { SeasonDefinition } from "@/lib/seasonPricing";

export function AvailabilitySection({ locale = "de" }: { locale?: "de" | "en" }) {
  const [dayStatus, setDayStatus] = useState<DayStatusMap>(buildPlaceholderStatus());
  const [seasons, setSeasons] = useState<SeasonDefinition[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "FREE" | "BLOCKED" | "HOLD" | "CONFIRMED"
  >("ALL");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/public/availability");
        const data = await response.json();
        if (data?.dayStatus) {
          setDayStatus(data.dayStatus);
        }
        if (data?.seasons) {
          setSeasons(data.seasons);
        }
      } catch {
        setDayStatus(buildPlaceholderStatus());
      }
    }
    load();
  }, []);

  const counts = useMemo(() => {
    const values = Object.values(dayStatus);
    return {
      FREE: values.filter((v) => v === "FREE").length,
      BLOCKED: values.filter((v) => v === "BLOCKED").length,
      HOLD: values.filter((v) => v === "HOLD").length,
      CONFIRMED: values.filter((v) => v === "CONFIRMED").length
    };
  }, [dayStatus]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          className={`badge ${filter === "ALL" ? "border-ink" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          {locale === "en" ? "All" : "Alle"} ({counts.FREE + counts.BLOCKED + counts.HOLD + counts.CONFIRMED})
        </button>
        <button
          type="button"
          className={`badge ${filter === "FREE" ? "border-ink" : ""}`}
          onClick={() => setFilter("FREE")}
        >
          {locale === "en" ? "Free" : "Frei"} ({counts.FREE})
        </button>
        <button
          type="button"
          className={`badge ${filter === "HOLD" ? "border-ink" : ""}`}
          onClick={() => setFilter("HOLD")}
        >
          {locale === "en" ? "On hold" : "Reserviert"} ({counts.HOLD})
        </button>
        <button
          type="button"
          className={`badge ${filter === "CONFIRMED" ? "border-ink" : ""}`}
          onClick={() => setFilter("CONFIRMED")}
        >
          {locale === "en" ? "Booked" : "Belegt"} ({counts.CONFIRMED})
        </button>
        <button
          type="button"
          className={`badge ${filter === "BLOCKED" ? "border-ink" : ""}`}
          onClick={() => setFilter("BLOCKED")}
        >
          {locale === "en" ? "Blocked" : "Gesperrt"} ({counts.BLOCKED})
        </button>
      </div>
      <AvailabilityCalendar dayStatus={dayStatus} filter={filter} seasons={seasons} locale={locale} />
    </div>
  );
}
