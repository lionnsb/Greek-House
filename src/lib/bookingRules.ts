import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 7;
export const STUDIO_MIN_GUESTS = 3;
export const STUDIO_REQUIRED_FROM_GUESTS = 6;
export const APARTMENT_CLEANING_FEE = 150;
export const STUDIO_CLEANING_FEE = 30;
export const SHORT_NOTICE_DAYS = 3;
export const DEPARTURE_BUFFER_DAYS = 1;

export function isGuestCountValid(guests: number) {
  return Number.isInteger(guests) && guests >= MIN_GUESTS && guests <= MAX_GUESTS;
}

export function isStudioSelectable(guests: number) {
  return guests >= STUDIO_MIN_GUESTS;
}

export function isStudioRequired(guests: number) {
  return guests >= STUDIO_REQUIRED_FROM_GUESTS;
}

export function normalizeStudioSelection(guests: number, requested: boolean) {
  if (isStudioRequired(guests)) return true;
  if (!isStudioSelectable(guests)) return false;
  return requested;
}

export function hasShortNotice(startDate: string, now = new Date()) {
  const daysUntilArrival = differenceInCalendarDays(parseISO(startDate), startOfDay(now));
  return daysUntilArrival >= 0 && daysUntilArrival < SHORT_NOTICE_DAYS;
}

export function reservationBlocksUntil(endDate: string) {
  return format(addDays(parseISO(endDate), DEPARTURE_BUFFER_DAYS), "yyyy-MM-dd");
}
