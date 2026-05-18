"use client";

import { useEffect, useMemo, useState } from "react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import {
  isStudioRequired,
  isStudioSelectable,
  normalizeStudioSelection
} from "@/lib/bookingRules";
import { buildPlaceholderStatus } from "@/lib/availability";
import type { DayStatusMap } from "@/lib/types";
import type { SeasonDefinition } from "@/lib/seasonPricing";

export function AvailabilitySection({ locale = "de" }: { locale?: "de" | "en" }) {
  const [dayStatus, setDayStatus] = useState<DayStatusMap>(buildPlaceholderStatus());
  const [seasons, setSeasons] = useState<SeasonDefinition[]>([]);
  const [guests, setGuests] = useState<number>(2);
  const [includesStudio, setIncludesStudio] = useState<boolean>(false);

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

  useEffect(() => {
    setIncludesStudio((prev) => normalizeStudioSelection(guests, prev));
  }, [guests]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">{locale === "en" ? "Guests for calendar price" : "Gäste für Kalenderpreis"}</label>
          <input
            type="number"
            className="input"
            min={1}
            max={7}
            value={guests}
            onChange={(event) => {
              const next = Number(event.target.value);
              const clamped = Number.isFinite(next) ? Math.min(7, Math.max(1, next)) : 1;
              setGuests(clamped);
            }}
          />
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={includesStudio}
            disabled={isStudioRequired(guests) || !isStudioSelectable(guests)}
            onChange={(event) =>
              setIncludesStudio(normalizeStudioSelection(guests, event.target.checked))
            }
          />
          {locale === "en"
            ? "Show prices with studio"
            : "Preise mit Studio anzeigen"}
        </label>
      </div>
      <div className="text-xs text-ink/60">
        {locale === "en"
          ? `Free days: ${counts.FREE}. Non-free days are currently not available.`
          : `Freie Tage: ${counts.FREE}. Nicht freie Tage sind aktuell nicht verfügbar.`}
      </div>
      <AvailabilityCalendar
        dayStatus={dayStatus}
        seasons={seasons}
        locale={locale}
        includesStudio={includesStudio}
        legendStatuses={["FREE"]}
      />
    </div>
  );
}
