// server.js - Entry point for FamTree backend

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const memberRoutes = require('./routes/memberRoutes');
const userRoutes   = require('./routes/userRoutes');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());          // Allow cross-origin requests (e.g. from a React frontend)
app.use(express.json()); // Parse incoming JSON request bodies

// ── Routes ─────────────────────────────────────────────────
app.use('/api/members', memberRoutes);
app.use('/api/users',   userRoutes);

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
