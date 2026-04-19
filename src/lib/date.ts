import { addDays, format, parseISO } from "date-fns";

export function dateKeysBetween(startDate: string, endDate: string) {
  const keys: string[] = [];
  let cursor = parseISO(startDate);
  const end = parseISO(endDate);
  while (cursor < end) {
    keys.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
  }
  return keys;
}
