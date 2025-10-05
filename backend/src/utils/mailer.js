import nodemailer from 'nodemailer';
import { config } from '../config.js';

// Expected config fields (via env or config.js):
// SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS, EMAIL_FROM
function createTransport() {
  const host = process.env.SMTP_HOST || config.email?.host;
  const port = Number(process.env.SMTP_PORT || (config.email?.port ?? 587));
  const secure = String(process.env.SMTP_SECURE ?? (config.email?.secure ?? 'false')).toLowerCase() === 'true';
  const user = process.env.SMTP_USER || config.email?.user;
  const pass = process.env.SMTP_PASS || config.email?.pass;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = createTransport();
    if (!transporter) {
      console.warn('[mailer] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS. Skipping email to', to, 'subject:', subject);
      return { skipped: true };
    }
    const from = process.env.EMAIL_FROM || config.email?.from || 'no-reply@example.com';
    const info = await transporter.sendMail({ from, to, subject, text, html });
    return { messageId: info.messageId };
  } catch (e) {
    console.error('[mailer] Error sending mail:', e.message);
    return { error: e.message };
  }
}
