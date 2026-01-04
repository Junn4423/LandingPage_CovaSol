import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  listBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  listProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
} from '../../services/category.service';

const categoryPayloadSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional()
});

export const adminCategoriesRouter = Router();

// =====================================================
// Blog Categories
// =====================================================

adminCategoriesRouter.get('/blog', async (_req, res) => {
  const categories = await listBlogCategories();
  res.json({ data: categories });
});

adminCategoriesRouter.post('/blog', async (req, res) => {
  const parsed = categoryPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }
  
  try {
    const category = await createBlogCategory(parsed.data);
    res.status(StatusCodes.CREATED).json({ data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});

adminCategoriesRouter.put('/blog/:id', async (req, res) => {
  const parsed = categoryPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }
  
  try {
    const category = await updateBlogCategory(parseInt(req.params.id, 10), parsed.data);
    res.json({ data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});

adminCategoriesRouter.delete('/blog/:id', async (req, res) => {
  try {
    await deleteBlogCategory(parseInt(req.params.id, 10));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});

// =====================================================
// Product Categories
// =====================================================

adminCategoriesRouter.get('/products', async (_req, res) => {
  const categories = await listProductCategories();
  res.json({ data: categories });
});

adminCategoriesRouter.post('/products', async (req, res) => {
  const parsed = categoryPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }
  
  try {
    const category = await createProductCategory(parsed.data);
    res.status(StatusCodes.CREATED).json({ data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});

adminCategoriesRouter.put('/products/:id', async (req, res) => {
  const parsed = categoryPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }
  
  try {
    const category = await updateProductCategory(parseInt(req.params.id, 10), parsed.data);
    res.json({ data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});

adminCategoriesRouter.delete('/products/:id', async (req, res) => {
  try {
    await deleteProductCategory(parseInt(req.params.id, 10));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});
