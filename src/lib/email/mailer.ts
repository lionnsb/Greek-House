import nodemailer from "nodemailer";

export function getTransport() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

export async function sendMail(params: {
  to: string;
  subject: string;
  text: string;
}) {
  const transporter = getTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });
}
