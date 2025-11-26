import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listAllProducts,
  updateProduct
} from '../../services/products.service';

const metricSchema = z.object({
  label: z.string().min(2),
  value: z.string().min(1)
});

const productPayloadSchema = z.object({
  name: z.string().min(3),
  headline: z.string().min(5),
  summary: z.string().min(10),
  description: z.string().min(20),
  category: z.string().min(2),
  thumbnail: z.string().url().optional().nullable(),
  features: z.array(z.string().min(2)).optional(),
  metrics: z.array(metricSchema).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  slug: z.string().optional()
});

export const adminProductRouter = Router();

adminProductRouter.get('/', async (_req, res) => {
  const products = await listAllProducts();
  res.json({ data: products });
});

adminProductRouter.get('/:id', async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' });
  }
  return res.json({ data: product });
});

adminProductRouter.post('/', async (req, res) => {
  const parsed = productPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const product = await createProduct(parsed.data);
  res.status(StatusCodes.CREATED).json({ data: product });
});

adminProductRouter.put('/:id', async (req, res) => {
  const parsed = productPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const product = await updateProduct(req.params.id, parsed.data);
  res.json({ data: product });
});

adminProductRouter.delete('/:id', async (req, res) => {
  await deleteProduct(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
