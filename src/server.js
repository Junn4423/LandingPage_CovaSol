const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const SQLiteStoreFactory = require('connect-sqlite3');
const config = require('./config');
const { initializeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const productRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const databaseRoutes = require('./routes/database');

initializeDatabase();

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

app.set('trust proxy', config.isProduction);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new SQLiteStore({
      db: path.basename(config.sessionStoreFile),
      dir: path.dirname(config.sessionStoreFile)
    }),
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

const publicDir = path.join(__dirname, '..');
const assetsDir = path.join(publicDir, 'assets');

app.use(
  '/assets',
  express.static(assetsDir, {
    maxAge: config.isProduction ? '7d' : 0,
    extensions: ['css', 'js', 'png', 'jpg', 'jpeg', 'svg', 'webp']
  })
);
app.use(
  express.static(publicDir, {
    extensions: ['html']
  })
);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/database', databaseRoutes);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/blog/post/:identifier', (req, res) => {
  res.sendFile(path.join(publicDir, 'blog-detail.html'));
});

app.get('/products/item/:identifier', (req, res) => {
  res.sendFile(path.join(publicDir, 'product-detail.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint không tồn tại.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
});

const port = config.port;
app.listen(port, () => {
  console.log(`Covasol server đang chạy tại http://localhost:${port}`);
});
