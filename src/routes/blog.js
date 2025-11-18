const express = require('express');
const slugify = require('slugify');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const BLOG_IMAGE_TYPES = ['cover', 'body', 'inline', 'quote', 'gallery'];
const BLOG_VIDEO_TYPES = ['hero', 'body', 'demo', 'interview'];

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return fallback;
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
  }
  return fallback;
};

const normalizePosition = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

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

function serializeBlog(row) {
  if (!row) return null;
  return {
    code: row.code,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    category: row.category,
    tags: parseJsonColumn(row.tags),
    keywords: parseJsonColumn(row.keywords),
    authorName: row.author_name,
    authorRole: row.author_role,
    publishedAt: row.published_at,
    status: row.status,
    isFeatured: row.is_featured === 1,
    galleryMedia: parseObjectArray(row.gallery_media),
    videoItems: parseObjectArray(row.video_items),
    sourceLinks: parseObjectArray(row.source_links),
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
      type: BLOG_IMAGE_TYPES.includes(item?.type) ? item.type : 'body',
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
      type: BLOG_VIDEO_TYPES.includes(item?.type) ? item.type : 'body',
      caption: ensureValue(item?.caption),
      position: normalizePosition(item?.position)
    }))
    .filter((item) => item.url);
}

function normalizeSourceLinks(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      label: ensureValue(item?.label) || 'Nguon tham khao',
      url: ensureValue(item?.url)
    }))
    .filter((item) => item.url);
}

router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const offset = parseInt(req.query.offset, 10) || 0;
  const search = (req.query.search || '').trim();
  const tag = (req.query.tag || '').trim();
  const category = (req.query.category || '').trim();
  const statusFilter = (req.query.status || '').trim();
  const featuredFilter = (req.query.featured || '').trim().toLowerCase();
  const excludeFeatured = (req.query.excludeFeatured || '').trim().toLowerCase();

  const whereClauses = [];
  const params = {
    limit,
    offset
  };

  if (search) {
    whereClauses.push(
      '(title LIKE @search OR excerpt LIKE @search OR content LIKE @search OR author_name LIKE @search)'
    );
    params.search = `%${search}%`;
  }

  if (tag) {
    whereClauses.push('(tags LIKE @tag)');
    params.tag = `%${tag}%`;
  }

  if (category) {
    whereClauses.push('(category = @category)');
    params.category = category;
  }

  if (statusFilter) {
    whereClauses.push('(status = @status)');
    params.status = statusFilter;
  }

  if (featuredFilter && featuredFilter !== '0' && featuredFilter !== 'false') {
    whereClauses.push('(is_featured = 1)');
  } else if (excludeFeatured && excludeFeatured !== '0' && excludeFeatured !== 'false') {
    whereClauses.push('(is_featured = 0)');
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `
      SELECT
        code,
        slug,
        title,
        subtitle,
        excerpt,
        content,
        image_url,
        category,
        tags,
        keywords,
        author_name,
        author_role,
        published_at,
        status,
        gallery_media,
        video_items,
        source_links,
        is_featured,
        created_at,
        updated_at
      FROM blog_posts
      ${whereSql}
      ORDER BY datetime(published_at) DESC
      LIMIT @limit OFFSET @offset
    `
    )
    .all(params)
    .map(serializeBlog);

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM blog_posts ${whereSql}`)
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
        title,
        subtitle,
        excerpt,
        content,
        image_url,
        category,
        tags,
        keywords,
        author_name,
        author_role,
        published_at,
        status,
        gallery_media,
        video_items,
        source_links,
        is_featured,
        created_at,
        updated_at
      FROM blog_posts
      WHERE code = @identifier OR slug = @identifier
    `
    )
    .get({ identifier });

  if (!row) {
    return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
  }

  res.json({ data: serializeBlog(row) });
});

