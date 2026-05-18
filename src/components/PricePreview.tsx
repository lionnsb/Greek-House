"use client";

import { calculateSeasonalTotal } from "@/lib/seasonPricing";
import type { SeasonDefinition } from "@/lib/seasonPricing";

export function PricePreview({
  startDate,
  endDate,
  includesStudio,
  seasons,
  locale = "de"
}: {
  startDate: string;
  endDate: string;
  includesStudio: boolean;
  seasons: SeasonDefinition[];
  locale?: "de" | "en";
}) {
  if (!startDate || !endDate || !seasons.length) {
    return (
      <p className="text-sm text-ink/60">
        {locale === "en"
          ? "Select arrival and departure to see a price preview."
          : "Wähle Anreise und Abreise, um eine Preisvorschau zu sehen."}
      </p>
    );
  }

  const pricing = calculateSeasonalTotal({
    startDate,
    endDate,
    includesStudio,
    seasons
  });
  const groupedBySeason = pricing.breakdown.reduce<
    Array<{
      key: string;
      season: string;
      nights: number;
      apartmentPrice: number;
      studioPrice: number;
      total: number;
    }>
  >((acc, item) => {
    const key = `${item.season}__${item.apartmentPrice}__${item.studioPrice}`;
    const existing = acc.find((entry) => entry.key === key);
    if (existing) {
      existing.nights += 1;
      existing.total += item.totalPrice;
      return acc;
    }
    acc.push({
      key,
      season: item.season,
      nights: 1,
      apartmentPrice: item.apartmentPrice,
      studioPrice: item.studioPrice,
      total: item.totalPrice
    });
    return acc;
  }, []);

  const maxMinNights = pricing.breakdown.reduce(
    (max, item) => Math.max(max, item.minNights ?? 1),
    1
  );

  if (pricing.nights === 0) {
    return (
      <p className="text-sm text-ink/60">
        {locale === "en"
          ? "Please choose valid travel dates."
          : "Bitte gültige Reisedaten wählen."}
      </p>
    );
  }

  if (pricing.nights < maxMinNights) {
    return (
      <p className="text-sm text-rose-700">
        {locale === "en"
          ? `Minimum stay: ${maxMinNights} nights. Please adjust your dates.`
          : `Mindestaufenthalt: ${maxMinNights} Nächte. Bitte Zeitraum anpassen.`}
      </p>
    );
  }

  return (
    <div className="text-sm text-ink/70">
      <p>
        {locale === "en" ? "Price breakdown" : "Preisaufschlüsselung"}
      </p>
      <div className="mt-2 space-y-1 text-xs">
        {groupedBySeason.map((entry) => (
          <p key={entry.key}>
            {locale === "en"
              ? `${entry.season}: ${entry.total.toFixed(0)}€ (${entry.nights} nights x ${(entry.apartmentPrice + entry.studioPrice).toFixed(0)}€)`
              : `${entry.season}: ${entry.total.toFixed(0)}€ (${entry.nights} Nächte x ${(entry.apartmentPrice + entry.studioPrice).toFixed(0)}€)`}
          </p>
        ))}
        <p>
          {locale === "en"
            ? `Apartment: ${pricing.apartmentNightlyTotal.toFixed(0)}€ (${pricing.nights} nights)`
            : `Apartment: ${pricing.apartmentNightlyTotal.toFixed(0)}€ (${pricing.nights} Nächte)`}
        </p>
        {includesStudio && (
          <p>
            {locale === "en"
              ? `Studio: ${pricing.studioNightlyTotal.toFixed(0)}€ (${pricing.nights} nights)`
              : `Studio: ${pricing.studioNightlyTotal.toFixed(0)}€ (${pricing.nights} Nächte)`}
          </p>
        )}
        <p>
          {locale === "en"
            ? `Cleaning fee apartment: ${pricing.cleaningApartment.toFixed(0)}€`
            : `Reinigungsgebühr Apartment: ${pricing.cleaningApartment.toFixed(0)}€`}
        </p>
        {includesStudio && (
          <p>
            {locale === "en"
              ? `Cleaning fee studio: ${pricing.cleaningStudio.toFixed(0)}€`
              : `Reinigungsgebühr Studio: ${pricing.cleaningStudio.toFixed(0)}€`}
          </p>
        )}
        <p className="font-semibold text-ink">
          {locale === "en"
            ? `Total: ${pricing.total.toFixed(0)}€`
            : `Gesamtpreis: ${pricing.total.toFixed(0)}€`}
        </p>
      </div>
    </div>
  );
}
