import type { CountryCode } from "./types";

export type BankAccount = {
  iban: string;
  bic: string;
  owner: string;
};

function readDefaultBankAccount(): BankAccount {
  return {
    iban: process.env.BANK_DEFAULT_IBAN ?? process.env.BANK_IBAN ?? "",
    bic: process.env.BANK_DEFAULT_BIC ?? process.env.BANK_BIC ?? "",
    owner: process.env.BANK_DEFAULT_OWNER ?? process.env.BANK_OWNER ?? ""
  };
}

function readSwissBankAccount(): BankAccount | null {
  const iban = process.env.BANK_CH_IBAN;
  const bic = process.env.BANK_CH_BIC;
  const owner = process.env.BANK_CH_OWNER;

  if (!iban || !bic || !owner) {
    return null;
  }

  return { iban, bic, owner };
}

export function resolveBankAccount(countryCode?: CountryCode | null): BankAccount {
  if (countryCode === "CH") {
    return readSwissBankAccount() ?? readDefaultBankAccount();
  }

  return readDefaultBankAccount();
}
