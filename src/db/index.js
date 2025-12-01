const mysql = require('mysql2/promise');
const config = require('../config');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

async function initializeDatabase() {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    // Create admin_users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create blog_posts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(150) NOT NULL UNIQUE,
        title TEXT NOT NULL,
        subtitle TEXT,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        image_url TEXT,
        category VARCHAR(120),
        tags TEXT,
        keywords TEXT,
        author_name VARCHAR(120),
        author_role VARCHAR(120),
        published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(40) NOT NULL DEFAULT 'published',
        gallery_media JSON DEFAULT NULL,
        video_items JSON DEFAULT NULL,
        source_links JSON DEFAULT NULL,
        is_featured TINYINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_published_at (published_at DESC),
        INDEX idx_status (status),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(150) NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category VARCHAR(120),
        short_description TEXT,
        description LONGTEXT,
        image_url TEXT,
        feature_tags TEXT,
        highlights TEXT,
        cta_primary_label TEXT,
        cta_primary_url TEXT,
        cta_secondary_label TEXT,
        cta_secondary_url TEXT,
        gallery_media JSON DEFAULT NULL,
        video_items JSON DEFAULT NULL,
        demo_media JSON DEFAULT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create sessions table for express-mysql-session
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) NOT NULL PRIMARY KEY,
        expires INT UNSIGNED NOT NULL,
        data MEDIUMTEXT,
        INDEX idx_expires (expires)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.commit();
    console.log('Database tables initialized successfully.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Placeholder detection and conversion
const NAMED_PLACEHOLDER = /@([a-zA-Z0-9_]+)/g;

function detectPlaceholderType(sql) {
  const hasNamed = NAMED_PLACEHOLDER.test(sql);
  const hasPositional = sql.includes('?');
  NAMED_PLACEHOLDER.lastIndex = 0;
  if (hasNamed && hasPositional) {
    throw new Error('Không hỗ trợ trộn lẫn placeholder ? và @param trong cùng truy vấn.');
  }
  if (hasNamed) return 'named';
  if (hasPositional) return 'positional';
  return 'none';
}

function buildQuery(sql, type, args) {
  if (type === 'named') {
    const paramsObject = args && args.length > 0 ? args[0] || {} : {};
    if (paramsObject && typeof paramsObject !== 'object') {
      throw new Error('Truy vấn sử dụng @param yêu cầu truyền đối tượng tham số.');
    }
    const values = [];
    const text = sql.replace(NAMED_PLACEHOLDER, (_, name) => {
      values.push(Object.prototype.hasOwnProperty.call(paramsObject, name) ? paramsObject[name] : null);
      return '?';
    });
    NAMED_PLACEHOLDER.lastIndex = 0;
    return { text, values };
  }

  if (type === 'positional') {
    const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    return { text: sql, values: flatArgs };
  }

  return { text: sql, values: [] };
}

function createPreparedStatement(sql, connection) {
  const type = detectPlaceholderType(sql);

  const exec = async (mode, args) => {
    const target = connection || getPool();
    const { text, values } = buildQuery(sql, type, args);
    const [rows] = await target.query(text, values);
    
    if (mode === 'all') {
      return Array.isArray(rows) ? rows : [];
    }
    if (mode === 'get') {
      return Array.isArray(rows) ? (rows[0] || null) : null;
    }
    // For INSERT, UPDATE, DELETE
    return {
      changes: rows.affectedRows || 0,
      insertId: rows.insertId || null,
      rows: Array.isArray(rows) ? rows : []
    };
  };

  return {
    all: (...args) => exec('all', args),
    get: (...args) => exec('get', args),
    run: (...args) => exec('run', args)
  };
}

async function transaction(handler) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const txDb = {
      prepare: (sql) => createPreparedStatement(sql, connection)
    };
    const result = await handler(txDb);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

const db = {
  prepare: (sql) => createPreparedStatement(sql),
  transaction,
  get pool() {
    return getPool();
  }
};

module.exports = {
  db,
  initializeDatabase,
  getPool
};
