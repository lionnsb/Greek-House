import nodemailer from "nodemailer";
import { calculateTotal } from "@/lib/pricing";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}

function formatBool(value: boolean, locale: "de" | "en" = "de") {
  if (locale === "en") return value ? "yes" : "no";
  return value ? "ja" : "nein";
}

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP-Konfiguration fehlt (SMTP_HOST/USER/PASS/FROM)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendAcceptedEmail({
  to,
  name,
  reservationId,
  priceTotal,
  depositAmount,
  paymentDue,
  iban,
  bic,
  owner,
  startDate,
  endDate,
  includesStudio,
  pricePerNight,
  studioSurchargePerNight,
  language = "de"
}: {
  to: string;
  name: string;
  reservationId: string;
  priceTotal: number;
  depositAmount?: number | null;
  paymentDue: string;
  iban: string;
  bic: string;
  owner: string;
  startDate: string;
  endDate: string;
  includesStudio: boolean;
  pricePerNight: number;
  studioSurchargePerNight: number;
  language?: "de" | "en";
}) {
  const transport = createTransport();
  const subject =
    language === "en"
      ? "Booking accepted – payment details"
      : "Buchung angenommen – Zahlungsinformationen";
  const pricing = calculateTotal({
    startDate,
    endDate,
    includesStudio,
    pricePerNight,
    studioSurchargePerNight
  });
  const totalDisplay = priceTotal > 0 ? priceTotal : pricing.total;
  const text =
    language === "en"
      ? `Hello ${name},\n\n` +
        `thank you for your enquiry. We have accepted the booking.\n\n` +
        `Dates: ${startDate} to ${endDate} (${pricing.nights} nights)\n` +
        `Studio: ${formatBool(includesStudio, "en")}\n` +
        `Total: ${formatMoney(totalDisplay)}\n` +
        `${depositAmount ? `Deposit: ${formatMoney(depositAmount)}\n` : ""}` +
        `Payment due: ${paymentDue}\n\n` +
        `Please transfer to:\n` +
        `IBAN: ${iban}\nBIC: ${bic}\nAccount owner: ${owner}\n` +
        `Reference: ${reservationId}\n\n` +
        `Best regards\nMati tis Thalassas`
      : `Hallo ${name},\n\n` +
        `vielen Dank für deine Anfrage. Wir haben die Buchung angenommen.\n\n` +
        `Zeitraum: ${startDate} bis ${endDate} (${pricing.nights} Nächte)\n` +
        `Studio: ${formatBool(includesStudio, "de")}\n` +
        `Gesamtpreis: ${formatMoney(totalDisplay)}\n` +
        `${depositAmount ? `Anzahlung: ${formatMoney(depositAmount)}\n` : ""}` +
        `Zahlungsfrist: ${paymentDue}\n\n` +
        `Bitte überweise auf folgendes Konto:\n` +
        `IBAN: ${iban}\nBIC: ${bic}\nKontoinhaber: ${owner}\n` +
        `Verwendungszweck: ${reservationId}\n\n` +
        `Viele Grüße\nMati tis Thalassas`;

  const html =
    language === "en"
      ? `
  <p>Hello ${name},</p>
  <p>thank you for your enquiry. We have accepted the booking.</p>
  <p>
    <strong>Dates:</strong> ${startDate} to ${endDate} (${pricing.nights} nights)<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "en")}<br/>
    <strong>Total:</strong> ${formatMoney(totalDisplay)}<br/>
    ${depositAmount ? `<strong>Deposit:</strong> ${formatMoney(depositAmount)}<br/>` : ""}
    <strong>Payment due:</strong> ${paymentDue}
  </p>
  <p>
    <strong>Bank details</strong><br/>
    IBAN: ${iban}<br/>
    BIC: ${bic}<br/>
    Account owner: ${owner}<br/>
    Reference: ${reservationId}
  </p>
  <p>Best regards<br/>Mati tis Thalassas</p>
  `
      : `
  <p>Hallo ${name},</p>
  <p>vielen Dank für deine Anfrage. Wir haben die Buchung angenommen.</p>
  <p>
    <strong>Zeitraum:</strong> ${startDate} bis ${endDate} (${pricing.nights} Nächte)<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "de")}<br/>
    <strong>Gesamtpreis:</strong> ${formatMoney(totalDisplay)}<br/>
    ${depositAmount ? `<strong>Anzahlung:</strong> ${formatMoney(depositAmount)}<br/>` : ""}
    <strong>Zahlungsfrist:</strong> ${paymentDue}
  </p>
  <p>
    <strong>Kontodaten</strong><br/>
    IBAN: ${iban}<br/>
    BIC: ${bic}<br/>
    Kontoinhaber: ${owner}<br/>
    Verwendungszweck: ${reservationId}
  </p>
  <p>Viele Grüße<br/>Mati tis Thalassas</p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}

export async function sendConfirmedEmail({
  to,
  name,
  startDate,
  endDate,
  includesStudio,
  language = "de"
}: {
  to: string;
  name: string;
  startDate: string;
  endDate: string;
  includesStudio: boolean;
  language?: "de" | "en";
}) {
  const transport = createTransport();
  const subject = language === "en" ? "Booking confirmed" : "Buchung bestätigt";
  const text =
    language === "en"
      ? `Hello ${name},\n\n` +
        `your booking is confirmed.\n` +
        `Dates: ${startDate} to ${endDate}\n` +
        `Studio: ${formatBool(includesStudio, "en")}\n\n` +
        `We look forward to welcoming you!\nMati tis Thalassas`
      : `Hallo ${name},\n\n` +
        `deine Buchung ist bestätigt.\n` +
        `Zeitraum: ${startDate} bis ${endDate}\n` +
        `Studio: ${formatBool(includesStudio, "de")}\n\n` +
        `Wir freuen uns auf deinen Aufenthalt!\nMati tis Thalassas`;

  const html =
    language === "en"
      ? `
  <p>Hello ${name},</p>
  <p>your booking is confirmed.</p>
  <p>
    <strong>Dates:</strong> ${startDate} to ${endDate}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "en")}
  </p>
  <p>We look forward to welcoming you!<br/>Mati tis Thalassas</p>
  `
      : `
  <p>Hallo ${name},</p>
  <p>deine Buchung ist bestätigt.</p>
  <p>
    <strong>Zeitraum:</strong> ${startDate} bis ${endDate}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "de")}
  </p>
  <p>Wir freuen uns auf deinen Aufenthalt!<br/>Mati tis Thalassas</p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}

