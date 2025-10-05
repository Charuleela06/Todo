import { config } from '../config.js';
import Twilio from 'twilio';

let client;
if (config.twilio.sid && config.twilio.token) {
  client = new Twilio(config.twilio.sid, config.twilio.token);
}

export async function sendSMS({ to, body }) {
  if (!client) {
    console.log('[sms:dev]', { to, body });
    return { mocked: true };
  }
  return client.messages.create({ from: config.twilio.from, to, body });
}
