const express = require('express');
const slugify = require('slugify');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const PRODUCT_IMAGE_TYPES = ['hero', 'gallery', 'body', 'detail'];
const PRODUCT_VIDEO_TYPES = ['hero', 'demo', 'body', 'testimonial'];

function parseJsonColumn(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function parseObjectArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

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
    ctaPrimary: {
      label: row.cta_primary_label,
      url: row.cta_primary_url
    },
    ctaSecondary: {
      label: row.cta_secondary_label,
      url: row.cta_secondary_url
    },
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
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
      caption: ensureValue(item?.caption)
    }))
    .filter((item) => item.url);
}

function normalizeVideoItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      url: ensureValue(item?.url),
      type: PRODUCT_VIDEO_TYPES.includes(item?.type) ? item.type : 'demo',
      caption: ensureValue(item?.caption)
    }))
    .filter((item) => item.url);
}

router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const offset = parseInt(req.query.offset, 10) || 0;
  const search = (req.query.search || '').trim();
  const category = (req.query.category || '').trim();
  const statusFilter = (req.query.status || '').trim();

  const whereClauses = [];
  const params = { limit, offset };

  if (search) {
    whereClauses.push(
      '(name LIKE @search OR short_description LIKE @search OR description LIKE @search)'
    );
    params.search = `%${search}%`;
  }

  if (category) {
    whereClauses.push('(category = @category)');
    params.category = category;
  }

  if (statusFilter) {
    whereClauses.push('(status = @status)');
    params.status = statusFilter;
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `
      SELECT
        code,
        slug,
        name,
        category,
        short_description,
        description,
        image_url,
        feature_tags,
        highlights,
        gallery_media,
        video_items,
        cta_primary_label,
        cta_primary_url,
        cta_secondary_label,
        cta_secondary_url,
        status,
        created_at,
        updated_at
      FROM products
      ${whereSql}
      ORDER BY datetime(created_at) DESC
      LIMIT @limit OFFSET @offset
    `
    )
    .all(params)
    .map(serializeProduct);

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM products ${whereSql}`)
    .get(params).count;

  res.json({
    data: rows,
    pagination: {
      total,
      limit,
      offset
    }
  });
});

router.get('/:identifier', (req, res) => {
  const identifier = req.params.identifier;
  const row = db
    .prepare(
      `
      SELECT
        code,
        slug,
        name,
        category,
        short_description,
        description,
        image_url,
        feature_tags,
        highlights,
        gallery_media,
        video_items,
        cta_primary_label,
        cta_primary_url,
        cta_secondary_label,
        cta_secondary_url,
        status,
        created_at,
        updated_at
      FROM products
      WHERE code = @identifier OR slug = @identifier
    `
    )
    .get({ identifier });

  if (!row) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
  }

  res.json({ data: serializeProduct(row) });
});

router.post('/', requireAuth, (req, res) => {
  const {
    code,
    name,
    category,
    shortDescription,
    description,
    imageUrl,
    featureTags,
    highlights,
    ctaPrimary,
    ctaSecondary,
    status,
    galleryMedia,
    videoItems
  } = req.body || {};

  if (!code || !name || !description) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ mã, tên và mô tả sản phẩm.' });
  }

  const normalizedFeatureTags = normalizeArray(featureTags);
  const normalizedHighlights = normalizeArray(highlights);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const slugBase = slugify(name, { lower: true, strict: true });
  const slug = `${slugBase}-${code.toLowerCase()}`;

  try {
    db.prepare(
      `
      INSERT INTO products (
        code,
        slug,
        name,
        category,
        short_description,
        description,
        image_url,
        feature_tags,
        highlights,
        gallery_media,
        video_items,
        cta_primary_label,
        cta_primary_url,
        cta_secondary_label,
        cta_secondary_url,
        status
      ) VALUES (
        @code,
        @slug,
        @name,
        @category,
        @short_description,
        @description,
        @image_url,
        @feature_tags,
        @highlights,
        @gallery_media,
        @video_items,
        @cta_primary_label,
        @cta_primary_url,
        @cta_secondary_label,
        @cta_secondary_url,
        @status
      )
    `
    ).run({
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
      cta_primary_label: ctaPrimary?.label || null,
      cta_primary_url: ctaPrimary?.url || null,
      cta_secondary_label: ctaSecondary?.label || null,
      cta_secondary_url: ctaSecondary?.url || null,
      status: status || 'active'
    });

    const created = db.prepare('SELECT * FROM products WHERE code = ?').get(code);
    res.status(201).json({ data: serializeProduct(created) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Mã sản phẩm hoặc slug đã tồn tại.' });
    }
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Không thể tạo sản phẩm mới.' });
  }
});

router.put('/:code', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE code = ?').get(req.params.code);

  if (!existing) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật.' });
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
    ctaPrimary = {
      label: existing.cta_primary_label,
      url: existing.cta_primary_url
    },
    ctaSecondary = {
      label: existing.cta_secondary_label,
      url: existing.cta_secondary_url
    },
    status = existing.status
  } = req.body || {};

  const normalizedFeatureTags = normalizeArray(featureTags);
  const normalizedHighlights = normalizeArray(highlights);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const slugBase = slugify(name, { lower: true, strict: true });
  const slug = `${slugBase}-${existing.code.toLowerCase()}`;

  try {
    db.prepare(
      `
      UPDATE products SET
        name = @name,
        category = @category,
        short_description = @short_description,
        description = @description,
        image_url = @image_url,
        feature_tags = @feature_tags,
        highlights = @highlights,
        gallery_media = @gallery_media,
        video_items = @video_items,
        cta_primary_label = @cta_primary_label,
        cta_primary_url = @cta_primary_url,
        cta_secondary_label = @cta_secondary_label,
        cta_secondary_url = @cta_secondary_url,
        status = @status,
        slug = @slug
      WHERE code = @code
    `
    ).run({
      name,
      category: category || null,
      short_description: shortDescription || null,
      description,
      image_url: imageUrl || null,
      feature_tags: JSON.stringify(normalizedFeatureTags),
      highlights: JSON.stringify(normalizedHighlights),
      gallery_media: JSON.stringify(normalizedMedia),
      video_items: JSON.stringify(normalizedVideos),
      cta_primary_label: ctaPrimary?.label || null,
      cta_primary_url: ctaPrimary?.url || null,
      cta_secondary_label: ctaSecondary?.label || null,
      cta_secondary_url: ctaSecondary?.url || null,
      status,
      slug,
      code: existing.code
    });

    const updated = db.prepare('SELECT * FROM products WHERE code = ?').get(existing.code);
    res.json({ data: serializeProduct(updated) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Slug đã tồn tại, vui lòng đổi tên sản phẩm.' });
    }
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Không thể cập nhật sản phẩm.' });
  }
});

router.delete('/:code', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE code = ?').run(req.params.code);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa.' });
  }
  return res.json({ message: 'Đã xóa sản phẩm.' });
});

module.exports = router;

