import { differenceInCalendarDays, parseISO } from "date-fns";

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
  return { nights, base, studio, total: base + studio };
}
