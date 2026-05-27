// server/config/db.js
// MongoDB connection helper.
// Keeping this in a separate file makes server.js/app.js easier to read.

const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}

module.exports = connectDB;
