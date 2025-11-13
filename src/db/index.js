const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });

const db = new Database(config.dbFile);

function columnExists(table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((row) => row.name === column);
}

function ensureColumn(table, column, definitionSql) {
  if (!columnExists(table, column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definitionSql}`).run();
  }
}

function initializeDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS trg_admin_users_updated_at
    AFTER UPDATE ON admin_users
    FOR EACH ROW
    BEGIN
      UPDATE admin_users
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      excerpt TEXT,
      content TEXT NOT NULL,
      image_url TEXT,
      category TEXT,
      tags TEXT,
      keywords TEXT,
      author_name TEXT,
      author_role TEXT,
      published_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      gallery_media TEXT DEFAULT '[]',
      video_items TEXT DEFAULT '[]',
      source_links TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
      ON blog_posts (published_at DESC);

    CREATE TRIGGER IF NOT EXISTS trg_blog_posts_updated_at
    AFTER UPDATE ON blog_posts
    FOR EACH ROW
    BEGIN
      UPDATE blog_posts
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      short_description TEXT,
      description TEXT,
      image_url TEXT,
      feature_tags TEXT,
      highlights TEXT,
      cta_primary_label TEXT,
      cta_primary_url TEXT,
      cta_secondary_label TEXT,
      cta_secondary_url TEXT,
      gallery_media TEXT DEFAULT '[]',
      video_items TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
    AFTER UPDATE ON products
    FOR EACH ROW
    BEGIN
      UPDATE products
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;
  `);

  ensureColumn('blog_posts', 'gallery_media', "TEXT DEFAULT '[]'");
  ensureColumn('blog_posts', 'video_items', "TEXT DEFAULT '[]'");
  ensureColumn('blog_posts', 'source_links', "TEXT DEFAULT '[]'");

  ensureColumn('products', 'gallery_media', "TEXT DEFAULT '[]'");
  ensureColumn('products', 'video_items', "TEXT DEFAULT '[]'");
}

module.exports = {
  db,
  initializeDatabase
};
