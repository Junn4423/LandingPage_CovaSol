/**
 * Product Service
 * Handles all product business logic
 */
const slugify = require('slugify');
const { db } = require('../db');

const PRODUCT_IMAGE_TYPES = ['hero', 'gallery', 'body', 'detail'];
const PRODUCT_VIDEO_TYPES = ['hero', 'demo', 'body', 'testimonial'];

// ============ Utility Functions ============

const normalizePosition = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

function parseJsonColumn(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseObjectArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
}

function ensureValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeMediaItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      url: ensureValue(item?.url),
      type: PRODUCT_IMAGE_TYPES.includes(item?.type) ? item.type : 'gallery',
      caption: ensureValue(item?.caption),
      position: normalizePosition(item?.position)
    }))
    .filter((item) => item.url);
}

function normalizeVideoItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      url: ensureValue(item?.url),
      type: PRODUCT_VIDEO_TYPES.includes(item?.type) ? item.type : 'demo',
      caption: ensureValue(item?.caption),
      position: normalizePosition(item?.position)
    }))
    .filter((item) => item.url);
}

function normalizeDemoImages(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      url: ensureValue(item?.url),
      caption: ensureValue(item?.caption)
    }))
    .filter((item) => item.url);
}

const toIso = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

// ============ Serialization ============

