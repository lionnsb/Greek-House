import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import nodemailer from "nodemailer";
import type { HouseRulesAttachment } from "../src/lib/houseRulesAttachment.js";
import { sendConfirmedEmail } from "../src/lib/mailer.js";

type SentMail = {
  subject?: string;
  text?: string;
  html?: string;
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
}

function buildAttachment(): HouseRulesAttachment {
  return {
    filename: "mati-tis-thalassas-house-rules.pdf",
    content: new Uint8Array([7, 8, 9]),
    contentType: "application/pdf"
  };
}

afterEach(() => {
  process.env = { ...originalEnv };
  nodemailer.createTransport = originalCreateTransport;
});

describe("sendConfirmedEmail", () => {
  it("attaches the PDF and adds the German note", async () => {
    setSmtpEnv();

    const sentMessages: SentMail[] = [];
    nodemailer.createTransport = (() =>
      ({
        sendMail: async (message: SentMail) => {
          sentMessages.push(message);
          return { messageId: "de-test" };
        }
      })) as typeof nodemailer.createTransport;

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
    nodemailer.createTransport = (() =>
      ({
        sendMail: async (message: SentMail) => {
          sentMessages.push(message);
          return { messageId: "en-test" };
        }
      })) as typeof nodemailer.createTransport;

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
