export type ReservationStatus =
  | "HOLD"
  | "ACCEPTED_AWAITING_PAYMENT"
  | "CONFIRMED"
  | "REJECTED";

export type DayStatus = "FREE" | "BLOCKED" | "HOLD" | "CONFIRMED";

export type DayStatusMap = Record<string, DayStatus>;

export type CountryCode = "DE" | "AT" | "CH" | "OTHER";

export type InquiryPayload = {
  startDate: string;
  endDate: string;
  guests: number;
  includesStudio: boolean;
  countryCode: CountryCode;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  acceptPrivacy: boolean;
  acceptHouseRules: boolean;
  language?: "de" | "en";
};

export type Reservation = {
  id: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  name: string;
  email: string;
  phone?: string;
  guests: number;
  message?: string;
  includesStudio: boolean;
  countryCode?: CountryCode | null;
  holdUntil?: string | null;
  priceTotal?: number | null;
  depositAmount?: number | null;
  paymentDueUntil?: string | null;
  language?: "de" | "en";
  createdAt: string;
};

export type AvailabilityBlock = {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  createdAt: string;
};

export type PricingSeason = {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  pricePerNight: number;
  studioSurchargePerNight: number;
  minNights: number;
  createdAt: string;
};
