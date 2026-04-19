import { isWithinInterval, parseISO } from "date-fns";
import { nightsBetween } from "@/lib/pricing";

export type SeasonDefinition = {
  name: string;
  start: string; // yyyy-MM-dd
  end: string; // yyyy-MM-dd (exclusive)
  pricePerNight: number;
  studioSurchargePerNight: number;
  minNights: number;
};

export function buildSeasonsFromEnv(): SeasonDefinition[] {
  const summerStart = process.env.NEXT_PUBLIC_SUMMER_START ?? "";
  const summerEnd = process.env.NEXT_PUBLIC_SUMMER_END ?? "";
  const winterStart = process.env.NEXT_PUBLIC_WINTER_START ?? "";
  const winterEnd = process.env.NEXT_PUBLIC_WINTER_END ?? "";

  const summerPrice = Number(process.env.NEXT_PUBLIC_SUMMER_PRICE_PER_NIGHT ?? "0");
  const summerStudio = Number(
    process.env.NEXT_PUBLIC_SUMMER_STUDIO_SURCHARGE_PER_NIGHT ?? "0"
  );
  const winterPrice = Number(process.env.NEXT_PUBLIC_WINTER_PRICE_PER_NIGHT ?? "0");
  const winterStudio = Number(
    process.env.NEXT_PUBLIC_WINTER_STUDIO_SURCHARGE_PER_NIGHT ?? "0"
  );
  const standardPrice = Number(process.env.NEXT_PUBLIC_PRICE_PER_NIGHT ?? "0");
  const standardStudio = Number(
    process.env.NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT ?? "0"
  );

  const seasons: SeasonDefinition[] = [];
  if (summerStart && summerEnd) {
    seasons.push({
      name: "summer",
      start: summerStart,
      end: summerEnd,
      pricePerNight: summerPrice || standardPrice,
      studioSurchargePerNight: summerStudio || standardStudio,
      minNights: Number(process.env.NEXT_PUBLIC_SUMMER_MIN_NIGHTS ?? "1")
    });
  }
  if (winterStart && winterEnd) {
    seasons.push({
      name: "winter",
      start: winterStart,
      end: winterEnd,
      pricePerNight: winterPrice || standardPrice,
      studioSurchargePerNight: winterStudio || standardStudio,
      minNights: Number(process.env.NEXT_PUBLIC_WINTER_MIN_NIGHTS ?? "1")
    });
  }
  seasons.push({
    name: "standard",
    start: "1900-01-01",
    end: "3000-01-01",
    pricePerNight: standardPrice,
    studioSurchargePerNight: standardStudio,
    minNights: Number(process.env.NEXT_PUBLIC_STANDARD_MIN_NIGHTS ?? "1")
  });

  return seasons;
}

export function seasonForDate(date: string, seasons: SeasonDefinition[]) {
  const target = parseISO(date);
  for (const season of seasons) {
    const start = parseISO(season.start);
    const endExclusive = parseISO(season.end);
    const endInclusive = new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000);
    if (
      isWithinInterval(target, {
        start,
        end: endInclusive
      })
    ) {
      return season;
    }
  }
  return seasons.find((item) => item.name === "standard") ?? seasons[0];
}

export function calculateSeasonalTotal({
  startDate,
  endDate,
  includesStudio,
  seasons
}: {
  startDate: string;
  endDate: string;
  includesStudio: boolean;
  seasons: SeasonDefinition[];
}) {
  const emptyBreakdown: Array<{
    date: string;
    season: string;
    price: number;
    minNights: number;
  }> = [];

  const nights = nightsBetween(startDate, endDate);
  if (nights === 0) {
    return { nights, total: 0, breakdown: emptyBreakdown };
  }

  const breakdown: Array<{ date: string; season: string; price: number; minNights: number }> = [];
  let cursor = parseISO(startDate);
  for (let i = 0; i < nights; i += 1) {
    const date = cursor.toISOString().slice(0, 10);
    const season = seasonForDate(date, seasons);
    const nightly = season.pricePerNight + (includesStudio ? season.studioSurchargePerNight : 0);
    breakdown.push({ date, season: season.name, price: nightly, minNights: season.minNights });
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }

  const total = breakdown.reduce((sum, item) => sum + item.price, 0);
  return { nights, total, breakdown };
}
