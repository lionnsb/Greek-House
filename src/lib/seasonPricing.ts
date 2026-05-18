import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  APARTMENT_CLEANING_FEE,
  STUDIO_CLEANING_FEE
} from "@/lib/bookingRules";
import { nightsBetween } from "@/lib/pricing";

export type SeasonDefinition = {
  name: string;
  start: string; // yyyy-MM-dd (inclusive)
  end: string; // yyyy-MM-dd (inclusive)
  pricePerNight: number;
  studioSurchargePerNight: number;
  minNights: number;
  createdAt?: string;
};

function normalizeSeasonName(name: string) {
  return name.trim().toLowerCase();
}

function isFallbackStandardSeason(season: SeasonDefinition) {
  return (
    normalizeSeasonName(season.name) === "standard" &&
    season.start === "1900-01-01" &&
    season.end === "3000-01-01"
  );
}

function seasonPriority(season: SeasonDefinition) {
  const normalized = normalizeSeasonName(season.name);
  if (isFallbackStandardSeason(season)) return -100;
  if (normalized === "standard") return 35;
  if (normalized === "hauptsaison" || normalized === "highseason" || normalized === "sommer") {
    return 50;
  }
  if (normalized === "vorsaison" || normalized === "preseason") return 40;
  if (normalized === "nachsaison" || normalized === "postseason") return 30;
  if (normalized === "winter") return 20;
  return 10;
}

function seasonSpanDays(season: SeasonDefinition) {
  return Math.max(
    1,
    differenceInCalendarDays(parseISO(season.end), parseISO(season.start)) + 1
  );
}

function sortSeasonCandidates(seasons: SeasonDefinition[]) {
  return [...seasons].sort((a, b) => {
    const priorityDelta = seasonPriority(b) - seasonPriority(a);
    if (priorityDelta !== 0) return priorityDelta;
    const spanDelta = seasonSpanDays(a) - seasonSpanDays(b);
    if (spanDelta !== 0) return spanDelta;
    const createdAtA = a.createdAt ?? "";
    const createdAtB = b.createdAt ?? "";
    if (createdAtA !== createdAtB) return createdAtA < createdAtB ? 1 : -1;
    if (a.start === b.start) return 0;
    return a.start < b.start ? 1 : -1;
  });
}

function isDateInsideSeason(date: string, season: SeasonDefinition) {
  return date >= season.start && date <= season.end;
}

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
      name: "Hauptsaison",
      start: summerStart,
      end: summerEnd,
      pricePerNight: summerPrice || standardPrice,
      studioSurchargePerNight: summerStudio || standardStudio,
      minNights: Number(process.env.NEXT_PUBLIC_SUMMER_MIN_NIGHTS ?? "1")
    });
  }
  if (winterStart && winterEnd) {
    seasons.push({
      name: "Winter",
      start: winterStart,
      end: winterEnd,
      pricePerNight: winterPrice || standardPrice,
      studioSurchargePerNight: winterStudio || standardStudio,
      minNights: Number(process.env.NEXT_PUBLIC_WINTER_MIN_NIGHTS ?? "1")
    });
  }
  seasons.push({
    name: "Standard",
    start: "1900-01-01",
    end: "3000-01-01",
    pricePerNight: standardPrice,
    studioSurchargePerNight: standardStudio,
    minNights: Number(process.env.NEXT_PUBLIC_STANDARD_MIN_NIGHTS ?? "1")
  });

  return seasons;
}

export function seasonForDate(date: string, seasons: SeasonDefinition[]) {
  const matched = sortSeasonCandidates(seasons).find((season) =>
    isDateInsideSeason(date, season)
  );
  if (matched) return matched;
  return seasons.find((item) => normalizeSeasonName(item.name) === "standard") ?? null;
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
    apartmentPrice: number;
    studioPrice: number;
    totalPrice: number;
    minNights: number;
  }> = [];

  const nights = nightsBetween(startDate, endDate);
  if (nights === 0) {
    return {
      nights,
      apartmentNightlyTotal: 0,
      studioNightlyTotal: 0,
      cleaningApartment: 0,
      cleaningStudio: 0,
      total: 0,
      breakdown: emptyBreakdown
    };
  }

  const breakdown: Array<{
    date: string;
    season: string;
    apartmentPrice: number;
    studioPrice: number;
    totalPrice: number;
    minNights: number;
  }> = [];

  let cursor = parseISO(startDate);
  for (let i = 0; i < nights; i += 1) {
    // Use local calendar day formatting to avoid UTC timezone drift.
    const date = format(cursor, "yyyy-MM-dd");
    const season = seasonForDate(date, seasons);
    const apartmentPrice = season?.pricePerNight ?? 0;
    const studioPrice = includesStudio ? season?.studioSurchargePerNight ?? 0 : 0;
    const totalPrice = apartmentPrice + studioPrice;
    breakdown.push({
      date,
      season: season?.name ?? "Standard",
      apartmentPrice,
      studioPrice,
      totalPrice,
      minNights: season?.minNights ?? 1
    });
    cursor = addDays(cursor, 1);
  }

  const apartmentNightlyTotal = breakdown.reduce((sum, item) => sum + item.apartmentPrice, 0);
  const studioNightlyTotal = breakdown.reduce((sum, item) => sum + item.studioPrice, 0);
  const cleaningApartment = APARTMENT_CLEANING_FEE;
  const cleaningStudio = includesStudio ? STUDIO_CLEANING_FEE : 0;
  const total =
    apartmentNightlyTotal + studioNightlyTotal + cleaningApartment + cleaningStudio;

  return {
    nights,
    apartmentNightlyTotal,
    studioNightlyTotal,
    cleaningApartment,
    cleaningStudio,
    total,
    breakdown
  };
}
