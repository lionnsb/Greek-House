import { differenceInCalendarDays, parseISO } from "date-fns";
import { APARTMENT_CLEANING_FEE, STUDIO_CLEANING_FEE } from "./bookingRules";

export function nightsBetween(startDate: string, endDate: string) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return Math.max(0, differenceInCalendarDays(end, start));
}

export function calculateTotal({
  startDate,
  endDate,
  includesStudio,
  pricePerNight,
  studioSurchargePerNight
}: {
  startDate: string;
  endDate: string;
  includesStudio: boolean;
  pricePerNight: number;
  studioSurchargePerNight: number;
}) {
  const nights = nightsBetween(startDate, endDate);
  const base = nights * pricePerNight;
  const studio = includesStudio ? nights * studioSurchargePerNight : 0;
  const cleaningApartment = nights > 0 ? APARTMENT_CLEANING_FEE : 0;
  const cleaningStudio = includesStudio && nights > 0 ? STUDIO_CLEANING_FEE : 0;
  return {
    nights,
    base,
    studio,
    cleaningApartment,
    cleaningStudio,
    total: base + studio + cleaningApartment + cleaningStudio
  };
}