router.post('/', requireAuth, (req, res) => {
  const {
    code,
    title,
    subtitle,
    excerpt,
    content,
    imageUrl,
    category,
    tags,
    keywords,
    authorName,
    authorRole,
    publishedAt,
    status,
    galleryMedia,
    videoItems,
    sourceLinks,
    isFeatured = false
  } = req.body || {};

  if (!code || !title || !content) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ mã, tiêu đề và nội dung bài viết.' });
  }

  const normalizedTags = normalizeArray(tags);
  const normalizedKeywords = normalizeArray(keywords);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const normalizedSources = normalizeSourceLinks(sourceLinks);
  const publishDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
  const slugBase = slugify(title, { lower: true, strict: true });
  const slug = `${slugBase}-${code.toLowerCase()}`;
  const featuredFlag = toBoolean(isFeatured);

  try {
    if (featuredFlag) {
      db.prepare('UPDATE blog_posts SET is_featured = 0 WHERE is_featured = 1').run();
    }
    db.prepare(
      `
      INSERT INTO blog_posts (
        code,
        slug,
        title,
        subtitle,
        excerpt,
        content,
        image_url,
        category,
        tags,
        keywords,
        author_name,
        author_role,
        published_at,
        status,
        gallery_media,
        video_items,
        source_links,
        is_featured
      ) VALUES (
        @code,
        @slug,
        @title,
        @subtitle,
        @excerpt,
        @content,
        @image_url,
        @category,
        @tags,
        @keywords,
        @author_name,
        @author_role,
        @published_at,
        @status,
        @gallery_media,
        @video_items,
        @source_links,
        @is_featured
      )
    `
    ).run({
      code,
      slug,
      title,
      subtitle: subtitle || null,
      excerpt: excerpt || (content ? content.slice(0, 220) : null),
      content,
      image_url: imageUrl || null,
      category: category || null,
      tags: JSON.stringify(normalizedTags),
      keywords: JSON.stringify(normalizedKeywords),
      author_name: authorName || null,
      author_role: authorRole || null,
      published_at: publishDate,
      status: status || 'published',
      gallery_media: JSON.stringify(normalizedMedia),
      video_items: JSON.stringify(normalizedVideos),
      source_links: JSON.stringify(normalizedSources),
      is_featured: featuredFlag ? 1 : 0
    });

    const created = db
      .prepare('SELECT * FROM blog_posts WHERE code = ?')
      .get(code);
    res.status(201).json({ data: serializeBlog(created) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Mã bài viết hoặc slug đã tồn tại.' });
    }
    console.error('Error creating blog post:', error);
    return res.status(500).json({ message: 'Không thể tạo bài viết mới.' });
  }
});

router.put('/:code', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM blog_posts WHERE code = ?').get(req.params.code);

  if (!existing) {
    return res.status(404).json({ message: 'Không tìm thấy bài viết để cập nhật.' });
  }

  const {
    title = existing.title,
    subtitle = existing.subtitle,
    excerpt = existing.excerpt,
    content = existing.content,
    imageUrl = existing.image_url,
    category = existing.category,
    tags = parseJsonColumn(existing.tags),
    keywords = parseJsonColumn(existing.keywords),
    authorName = existing.author_name,
    authorRole = existing.author_role,
    publishedAt = existing.published_at,
    status = existing.status,
    galleryMedia = parseObjectArray(existing.gallery_media),
    videoItems = parseObjectArray(existing.video_items),
    sourceLinks = parseObjectArray(existing.source_links),
    isFeatured = existing.is_featured === 1
  } = req.body || {};

  const normalizedTags = normalizeArray(tags);
  const normalizedKeywords = normalizeArray(keywords);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const normalizedSources = normalizeSourceLinks(sourceLinks);
  const slugBase = slugify(title, { lower: true, strict: true });
  const slug = `${slugBase}-${existing.code.toLowerCase()}`;
  const featuredFlag = toBoolean(isFeatured, existing.is_featured === 1);

  try {
    if (featuredFlag) {
      db.prepare('UPDATE blog_posts SET is_featured = 0 WHERE is_featured = 1 AND code != @code').run({ code: existing.code });
    }
    db.prepare(
      `
      UPDATE blog_posts SET
        title = @title,
        subtitle = @subtitle,
        excerpt = @excerpt,
        content = @content,
        image_url = @image_url,
        category = @category,
        tags = @tags,
        keywords = @keywords,
        author_name = @author_name,
        author_role = @author_role,
        published_at = @published_at,
        gallery_media = @gallery_media,
        video_items = @video_items,
        source_links = @source_links,
        status = @status,
        slug = @slug,
        is_featured = @is_featured
      WHERE code = @code
    `
    ).run({
      title,
      subtitle: subtitle || null,
      excerpt: excerpt || (content ? content.slice(0, 220) : null),
      content,
      image_url: imageUrl || null,
      category: category || null,
      tags: JSON.stringify(normalizedTags),
      keywords: JSON.stringify(normalizedKeywords),
      author_name: authorName || null,
      author_role: authorRole || null,
      published_at: new Date(publishedAt).toISOString(),
      gallery_media: JSON.stringify(normalizedMedia),
      video_items: JSON.stringify(normalizedVideos),
      source_links: JSON.stringify(normalizedSources),
      status,
      slug,
      is_featured: featuredFlag ? 1 : 0,
      code: existing.code
    });

    const updated = db.prepare('SELECT * FROM blog_posts WHERE code = ?').get(existing.code);
    res.json({ data: serializeBlog(updated) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Slug đã tồn tại, vui lòng đổi tiêu đề.' });
    }
    console.error('Error updating blog post:', error);
    return res.status(500).json({ message: 'Không thể cập nhật bài viết.' });
  }
});

router.delete('/:code', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM blog_posts WHERE code = ?').run(req.params.code);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Không tìm thấy bài viết để xóa.' });
  }
  return res.json({ message: 'Đã xóa bài viết.' });
});

module.exports = router;

