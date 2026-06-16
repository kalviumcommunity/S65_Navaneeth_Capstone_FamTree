// server.js - Backend entry point for FamTree

require('dotenv').config();

const app = require('./server/app');
const connectDB = require('./server/config/db');

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve({ server, port }));

    server.on('error', reject);
  });
}

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      // Clear message for beginners: auth won't work without this.
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    await connectDB();

    const port = Number(process.env.PORT) || 5000;
    const { port: activePort } = await listenOnPort(port);
    console.log(`Server running on http://localhost:${activePort}`);
  } catch (error) {
    if (error?.code === 'EADDRINUSE') {
      console.error(`Port ${Number(process.env.PORT) || 5000} is already in use. Stop the existing server and try again.`);
    } else {
      console.error('Failed to start server:', error.message);
    }
    process.exit(1);
  }
}

start();
