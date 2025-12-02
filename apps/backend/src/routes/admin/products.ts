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

const ctaSchema = z.object({
  label: z.string().min(2).max(120).optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal(''))
}).partial();

const mediaSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  type: z.string().optional()
}).partial();

const stringArray = z.array(z.string().min(2)).optional();

const productPayloadSchema = z.object({
  name: z.string().min(3),
  slug: z.string().optional(),
  category: z.string().min(2).optional().nullable(),
  shortDescription: z.string().min(10).optional().nullable(),
  description: z.string().min(20),
  imageUrl: z.string().url().optional().nullable(),
  featureTags: stringArray,
  highlights: stringArray,
  status: z.enum(['draft', 'active', 'archived', 'DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  ctaPrimary: ctaSchema.optional(),
  ctaSecondary: ctaSchema.optional(),
  galleryMedia: z.array(mediaSchema).optional(),
  videoItems: z.array(mediaSchema).optional(),
  demoMedia: z.array(mediaSchema).optional()
});

function normalizeCta(cta?: { label?: string; url?: string }) {
  if (!cta) return undefined;
  const label = cta.label?.trim();
  const url = cta.url?.trim();
  if (!label && !url) {
    return undefined;
  }
  return { label, url };
}

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

  const product = await createProduct({
    ...parsed.data,
    ctaPrimary: normalizeCta(parsed.data.ctaPrimary),
    ctaSecondary: normalizeCta(parsed.data.ctaSecondary)
  });
  res.status(StatusCodes.CREATED).json({ data: product });
});

adminProductRouter.put('/:id', async (req, res) => {
  const parsed = productPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const product = await updateProduct(req.params.id, {
    ...parsed.data,
    ctaPrimary: normalizeCta(parsed.data.ctaPrimary),
    ctaSecondary: normalizeCta(parsed.data.ctaSecondary)
  });
  res.json({ data: product });
});

adminProductRouter.delete('/:id', async (req, res) => {
  await deleteProduct(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
