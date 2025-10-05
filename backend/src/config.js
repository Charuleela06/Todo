import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  // Single client URL fallback (backward compatibility)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Multiple client URLs supported via comma-separated env var
  clientUrls: (process.env.CLIENT_URLS || '')
    .split(',')
    .map(s => s.trim())
    .map(s => s.replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminSignupCode: process.env.ADMIN_SIGNUP_CODE || '',
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'Todo App <no-reply@example.com>'
  },
  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER
  }
};

