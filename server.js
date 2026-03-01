// server.js - Entry point for FamTree backend

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const memberRoutes = require('./routes/memberRoutes');
const userRoutes   = require('./routes/userRoutes');
const aiRoutes     = require('./routes/aiRoutes');

const app = express();

// ── Middleware ──────────────────────────────────────────────
// Allow requests from the deployed Vercel frontend and local dev
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // strip trailing slash if present
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server)
      const normalizedOrigin = origin?.replace(/\/$/, '');
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json()); // Parse incoming JSON request bodies

// ── Routes ─────────────────────────────────────────────────
app.use('/api/members', memberRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/ai',      aiRoutes);

// ── MongoDB Connection ──────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the server only after a successful DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1); // Exit if the database connection fails
  });
