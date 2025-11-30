const express = require('express');
const { productService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with pagination and filters
router.get('/', asyncHandler(async (req, res) => {
  const result = await productService.getProducts({
    limit: parseInt(req.query.limit, 10) || 20,
    offset: parseInt(req.query.offset, 10) || 0,
    search: (req.query.search || '').trim(),
    category: (req.query.category || '').trim(),
    status: (req.query.status || '').trim()
  });

  res.json(result);
}));

// Get single product by code or slug
router.get('/:identifier', asyncHandler(async (req, res) => {
  const product = await productService.getProductByIdentifier(req.params.identifier);
  
  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
  }

  res.json({ data: product });
}));

// Create new product
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const result = await productService.createProduct(req.body || {});

  if (!result.success) {
    const statusCode = result.conflict ? 409 : 400;
    return res.status(statusCode).json({ message: result.message });
  }

  res.status(201).json({ data: result.data });
}));

// Update existing product
router.put('/:code', requireAuth, asyncHandler(async (req, res) => {
  const result = await productService.updateProduct(req.params.code, req.body || {});

  if (!result.success) {
    const statusCode = result.notFound ? 404 : result.conflict ? 409 : 400;
    return res.status(statusCode).json({ message: result.message });
  }

  res.json({ data: result.data });
}));

// Delete product
router.delete('/:code', requireAuth, asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.code);

  if (!result.success) {
    return res.status(404).json({ message: result.message });
  }

  return res.json({ message: result.message });
}));

module.exports = router;

