import type { PricingSeason } from "./types";
import {
  FALLBACK_STANDARD_END,
  FALLBACK_STANDARD_START,
  type SeasonDefinition
} from "./seasonPricing";

export function mapDbSeasons(items: PricingSeason[]): SeasonDefinition[] {
  if (!items.length) return [];
  return items.map((item) => ({
    name: item.name,
    start: item.startDate ?? FALLBACK_STANDARD_START,
    end: item.endDate ?? FALLBACK_STANDARD_END,
    pricePerNight: item.pricePerNight,
    studioSurchargePerNight: item.studioSurchargePerNight,
    minNights: item.minNights,
    createdAt: item.createdAt,
    source:
      item.name === "Standard" && !item.startDate && !item.endDate
        ? ("baseline" as const)
        : ("admin" as const)
  }));
}
