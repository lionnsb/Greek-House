import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  APARTMENT_CLEANING_FEE,
  STUDIO_CLEANING_FEE
} from "./bookingRules";
import { nightsBetween } from "./pricing";

export type SeasonSource = "admin" | "env" | "fallback";

const FALLBACK_STANDARD_START = "1900-01-01";
const FALLBACK_STANDARD_END = "3000-01-01";

export type SeasonDefinition = {
  name: string;
  start: string; // yyyy-MM-dd (inclusive)
  end: string; // yyyy-MM-dd (inclusive)
  pricePerNight: number;
  studioSurchargePerNight: number;
  minNights: number;
  createdAt?: string;
  source?: SeasonSource;
};

function isFallbackStandardSeason(season: SeasonDefinition) {
  return season.source === "fallback";
}

function seasonSpanDays(season: SeasonDefinition) {
  return Math.max(
    1,
    differenceInCalendarDays(parseISO(season.end), parseISO(season.start)) + 1
  );
}

function isDateInsideSeason(date: string, season: SeasonDefinition) {
  return date >= season.start && date <= season.end;
}

function compareSeasonCandidates(a: SeasonDefinition, b: SeasonDefinition) {
  const createdAtA = a.createdAt ?? "";
  const createdAtB = b.createdAt ?? "";
  if (createdAtA !== createdAtB) return createdAtA < createdAtB ? 1 : -1;

  const spanDelta = seasonSpanDays(a) - seasonSpanDays(b);
  if (spanDelta !== 0) return spanDelta;

  if (a.start === b.start) return 0;
  return a.start < b.start ? 1 : -1;
}

function baseSeasonValuesFromEnv() {
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

  return {
    summerStart,
    summerEnd,
    winterStart,
    winterEnd,
    summerPrice,
    summerStudio,
    winterPrice,
    winterStudio,
    standardPrice,
    standardStudio
  };
}

export function buildStandardFallbackSeason(): SeasonDefinition {
  const values = baseSeasonValuesFromEnv();

  return {
    name: "Standard",
    start: FALLBACK_STANDARD_START,
    end: FALLBACK_STANDARD_END,
    pricePerNight: values.standardPrice,
    studioSurchargePerNight: values.standardStudio,
    minNights: Number(process.env.NEXT_PUBLIC_STANDARD_MIN_NIGHTS ?? "1"),
    source: "fallback"
  };
}

export function buildSeasonsFromEnv(): SeasonDefinition[] {
  const values = baseSeasonValuesFromEnv();

  const seasons: SeasonDefinition[] = [];
  if (values.summerStart && values.summerEnd) {
    seasons.push({
      name: "Hauptsaison",
      start: values.summerStart,
      end: values.summerEnd,
      pricePerNight: values.summerPrice || values.standardPrice,
      studioSurchargePerNight: values.summerStudio || values.standardStudio,
      minNights: Number(process.env.NEXT_PUBLIC_SUMMER_MIN_NIGHTS ?? "1"),
      source: "env"
    });
  }
  if (values.winterStart && values.winterEnd) {
    seasons.push({
      name: "Winter",
      start: values.winterStart,
      end: values.winterEnd,
      pricePerNight: values.winterPrice || values.standardPrice,
      studioSurchargePerNight: values.winterStudio || values.standardStudio,
      minNights: Number(process.env.NEXT_PUBLIC_WINTER_MIN_NIGHTS ?? "1"),
      source: "env"
    });
  }
  seasons.push({
    name: "Standard",
    start: FALLBACK_STANDARD_START,
    end: FALLBACK_STANDARD_END,
    pricePerNight: values.standardPrice,
    studioSurchargePerNight: values.standardStudio,
    minNights: Number(process.env.NEXT_PUBLIC_STANDARD_MIN_NIGHTS ?? "1"),
    source: "env"
  });

  return seasons;
}

export function buildSeasonCatalog(adminSeasons: SeasonDefinition[]) {
  if (!adminSeasons.length) {
    return buildSeasonsFromEnv();
  }

  return [
    ...adminSeasons.map((season) => ({
      ...season,
      source: season.source ?? "admin"
    })),
    buildStandardFallbackSeason()
  ];
}

export function seasonForDate(date: string, seasons: SeasonDefinition[]) {
  const matched = seasons.filter((season) => isDateInsideSeason(date, season));
  const specificMatches = matched.filter((season) => !isFallbackStandardSeason(season));
  const candidates = specificMatches.length ? specificMatches : matched;

  return [...candidates].sort(compareSeasonCandidates)[0] ?? null;
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
