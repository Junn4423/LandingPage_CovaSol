const express = require('express');
const { blogService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all blog posts with pagination and filters
router.get('/', asyncHandler(async (req, res) => {
  const result = await blogService.getPosts({
    limit: parseInt(req.query.limit, 10) || 20,
    offset: parseInt(req.query.offset, 10) || 0,
    search: (req.query.search || '').trim(),
    tag: (req.query.tag || '').trim(),
    category: (req.query.category || '').trim(),
    status: (req.query.status || '').trim(),
    featured: (req.query.featured || '').trim().toLowerCase(),
    excludeFeatured: (req.query.excludeFeatured || '').trim().toLowerCase()
  });

  res.json(result);
}));

// Get single blog post by code or slug
router.get('/:identifier', asyncHandler(async (req, res) => {
  const post = await blogService.getPostByIdentifier(req.params.identifier);
  
  if (!post) {
    return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
  }

  res.json({ data: post });
}));

// Create new blog post
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const result = await blogService.createPost(req.body || {});

  if (!result.success) {
    const statusCode = result.conflict ? 409 : 400;
    return res.status(statusCode).json({ message: result.message });
  }

  res.status(201).json({ data: result.data });
}));

// Update existing blog post
router.put('/:code', requireAuth, asyncHandler(async (req, res) => {
  const result = await blogService.updatePost(req.params.code, req.body || {});

  if (!result.success) {
    const statusCode = result.notFound ? 404 : result.conflict ? 409 : 400;
    return res.status(statusCode).json({ message: result.message });
  }

  res.json({ data: result.data });
}));

// Delete blog post
router.delete('/:code', requireAuth, asyncHandler(async (req, res) => {
  const result = await blogService.deletePost(req.params.code);

  if (!result.success) {
    return res.status(404).json({ message: result.message });
  }

  return res.json({ message: result.message });
}));

module.exports = router;

