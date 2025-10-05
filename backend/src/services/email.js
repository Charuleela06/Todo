import nodemailer from 'nodemailer';
import { config } from '../config.js';

let transporter;
if (config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: { user: config.email.user, pass: config.email.pass },
    pool: true,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
}

export async function sendEmail({ to, subject, html }) {
  try {
    if (!transporter) {
      console.log('[email:dev]', { to, subject });
      return { mocked: true };
    }
    const info = await transporter.sendMail({ from: config.email.from, to, subject, html });
    return { messageId: info.messageId };
  } catch (e) {
    console.warn('[email:error]', e.message);
    return { error: e.message };
  }
}
