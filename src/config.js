const path = require('path');

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const dataDir = path.join(__dirname, '..', '..', 'data');

module.exports = {
  env,
  isProduction,
  port: parseInt(process.env.PORT, 10) || 3001,
  sessionSecret: process.env.SESSION_SECRET || 'covasol-dev-secret',
  dbFile: process.env.DB_FILE || path.join(dataDir, 'covasol.db'),
  sessionStoreFile: process.env.SESSION_DB_FILE || path.join(dataDir, 'sessions.sqlite'),
  adminDefault: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '04042003Cova*',
    displayName: process.env.ADMIN_DISPLAY_NAME || 'Covasol Admin'
  },
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
};
