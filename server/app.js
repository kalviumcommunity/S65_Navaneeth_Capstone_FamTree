// server/app.js
// Express app configuration (middleware + routes).

const express = require('express');
const cors = require('cors');

const memberRoutes = require('./routes/memberRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());

// CORS: allow the frontend (Vercel) + local dev.
// For beginner projects, keeping this explicit helps avoid “CORS errors”.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.replace(/\/$/, '');

      // Allow tools like Postman (no origin header)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// Simple health check for Render.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
