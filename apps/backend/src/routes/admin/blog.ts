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

const blogPayloadSchema = z.object({
  title: z.string().min(4),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  tags: z.array(z.string()).optional(),
  heroImage: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  slug: z.string().optional()
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
