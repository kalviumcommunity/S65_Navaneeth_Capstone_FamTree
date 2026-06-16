// server/config/db.js
// MongoDB connection helper.
// Keeping this in a separate file makes server.js/app.js easier to read.

const mongoose = require('mongoose');

function buildDirectSeedListUri(mongoUri) {
  if (!mongoUri.startsWith('mongodb+srv://')) {
    return null;
  }

  const parsedUri = new URL(mongoUri.replace('mongodb+srv://', 'mongodb://'));
  const clusterParts = parsedUri.hostname.split('.');

  if (clusterParts.length < 2) {
    return null;
  }

  const clusterName = clusterParts[0];
  const domain = clusterParts.slice(1).join('.');
  const seedHosts = [0, 1, 2].map((index) => `${clusterName}-shard-00-0${index}.${domain}:27017`);
  const authPrefix = parsedUri.username
    ? `${encodeURIComponent(parsedUri.username)}${parsedUri.password ? `:${encodeURIComponent(parsedUri.password)}` : ''}@`
    : '';
  const params = new URLSearchParams(parsedUri.search);

  if (!params.has('authSource')) {
    params.set('authSource', 'admin');
  }

  if (!params.has('retryWrites')) {
    params.set('retryWrites', 'true');
  }

  if (!params.has('w')) {
    params.set('w', 'majority');
  }

  if (!params.has('tls') && !params.has('ssl')) {
    params.set('tls', 'true');
  }

  const queryString = params.toString();
  const pathName = parsedUri.pathname || '/';

  return `mongodb://${authPrefix}${seedHosts.join(',')}${pathName}${queryString ? `?${queryString}` : ''}`;
}

function shouldRetryWithDirectSeedList(error) {
  return /querySrv|ECONNREFUSED|getaddrinfo|ENOTFOUND/i.test(error.message || '') || error.code === 'ECONNREFUSED';
}

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    return;
  } catch (error) {
    const fallbackUri = buildDirectSeedListUri(mongoUri);

    if (fallbackUri && shouldRetryWithDirectSeedList(error)) {
      console.warn('Primary MongoDB SRV lookup failed, retrying with a direct seed list URI.');
      await mongoose.connect(fallbackUri);
      console.log('Connected to MongoDB via direct seed list');
      return;
    }

    throw error;
  }
}

module.exports = connectDB;
