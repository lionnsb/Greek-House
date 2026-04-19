import type { PricingSeason } from "@/lib/types";
import type { SeasonDefinition } from "@/lib/seasonPricing";

export function mapDbSeasons(items: PricingSeason[]): SeasonDefinition[] {
  if (!items.length) return [];
  return items.map((item) => ({
    name: item.name,
    start: item.startDate,
    end: item.endDate,
    pricePerNight: item.pricePerNight,
    studioSurchargePerNight: item.studioSurchargePerNight,
    minNights: item.minNights
  }));
}
