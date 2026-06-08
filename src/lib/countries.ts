import type { CountryCode } from "./types";

const COUNTRY_LABELS = {
  de: {
    DE: "Deutschland",
    AT: "Österreich",
    CH: "Schweiz",
    OTHER: "Anderes Land"
  },
  en: {
    DE: "Germany",
    AT: "Austria",
    CH: "Switzerland",
    OTHER: "Other country"
  }
} as const satisfies Record<"de" | "en", Record<CountryCode, string>>;

export const COUNTRY_CODES = ["DE", "AT", "CH", "OTHER"] as const;

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && COUNTRY_CODES.includes(value as CountryCode);
}

export function getCountryOptions(locale: "de" | "en" = "de") {
  const labels = COUNTRY_LABELS[locale];
  return COUNTRY_CODES.map((value) => ({
    value,
    label: labels[value]
  }));
}

export function getCountryLabel(
  countryCode?: CountryCode | null,
  locale: "de" | "en" = "de"
) {
  if (!countryCode) {
    return locale === "en" ? "Not set" : "Nicht gesetzt";
  }

  return COUNTRY_LABELS[locale][countryCode];
}
