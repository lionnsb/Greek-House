import type { CountryCode } from "./types";

export type BankAccount = {
  iban: string;
  bic: string;
  owner: string;
};

function firstNonBlank(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() ?? "").find(Boolean) ?? "";
}

function requireCompleteBankAccount(
  account: BankAccount,
  label: string
): BankAccount {
  const missing = [
    !account.iban && "IBAN",
    !account.bic && "BIC",
    !account.owner && "Kontoinhaber"
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Bankverbindung für ${label} ist unvollständig: ${missing.join(", ")}.`
    );
  }

  return account;
}

function readDefaultBankAccount(): BankAccount {
  return {
    iban: firstNonBlank(process.env.BANK_DEFAULT_IBAN, process.env.BANK_IBAN),
    bic: firstNonBlank(process.env.BANK_DEFAULT_BIC, process.env.BANK_BIC),
    owner: firstNonBlank(process.env.BANK_DEFAULT_OWNER, process.env.BANK_OWNER)
  };
}

function readSwissBankAccount(): BankAccount {
  return {
    iban: firstNonBlank(process.env.BANK_CH_IBAN),
    bic: firstNonBlank(process.env.BANK_CH_BIC),
    owner: firstNonBlank(process.env.BANK_CH_OWNER)
  };
}

export function resolveBankAccount(countryCode?: CountryCode | null): BankAccount {
  if (countryCode === "CH") {
    return requireCompleteBankAccount(readSwissBankAccount(), "Schweizer Gäste");
  }

  return requireCompleteBankAccount(readDefaultBankAccount(), "internationale Gäste");
}
