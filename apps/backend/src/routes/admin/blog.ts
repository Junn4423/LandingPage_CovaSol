import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  listAllBlogPosts,
  updateBlogPost
} from '../../services/blog.service';
import type { AuthenticatedRequest } from '../../middleware/require-auth';

const statusEnum = z.enum(['draft', 'published', 'archived', 'DRAFT', 'PUBLISHED', 'ARCHIVED']);

const mediaSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  position: z.number().int().min(0).max(500).optional().nullable()
});

const sourceSchema = z.object({
  label: z.string().min(1).optional().nullable(),
  url: z.string().url()
});

const blogPayloadSchema = z.object({
  title: z.string().min(4),
  subtitle: z.string().max(500).optional().nullable(),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  tags: z.array(z.string().min(1)).optional(),
  keywords: z.array(z.string().min(1)).optional(),
  imageUrl: z.string().url().optional().nullable(),
  category: z.string().max(160).optional().nullable(),
  authorName: z.string().max(120).optional().nullable(),
  authorRole: z.string().max(120).optional().nullable(),
  status: statusEnum.optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  galleryMedia: z.array(mediaSchema).optional(),
  videoItems: z.array(mediaSchema).optional(),
  sourceLinks: z.array(sourceSchema).optional()
});

export const adminBlogRouter = Router();

adminBlogRouter.get('/', async (_req, res) => {
  const posts = await listAllBlogPosts();
  res.json({ data: posts });
});

adminBlogRouter.get('/:id', async (req, res) => {
  const post = await getBlogPostById(req.params.id);
  if (!post) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  return res.json({ data: post });
});

adminBlogRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const parsed = blogPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const post = await createBlogPost({ ...parsed.data, authorId: req.user!.id });
  res.status(StatusCodes.CREATED).json({ data: post });
});

adminBlogRouter.put('/:id', async (req, res) => {
  const parsed = blogPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const post = await updateBlogPost(req.params.id, parsed.data);
  res.json({ data: post });
});

adminBlogRouter.delete('/:id', async (req, res) => {
  await deleteBlogPost(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
