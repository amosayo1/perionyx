import { logger } from "@/lib/logger";

type EmailConfig = {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
};

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@perionyx.dev",
  };
}

export async function sendEmail(input: EmailInput) {
  const config = getEmailConfig();
  if (!config) {
    logger.info({ subject: input.subject, to: input.to }, "[EmailChannel] No SMTP config — would have sent");
    return;
  }

  // Dynamic import nodemailer only when needed
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user && config.pass
      ? { user: config.user, pass: config.pass }
      : undefined,
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
