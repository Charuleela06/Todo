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

/* -------------------- CORS (SIMPLE & SAFE) -------------------- */

app.use(cors({
  origin: [
    "https://todo-psi-ten-95.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Handle all preflight requests
app.options('*', cors());

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

/* -------------------- HEALTH CHECK -------------------- */

app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'Todo Backend',
    version: '1.0.0'
  });
});

/* -------------------- ROUTES -------------------- */

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);

/* -------------------- START SERVER -------------------- */

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      startSchedulers();
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });