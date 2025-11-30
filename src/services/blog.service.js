/**
 * Blog Service
 * Handles all blog post business logic
 */
const slugify = require('slugify');
const { db } = require('../db');

const BLOG_IMAGE_TYPES = ['cover', 'body', 'inline', 'quote', 'gallery'];
const BLOG_VIDEO_TYPES = ['hero', 'body', 'demo', 'interview'];

// ============ Utility Functions ============

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

const toIso = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

// ============ Serialization ============

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
    publishedAt: toIso(row.published_at),
    status: row.status,
    isFeatured: Number(row.is_featured) === 1,
    galleryMedia: parseObjectArray(row.gallery_media),
    videoItems: parseObjectArray(row.video_items),
    sourceLinks: parseObjectArray(row.source_links),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function generateSlug(title, code) {
  const slugBase = slugify(title, { lower: true, strict: true });
  return `${slugBase}-${code.toLowerCase()}`;
}

// ============ Database Operations ============

const SELECT_FIELDS = `
  code, slug, title, subtitle, excerpt, content, image_url, category,
  tags, keywords, author_name, author_role, published_at, status,
  gallery_media, video_items, source_links, is_featured, created_at, updated_at
`;

/**
 * Get paginated blog posts with filters
 */
async function getPosts({ limit = 20, offset = 0, search, tag, category, status, featured, excludeFeatured }) {
  const whereClauses = [];
  const params = { limit: Math.min(limit, 50), offset };

  if (search) {
    whereClauses.push('(title LIKE @search OR excerpt LIKE @search OR content LIKE @search OR author_name LIKE @search)');
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

  if (status) {
    whereClauses.push('(status = @status)');
    params.status = status;
  }

  if (featured && featured !== '0' && featured !== 'false') {
    whereClauses.push('(is_featured = 1)');
  } else if (excludeFeatured && excludeFeatured !== '0' && excludeFeatured !== 'false') {
    whereClauses.push('(is_featured = 0)');
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = await db
    .prepare(`SELECT ${SELECT_FIELDS} FROM blog_posts ${whereSql} ORDER BY published_at DESC LIMIT @limit OFFSET @offset`)
    .all(params);

  const totalRow = await db
    .prepare(`SELECT COUNT(*) as count FROM blog_posts ${whereSql}`)
    .get(params);

  return {
    data: rows.map(serializeBlog),
    pagination: {
      total: Number(totalRow?.count || 0),
      limit: params.limit,
      offset: params.offset
    }
  };
}

/**
 * Get single post by code or slug
 */
async function getPostByIdentifier(identifier) {
  const row = await db
    .prepare(`SELECT ${SELECT_FIELDS} FROM blog_posts WHERE code = @identifier OR slug = @identifier`)
    .get({ identifier });
  
  return row ? serializeBlog(row) : null;
}

/**
 * Get raw post by code (for updates)
 */
async function getRawPostByCode(code) {
  return db.prepare('SELECT * FROM blog_posts WHERE code = ?').get(code);
}

/**
 * Create a new blog post
 */
async function createPost(data) {
  const {
    code, title, subtitle, excerpt, content, imageUrl, category,
    tags, keywords, authorName, authorRole, publishedAt, status,
    galleryMedia, videoItems, sourceLinks, isFeatured = false
  } = data;

  if (!code || !title || !content) {
    return { success: false, message: 'Vui lòng cung cấp đầy đủ mã, tiêu đề và nội dung bài viết.' };
  }

  const normalizedTags = normalizeArray(tags);
  const normalizedKeywords = normalizeArray(keywords);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const normalizedSources = normalizeSourceLinks(sourceLinks);
  const publishDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
  const slug = generateSlug(title, code);
  const featuredFlag = toBoolean(isFeatured);

  try {
    if (featuredFlag) {
      await db.prepare('UPDATE blog_posts SET is_featured = 0 WHERE is_featured = 1').run();
    }

    await db.prepare(`
      INSERT INTO blog_posts (
        code, slug, title, subtitle, excerpt, content, image_url, category,
        tags, keywords, author_name, author_role, published_at, status,
        gallery_media, video_items, source_links, is_featured
      ) VALUES (
        @code, @slug, @title, @subtitle, @excerpt, @content, @image_url, @category,
        @tags, @keywords, @author_name, @author_role, @published_at, @status,
        @gallery_media, @video_items, @source_links, @is_featured
      )
    `).run({
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

    const created = await db.prepare('SELECT * FROM blog_posts WHERE code = ?').get(code);
    return { success: true, data: serializeBlog(created) };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return { success: false, message: 'Mã bài viết hoặc slug đã tồn tại.', conflict: true };
    }
    throw error;
  }
}

/**
 * Update an existing blog post
 */
async function updatePost(code, data) {
  const existing = await getRawPostByCode(code);
  if (!existing) {
    return { success: false, message: 'Không tìm thấy bài viết để cập nhật.', notFound: true };
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
    isFeatured = Number(existing.is_featured) === 1
  } = data;

  const normalizedTags = normalizeArray(tags);
  const normalizedKeywords = normalizeArray(keywords);
  const normalizedMedia = normalizeMediaItems(galleryMedia);
  const normalizedVideos = normalizeVideoItems(videoItems);
  const normalizedSources = normalizeSourceLinks(sourceLinks);
  const slug = generateSlug(title, existing.code);
  const featuredFlag = toBoolean(isFeatured, Number(existing.is_featured) === 1);

  try {
    if (featuredFlag) {
      await db.prepare('UPDATE blog_posts SET is_featured = 0 WHERE is_featured = 1 AND code != @code').run({ code: existing.code });
    }

    await db.prepare(`
      UPDATE blog_posts SET
        title = @title, subtitle = @subtitle, excerpt = @excerpt, content = @content,
        image_url = @image_url, category = @category, tags = @tags, keywords = @keywords,
        author_name = @author_name, author_role = @author_role, published_at = @published_at,
        gallery_media = @gallery_media, video_items = @video_items, source_links = @source_links,
        status = @status, slug = @slug, is_featured = @is_featured
      WHERE code = @code
    `).run({
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

    const updated = await db.prepare('SELECT * FROM blog_posts WHERE code = ?').get(existing.code);
    return { success: true, data: serializeBlog(updated) };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return { success: false, message: 'Slug đã tồn tại, vui lòng đổi tiêu đề.', conflict: true };
    }
    throw error;
  }
}

/**
 * Delete a blog post
 */
async function deletePost(code) {
  const result = await db.prepare('DELETE FROM blog_posts WHERE code = ?').run(code);
  if (result.changes === 0) {
    return { success: false, message: 'Không tìm thấy bài viết để xóa.', notFound: true };
  }
  return { success: true, message: 'Đã xóa bài viết.' };
}

module.exports = {
  // Utilities (exported for reuse)
  toBoolean,
  normalizeArray,
  normalizeMediaItems,
  normalizeVideoItems,
  normalizeSourceLinks,
  parseJsonColumn,
  parseObjectArray,
  serializeBlog,
  generateSlug,
  // Database operations
  getPosts,
  getPostByIdentifier,
  getRawPostByCode,
  createPost,
  updatePost,
  deletePost,
  // Constants
  BLOG_IMAGE_TYPES,
  BLOG_VIDEO_TYPES
};
