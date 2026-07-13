import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resolveBankAccount } from "../src/lib/bankAccount.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("resolveBankAccount", () => {
  it("returns the Swiss profile for CH bookings", () => {
    process.env.BANK_DEFAULT_IBAN = "DE-default-iban";
    process.env.BANK_DEFAULT_BIC = "DE-default-bic";
    process.env.BANK_DEFAULT_OWNER = "Default Owner";
    process.env.BANK_CH_IBAN = "CH-iban";
    process.env.BANK_CH_BIC = "CH-bic";
    process.env.BANK_CH_OWNER = "Swiss Owner";

    assert.deepEqual(resolveBankAccount("CH"), {
      iban: "CH-iban",
      bic: "CH-bic",
      owner: "Swiss Owner"
    });
  });

  it("falls back to the default account for non-Swiss bookings", () => {
    process.env.BANK_DEFAULT_IBAN = "DE-default-iban";
    process.env.BANK_DEFAULT_BIC = "DE-default-bic";
    process.env.BANK_DEFAULT_OWNER = "Default Owner";
    process.env.BANK_CH_IBAN = "CH-iban";
    process.env.BANK_CH_BIC = "CH-bic";
    process.env.BANK_CH_OWNER = "Swiss Owner";

    assert.deepEqual(resolveBankAccount("DE"), {
      iban: "DE-default-iban",
      bic: "DE-default-bic",
      owner: "Default Owner"
    });
  });

  it("uses the legacy BANK_* vars as default fallback", () => {
    process.env.BANK_DEFAULT_IBAN = "";
    process.env.BANK_DEFAULT_BIC = "";
    process.env.BANK_DEFAULT_OWNER = "";
    process.env.BANK_IBAN = "legacy-iban";
    process.env.BANK_BIC = "legacy-bic";
    process.env.BANK_OWNER = "Legacy Owner";

    assert.deepEqual(resolveBankAccount(null), {
      iban: "legacy-iban",
      bic: "legacy-bic",
      owner: "Legacy Owner"
    });
  });

  it("rejects incomplete default bank details", () => {
    process.env.BANK_DEFAULT_IBAN = "";
    process.env.BANK_DEFAULT_BIC = "";
    process.env.BANK_DEFAULT_OWNER = "";
    process.env.BANK_IBAN = "";
    process.env.BANK_BIC = "";
    process.env.BANK_OWNER = "";

    assert.throws(
      () => resolveBankAccount("DE"),
      /Bankverbindung für internationale Gäste ist unvollständig: IBAN, BIC, Kontoinhaber/
    );
  });

  it("never falls back to the default account for Swiss guests", () => {
    process.env.BANK_DEFAULT_IBAN = "GR-default-iban";
    process.env.BANK_DEFAULT_BIC = "GR-default-bic";
    process.env.BANK_DEFAULT_OWNER = "Default Owner";
    process.env.BANK_CH_IBAN = "";
    process.env.BANK_CH_BIC = "";
    process.env.BANK_CH_OWNER = "";

    assert.throws(
      () => resolveBankAccount("CH"),
      /Bankverbindung für Schweizer Gäste ist unvollständig/
    );
  });
});
