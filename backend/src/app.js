import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import templateRoutes from './routes/templates.js';
import { startSchedulers } from './jobs/scheduler.js';

const app = express();

// Build allowed origins list from config, supporting multiple origins
const normalize = (u) => (u ? u.replace(/\/$/, '') : u);
const allowedOrigins = (Array.isArray(config.clientUrls) && config.clientUrls.length > 0
  ? config.clientUrls
  : [config.clientUrl])
  .filter(Boolean)
  .map(normalize);

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalize(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    console.warn('[CORS] Blocked origin:', origin, 'normalized as', normalizedOrigin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  }
};

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.use((req, _res, next) => {
  if (req.headers.origin) {
    console.log('[CORS] Incoming request Origin:', req.headers.origin, 'Path:', req.method, req.originalUrl);
  }
  next();
});
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Todo Backend', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    startSchedulers();
  });
}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