function serializeProduct(row) {
  if (!row) return null;
  return {
    code: row.code,
    slug: row.slug,
    name: row.name,
    category: row.category,
    shortDescription: row.short_description,
    description: row.description,
    imageUrl: row.image_url,
    featureTags: parseJsonColumn(row.feature_tags),
    highlights: parseJsonColumn(row.highlights),
    galleryMedia: parseObjectArray(row.gallery_media),
    videoItems: parseObjectArray(row.video_items),
    demoMedia: parseObjectArray(row.demo_media),
    ctaPrimary: {
      label: row.cta_primary_label,
      url: row.cta_primary_url
    },
    ctaSecondary: {
      label: row.cta_secondary_label,
      url: row.cta_secondary_url
    },
    status: row.status,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function generateSlug(name, code) {
  const slugBase = slugify(name, { lower: true, strict: true });
  return `${slugBase}-${code.toLowerCase()}`;
}

// ============ Database Operations ============

const SELECT_FIELDS = `
  code, slug, name, category, short_description, description, image_url,
  feature_tags, highlights, gallery_media, video_items, demo_media,
  cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url,
  status, created_at, updated_at
`;

/**
 * Get paginated products with filters
 */
async function getProducts({ limit = 20, offset = 0, search, category, status }) {
  const whereClauses = [];
  const params = { limit: Math.min(limit, 50), offset };

  if (search) {
    whereClauses.push('(name LIKE @search OR short_description LIKE @search OR description LIKE @search)');
    params.search = `%${search}%`;
  }

  if (category) {
    whereClauses.push('(category = @category)');
    params.category = category;
  }

  if (status) {
    whereClauses.push('(status = @status)');
    params.status = status;
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = await db
    .prepare(`SELECT ${SELECT_FIELDS} FROM products ${whereSql} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`)
    .all(params);

  const totalRow = await db
    .prepare(`SELECT COUNT(*) as count FROM products ${whereSql}`)
    .get(params);

  return {
    data: rows.map(serializeProduct),
    pagination: {
      total: Number(totalRow?.count || 0),
      limit: params.limit,
      offset: params.offset
    }
  };
}

/**
 * Get single product by code or slug
 */
async function getProductByIdentifier(identifier) {
  const row = await db
    .prepare(`SELECT ${SELECT_FIELDS} FROM products WHERE code = @identifier OR slug = @identifier`)
    .get({ identifier });

  return row ? serializeProduct(row) : null;
}

/**
 * Get raw product by code (for updates)
 */
async function getRawProductByCode(code) {
  return db.prepare('SELECT * FROM products WHERE code = ?').get(code);
}

/**
 * Create a new product
 */
async function createProduct(data) {
  const {
    code, name, category, shortDescription, description, imageUrl,
    featureTags, highlights, ctaPrimary, ctaSecondary, status,
    galleryMedia, videoItems, demoMedia
  } = data;

  if (!code || !name || !description) {
    return { success: false, message: 'Vui lòng cung cấp đầy đủ mã, tên và mô tả sản phẩm.' };
  }

  const normalizedFeatureTags = normalizeArray(featureTags);
  const normalizedHighlights = normalizeArray(highlights);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const normalizedDemoMedia = normalizeDemoImages(demoMedia);
  const slug = generateSlug(name, code);

  try {
    await db.prepare(`
      INSERT INTO products (
        code, slug, name, category, short_description, description, image_url,
        feature_tags, highlights, gallery_media, video_items, demo_media,
        cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, status
      ) VALUES (
        @code, @slug, @name, @category, @short_description, @description, @image_url,
        @feature_tags, @highlights, @gallery_media, @video_items, @demo_media,
        @cta_primary_label, @cta_primary_url, @cta_secondary_label, @cta_secondary_url, @status
      )
    `).run({
      code,
      slug,
      name,
      category: category || null,
      short_description: shortDescription || null,
      description,
      image_url: imageUrl || null,
      feature_tags: JSON.stringify(normalizedFeatureTags),
      highlights: JSON.stringify(normalizedHighlights),
      gallery_media: JSON.stringify(normalizedMedia),
      video_items: JSON.stringify(normalizedVideos),
      demo_media: JSON.stringify(normalizedDemoMedia),
      cta_primary_label: ctaPrimary?.label || null,
      cta_primary_url: ctaPrimary?.url || null,
      cta_secondary_label: ctaSecondary?.label || null,
      cta_secondary_url: ctaSecondary?.url || null,
      status: status || 'active'
    });

    const created = await db.prepare('SELECT * FROM products WHERE code = ?').get(code);
    return { success: true, data: serializeProduct(created) };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return { success: false, message: 'Mã sản phẩm hoặc slug đã tồn tại.', conflict: true };
    }
    throw error;
  }
}

/**
 * Update an existing product
 */
async function updateProduct(code, data) {
  const existing = await getRawProductByCode(code);
  if (!existing) {
    return { success: false, message: 'Không tìm thấy sản phẩm để cập nhật.', notFound: true };
  }

  const {
    name = existing.name,
    category = existing.category,
    shortDescription = existing.short_description,
    description = existing.description,
    imageUrl = existing.image_url,
    featureTags = parseJsonColumn(existing.feature_tags),
    highlights = parseJsonColumn(existing.highlights),
    galleryMedia = parseObjectArray(existing.gallery_media),
    videoItems = parseObjectArray(existing.video_items),
    demoMedia = parseObjectArray(existing.demo_media),
    ctaPrimary = { label: existing.cta_primary_label, url: existing.cta_primary_url },
    ctaSecondary = { label: existing.cta_secondary_label, url: existing.cta_secondary_url },
    status = existing.status
  } = data;

  const normalizedFeatureTags = normalizeArray(featureTags);
  const normalizedHighlights = normalizeArray(highlights);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const normalizedDemoMedia = normalizeDemoImages(demoMedia);
  const slug = generateSlug(name, existing.code);

  try {
    await db.prepare(`
      UPDATE products SET
        name = @name, category = @category, short_description = @short_description,
        description = @description, image_url = @image_url, feature_tags = @feature_tags,
        highlights = @highlights, gallery_media = @gallery_media, video_items = @video_items,
        demo_media = @demo_media, cta_primary_label = @cta_primary_label,
        cta_primary_url = @cta_primary_url, cta_secondary_label = @cta_secondary_label,
        cta_secondary_url = @cta_secondary_url, status = @status, slug = @slug
      WHERE code = @code
    `).run({
      name,
      category: category || null,
      short_description: shortDescription || null,
      description,
      image_url: imageUrl || null,
      feature_tags: JSON.stringify(normalizedFeatureTags),
      highlights: JSON.stringify(normalizedHighlights),
      gallery_media: JSON.stringify(normalizedMedia),
      video_items: JSON.stringify(normalizedVideos),
      demo_media: JSON.stringify(normalizedDemoMedia),
      cta_primary_label: ctaPrimary?.label || null,
      cta_primary_url: ctaPrimary?.url || null,
      cta_secondary_label: ctaSecondary?.label || null,
      cta_secondary_url: ctaSecondary?.url || null,
      status,
      slug,
      code: existing.code
    });

    const updated = await db.prepare('SELECT * FROM products WHERE code = ?').get(existing.code);
    return { success: true, data: serializeProduct(updated) };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return { success: false, message: 'Slug đã tồn tại, vui lòng đổi tên sản phẩm.', conflict: true };
    }
    throw error;
  }
}

/**
 * Delete a product
 */
async function deleteProduct(code) {
  const result = await db.prepare('DELETE FROM products WHERE code = ?').run(code);
  if (result.changes === 0) {
    return { success: false, message: 'Không tìm thấy sản phẩm để xóa.', notFound: true };
  }
  return { success: true, message: 'Đã xóa sản phẩm.' };
}

module.exports = {
  // Utilities
  normalizeArray,
  normalizeMediaItems,
  normalizeVideoItems,
  normalizeDemoImages,
  parseJsonColumn,
  parseObjectArray,
  serializeProduct,
  generateSlug,
  // Database operations
  getProducts,
  getProductByIdentifier,
  getRawProductByCode,
  createProduct,
  updateProduct,
  deleteProduct,
  // Constants
  PRODUCT_IMAGE_TYPES,
  PRODUCT_VIDEO_TYPES
};
