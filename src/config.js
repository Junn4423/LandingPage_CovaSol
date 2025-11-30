const path = require('path');

require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const dataDir = path.join(__dirname, '..', '..', 'data');

module.exports = {
  nodeEnv,
  isProduction,
  port: parseInt(process.env.PORT, 10) || 3001,
  sessionSecret: process.env.SESSION_SECRET || 'covasol-dev-secret',
  // MySQL/MariaDB connection config for Laragon
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'covasol'
  },
  sessionTable: process.env.SESSION_TABLE || 'sessions',
  adminDefault: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '04042003Cova*',
    displayName: process.env.ADMIN_DISPLAY_NAME || 'Covasol Admin'
  },
  corsOrigins: Array.from(
    new Set(
      (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)
        .concat(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    )
  )
};