export async function sendRejectedEmail({
  to,
  name,
  startDate,
  endDate,
  language = "de"
}: {
  to: string;
  name: string;
  startDate: string;
  endDate: string;
  language?: "de" | "en";
}) {
  const transport = createTransport();
  const subject = language === "en" ? "Enquiry declined" : "Anfrage abgelehnt";
  const text =
    language === "en"
      ? `Hello ${name},\n\n` +
        `unfortunately we cannot confirm your request for ${startDate} to ${endDate}.\n` +
        `If you are flexible, feel free to contact us with alternative dates.\n\n` +
        `Best regards\nMati tis Thalassas`
      : `Hallo ${name},\n\n` +
        `leider können wir deine Anfrage im Zeitraum ${startDate} bis ${endDate} nicht bestätigen.\n` +
        `Wenn du flexible Daten hast, melde dich gern mit einem alternativen Zeitraum.\n\n` +
        `Viele Grüße\nMati tis Thalassas`;

  const html =
    language === "en"
      ? `
  <p>Hello ${name},</p>
  <p>unfortunately we cannot confirm your request for <strong>${startDate}</strong> to <strong>${endDate}</strong>.</p>
  <p>If you are flexible, feel free to contact us with alternative dates.</p>
  <p>Best regards<br/>Mati tis Thalassas</p>
  `
      : `
  <p>Hallo ${name},</p>
  <p>leider können wir deine Anfrage im Zeitraum <strong>${startDate}</strong> bis <strong>${endDate}</strong> nicht bestätigen.</p>
  <p>Wenn du flexible Daten hast, melde dich gern mit einem alternativen Zeitraum.</p>
  <p>Viele Grüße<br/>Mati tis Thalassas</p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}

export async function sendInquiryReceivedEmail({
  to,
  name,
  startDate,
  endDate,
  reservationId,
  includesStudio,
  language = "de"
}: {
  to: string;
  name: string;
  startDate: string;
  endDate: string;
  reservationId: string;
  includesStudio: boolean;
  language?: "de" | "en";
}) {
  const transport = createTransport();
  const subject = language === "en" ? "Enquiry received" : "Anfrage erhalten";
  const text =
    language === "en"
      ? `Hello ${name},\n\n` +
        `thank you for your enquiry. We have received it and will get back to you shortly.\n` +
        `Dates: ${startDate} to ${endDate}\n` +
        `Studio: ${formatBool(includesStudio, "en")}\n` +
        `Reference: ${reservationId}\n\n` +
        `Best regards\nMati tis Thalassas`
      : `Hallo ${name},\n\n` +
        `danke für deine Anfrage. Wir haben sie erhalten und melden uns in Kürze.\n` +
        `Zeitraum: ${startDate} bis ${endDate}\n` +
        `Studio: ${formatBool(includesStudio, "de")}\n` +
        `Referenz: ${reservationId}\n\n` +
        `Viele Grüße\nMati tis Thalassas`;

  const html =
    language === "en"
      ? `
  <p>Hello ${name},</p>
  <p>thank you for your enquiry. We have received it and will get back to you shortly.</p>
  <p>
    <strong>Dates:</strong> ${startDate} to ${endDate}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "en")}<br/>
    <strong>Reference:</strong> ${reservationId}
  </p>
  <p>Best regards<br/>Mati tis Thalassas</p>
  `
      : `
  <p>Hallo ${name},</p>
  <p>danke für deine Anfrage. Wir haben sie erhalten und melden uns in Kürze.</p>
  <p>
    <strong>Zeitraum:</strong> ${startDate} bis ${endDate}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "de")}<br/>
    <strong>Referenz:</strong> ${reservationId}
  </p>
  <p>Viele Grüße<br/>Mati tis Thalassas</p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}

