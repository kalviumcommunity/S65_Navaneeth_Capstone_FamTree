// server.js - Backend entry point for FamTree

require('dotenv').config();

const app = require('./server/app');
const connectDB = require('./server/config/db');

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      // Clear message for beginners: auth won't work without this.
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    await connectDB();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
