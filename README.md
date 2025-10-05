# MERN To-Do List App

A full-featured To-Do List Web Application built with the MERN stack (MongoDB, Express.js, React, Node.js) including email and SMS notifications, dashboard analytics, dark mode, and responsive UI.

## Features
- Authentication (JWT): Signup, Login, Logout
- Tasks CRUD with filters, tags, priorities, due dates
- Projects/Workspaces and Categories
- Email and SMS reminders (Nodemailer + Twilio)
- Dashboard with charts (Recharts)
- Responsive UI with Tailwind CSS and Dark Mode
- PWA basics and placeholders for Push Notifications (FCM)

## Structure
```
TodoList/
  backend/
    src/
      app.js
      config.js
      db.js
      middleware/
      models/
      routes/
      services/
      jobs/
    package.json
    .env.example
  frontend/
    public/
    src/
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
```

## Quick Start

1. Backend
```
cp backend/.env.example backend/.env
# Fill values for MONGODB_URI, JWT_SECRET, EMAIL/TWILIO credentials
npm install --prefix backend
npm run dev --prefix backend
```

2. Frontend
```
npm install --prefix frontend
npm run dev --prefix frontend
```

Open the frontend dev URL, usually http://localhost:5173

## Deployment
- Backend: Render/Heroku
- Frontend: Netlify/Vercel
- Database: MongoDB Atlas

See scripts in each package.json and set environment variables accordingly.
