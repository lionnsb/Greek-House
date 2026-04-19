import { addDays, format } from "date-fns";
import type { DayStatusMap } from "@/lib/types";

export function buildPlaceholderStatus(): DayStatusMap {
  const today = new Date();
  const map: DayStatusMap = {};
  for (let i = 0; i < 30; i += 1) {
    const date = addDays(today, i);
    const key = format(date, "yyyy-MM-dd");
    if (i % 11 === 0) map[key] = "BLOCKED";
    if (i % 7 === 0) map[key] = "HOLD";
    if (i % 13 === 0) map[key] = "CONFIRMED";
  }
  return map;
}
