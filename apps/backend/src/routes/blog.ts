import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { listPublishedBlogPosts, getBlogPostBySlug } from '../services/blog.service';

export const blogRouter = Router();

blogRouter.get('/', async (_req, res) => {
  const posts = await listPublishedBlogPosts();
  res.json({ data: posts });
});

blogRouter.get('/:slug', async (req, res) => {
  const post = await getBlogPostBySlug(req.params.slug);
  if (!post) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  return res.json({ data: post });
});
