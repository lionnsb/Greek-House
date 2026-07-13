import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import nodemailer from "nodemailer";
import type { HouseRulesAttachment } from "../src/lib/houseRulesAttachment.js";
import {
  sendAcceptedEmail,
  sendConfirmedEmail,
  sendPaymentReminderEmail
} from "../src/lib/mailer.js";

type SentMail = {
  subject?: string;
  text?: string;
  html?: string;
  bcc?: string[];
  attachments?: Array<{
    filename?: string;
    content?: Buffer;
    contentType?: string;
  }>;
};

const originalEnv = { ...process.env };
const originalCreateTransport = nodemailer.createTransport;

function setSmtpEnv() {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "mailer";
  process.env.SMTP_PASS = "secret";
  process.env.SMTP_FROM = "Greek House <hello@example.com>";
  delete process.env.ADMIN_NOTIFY_EMAILS;
}

function buildAttachment(): HouseRulesAttachment {
  return {
    filename: "mati-tis-thalassas-house-rules.pdf",
    content: new Uint8Array([7, 8, 9]),
    contentType: "application/pdf"
  };
}

function stubTransport(sentMessages: SentMail[]) {
  nodemailer.createTransport = (() =>
    ({
      sendMail: async (message: SentMail) => {
        sentMessages.push(message);
        return { messageId: "test-message" };
      }
    })) as typeof nodemailer.createTransport;
}

afterEach(() => {
  process.env = { ...originalEnv };
  nodemailer.createTransport = originalCreateTransport;
});

describe("sendConfirmedEmail", () => {
  it("sends an invisible copy to the configured admin recipients", async () => {
    setSmtpEnv();
    process.env.ADMIN_NOTIFY_EMAILS =
      "Dagmar@Naxos-Apartment.com, gast@example.com, dagmar@naxos-apartment.com";

    const sentMessages: SentMail[] = [];
    stubTransport(sentMessages);

    await sendConfirmedEmail({
      to: "gast@example.com",
      name: "Mati",
      startDate: "2026-07-01",
      endDate: "2026-07-08",
      includesStudio: true,
      houseRulesAttachment: buildAttachment(),
      language: "de"
    });

    assert.deepEqual(sentMessages[0]?.bcc, ["dagmar@naxos-apartment.com"]);
  });

  it("attaches the PDF and adds the German note", async () => {
    setSmtpEnv();

    const sentMessages: SentMail[] = [];
    stubTransport(sentMessages);

    await sendConfirmedEmail({
      to: "gast@example.com",
      name: "Mati",
      startDate: "2026-07-01",
      endDate: "2026-07-08",
      includesStudio: true,
      houseRulesAttachment: buildAttachment(),
      language: "de"
    });

    assert.equal(sentMessages.length, 1);
    assert.equal(sentMessages[0]?.subject, "Buchung bestätigt");
    assert.match(sentMessages[0]?.text ?? "", /Hausregeln sind als PDF beigefügt/);
    assert.match(sentMessages[0]?.html ?? "", /Hausregeln sind als PDF beigefügt/);
    assert.equal(sentMessages[0]?.attachments?.length, 1);
    assert.equal(
      sentMessages[0]?.attachments?.[0]?.filename,
      "mati-tis-thalassas-house-rules.pdf"
    );
    assert.equal(sentMessages[0]?.attachments?.[0]?.contentType, "application/pdf");
    assert.ok(Buffer.isBuffer(sentMessages[0]?.attachments?.[0]?.content));
    assert.deepEqual(
      Array.from(sentMessages[0]?.attachments?.[0]?.content ?? []),
      [7, 8, 9]
    );
  });

  it("attaches the PDF and adds the English note", async () => {
    setSmtpEnv();

    const sentMessages: SentMail[] = [];
    stubTransport(sentMessages);

    await sendConfirmedEmail({
      to: "guest@example.com",
      name: "Mati",
      startDate: "2026-08-01",
      endDate: "2026-08-10",
      includesStudio: false,
      houseRulesAttachment: buildAttachment(),
      language: "en"
    });

    assert.equal(sentMessages.length, 1);
    assert.equal(sentMessages[0]?.subject, "Booking confirmed");
    assert.match(sentMessages[0]?.text ?? "", /The house rules are attached as a PDF/);
    assert.match(sentMessages[0]?.html ?? "", /The house rules are attached as a PDF/);
    assert.equal(sentMessages[0]?.attachments?.length, 1);
    assert.equal(
      sentMessages[0]?.attachments?.[0]?.filename,
      "mati-tis-thalassas-house-rules.pdf"
    );
    assert.equal(sentMessages[0]?.attachments?.[0]?.contentType, "application/pdf");
  });
});

describe("payment emails", () => {
  it("includes the provided Swiss bank account in the accepted email", async () => {
    setSmtpEnv();
    const sentMessages: SentMail[] = [];
    stubTransport(sentMessages);

    await sendAcceptedEmail({
      to: "gast@example.com",
      name: "Mati",
      reservationId: "RES-CH-1",
      priceTotal: 1250,
      depositAmount: 400,
      paymentDue: "2026-07-01",
      iban: "CH93-0076-2011-6238-5295-7",
      bic: "POFICHBEXXX",
      owner: "Swiss Host",
      startDate: "2026-08-01",
      endDate: "2026-08-08",
      includesStudio: false,
      pricePerNight: 150,
      studioSurchargePerNight: 0,
      language: "de"
    });

    assert.equal(sentMessages.length, 1);
    assert.match(sentMessages[0]?.text ?? "", /IBAN: CH93-0076-2011-6238-5295-7/);
    assert.match(sentMessages[0]?.text ?? "", /BIC: POFICHBEXXX/);
    assert.match(sentMessages[0]?.text ?? "", /Kontoinhaber: Swiss Host/);
    assert.match(sentMessages[0]?.html ?? "", /IBAN: CH93-0076-2011-6238-5295-7/);
  });

  it("includes bank details in the German payment reminder", async () => {
    setSmtpEnv();
    const sentMessages: SentMail[] = [];
    stubTransport(sentMessages);

    await sendPaymentReminderEmail({
      to: "gast@example.com",
      name: "Mati",
      startDate: "2026-09-10",
      endDate: "2026-09-17",
      paymentDue: "2026-08-15",
      reservationId: "RES-DE-1",
      includesStudio: true,
      iban: "DE12-3456-7890-1234-5678-90",
      bic: "GENODEF1XXX",
      owner: "Default Host",
      language: "de"
    });

    assert.equal(sentMessages.length, 1);
    assert.match(sentMessages[0]?.text ?? "", /Bitte überweise auf folgendes Konto/);
    assert.match(sentMessages[0]?.text ?? "", /IBAN: DE12-3456-7890-1234-5678-90/);
    assert.match(sentMessages[0]?.text ?? "", /Kontoinhaber: Default Host/);
    assert.match(sentMessages[0]?.html ?? "", /Kontodaten/);
    assert.match(sentMessages[0]?.html ?? "", /GENODEF1XXX/);
  });
});