export async function sendPaymentReminderEmail({
  to,
  name,
  startDate,
  endDate,
  paymentDue,
  reservationId,
  includesStudio,
  language = "de"
}: {
  to: string;
  name: string;
  startDate: string;
  endDate: string;
  paymentDue: string;
  reservationId: string;
  includesStudio: boolean;
  language?: "de" | "en";
}) {
  const transport = createTransport();
  const subject =
    language === "en"
      ? "Payment reminder"
      : "Zahlungserinnerung";
  const text =
    language === "en"
      ? `Hello ${name},\n\n` +
        `this is a friendly reminder about the payment for your booking.\n` +
        `Dates: ${startDate} to ${endDate}\n` +
        `Studio: ${formatBool(includesStudio, "en")}\n` +
        `Payment due: ${paymentDue}\n` +
        `Reference: ${reservationId}\n\n` +
        `Best regards\nMati tis Thalassas`
      : `Hallo ${name},\n\n` +
        `freundliche Erinnerung zur Zahlung deiner Buchung.\n` +
        `Zeitraum: ${startDate} bis ${endDate}\n` +
        `Studio: ${formatBool(includesStudio, "de")}\n` +
        `Zahlungsfrist: ${paymentDue}\n` +
        `Verwendungszweck: ${reservationId}\n\n` +
        `Viele Grüße\nMati tis Thalassas`;

  const html =
    language === "en"
      ? `
  <p>Hello ${name},</p>
  <p>this is a friendly reminder about the payment for your booking.</p>
  <p>
    <strong>Dates:</strong> ${startDate} to ${endDate}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "en")}<br/>
    <strong>Payment due:</strong> ${paymentDue}<br/>
    <strong>Reference:</strong> ${reservationId}
  </p>
  <p>Best regards<br/>Mati tis Thalassas</p>
  `
      : `
  <p>Hallo ${name},</p>
  <p>freundliche Erinnerung zur Zahlung deiner Buchung.</p>
  <p>
    <strong>Zeitraum:</strong> ${startDate} bis ${endDate}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "de")}<br/>
    <strong>Zahlungsfrist:</strong> ${paymentDue}<br/>
    <strong>Verwendungszweck:</strong> ${reservationId}
  </p>
  <p>Viele Grüße<br/>Mati tis Thalassas</p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}

export async function sendAdminNewInquiryEmail({
  to,
  name,
  email,
  phone,
  guests,
  startDate,
  endDate,
  includesStudio,
  message,
  reservationId,
  language = "de"
}: {
  to: string;
  name: string;
  email: string;
  phone?: string | null;
  guests: number;
  startDate: string;
  endDate: string;
  includesStudio: boolean;
  message?: string | null;
  reservationId: string;
  language?: "de" | "en";
}) {
  const transport = createTransport();
  const subject =
    language === "en"
      ? `New enquiry: ${name} (${startDate} – ${endDate})`
      : `Neue Anfrage: ${name} (${startDate} – ${endDate})`;
  const text =
    language === "en"
      ? `New enquiry received\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone ?? "-"}\n` +
        `Guests: ${guests}\n` +
        `Studio: ${formatBool(includesStudio, "en")}\n` +
        `Dates: ${startDate} to ${endDate}\n` +
        `Message: ${message ?? "-"}\n` +
        `Reservation: ${reservationId}\n`
      : `Neue Anfrage eingegangen\n\n` +
        `Name: ${name}\n` +
        `E-Mail: ${email}\n` +
        `Telefon: ${phone ?? "-"}\n` +
        `Gäste: ${guests}\n` +
        `Studio: ${formatBool(includesStudio, "de")}\n` +
        `Zeitraum: ${startDate} bis ${endDate}\n` +
        `Nachricht: ${message ?? "-"}\n` +
        `Reservierung: ${reservationId}\n`;

  const html =
    language === "en"
      ? `
  <p><strong>New enquiry received</strong></p>
  <p>
    <strong>Name:</strong> ${name}<br/>
    <strong>Email:</strong> ${email}<br/>
    <strong>Phone:</strong> ${phone ?? "-"}<br/>
    <strong>Guests:</strong> ${guests}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "en")}<br/>
    <strong>Dates:</strong> ${startDate} to ${endDate}<br/>
    <strong>Message:</strong> ${message ?? "-"}<br/>
    <strong>Reservation:</strong> ${reservationId}
  </p>
  `
      : `
  <p><strong>Neue Anfrage eingegangen</strong></p>
  <p>
    <strong>Name:</strong> ${name}<br/>
    <strong>E-Mail:</strong> ${email}<br/>
    <strong>Telefon:</strong> ${phone ?? "-"}<br/>
    <strong>Gäste:</strong> ${guests}<br/>
    <strong>Studio:</strong> ${formatBool(includesStudio, "de")}<br/>
    <strong>Zeitraum:</strong> ${startDate} bis ${endDate}<br/>
    <strong>Nachricht:</strong> ${message ?? "-"}<br/>
    <strong>Reservierung:</strong> ${reservationId}
  </p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}
