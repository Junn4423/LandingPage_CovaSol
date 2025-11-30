const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);
const config = require('./config');
const { initializeDatabase, getPool } = require('./db');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const productRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const databaseRoutes = require('./routes/database');

const app = express();

app.set('trust proxy', config.isProduction);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: config.corsOrigins.length > 0 ? config.corsOrigins : undefined,
  credentials: true
};
app.use(cors(corsOptions));

// MySQL Session Store
const sessionStore = new MySQLStore({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 1000 * 60 * 60 * 8, // 8 hours
  createDatabaseTable: true,
  schema: {
    tableName: config.sessionTable,
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.use(
  session({
    store: sessionStore,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    services: {
      database: 'unknown'
    }
  };

  try {
    // Check database connectivity
    const dbStart = Date.now();
    await getPool().query('SELECT 1');
    const dbLatency = Date.now() - dbStart;
    
    health.services.database = 'healthy';
    health.services.databaseLatency = `${dbLatency}ms`;
  } catch (error) {
    health.status = 'degraded';
    health.services.database = 'unhealthy';
    health.services.databaseError = config.nodeEnv === 'development' ? error.message : 'Connection failed';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/database', databaseRoutes);

// 404 handler for unmatched API routes
app.use('/api', notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

const port = config.port;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Covasol API server đang chạy tại http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Không thể khởi tạo cơ sở dữ liệu:', error);
    process.exit(1);
  });
