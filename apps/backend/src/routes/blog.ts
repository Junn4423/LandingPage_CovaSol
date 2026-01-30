import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { listPublishedBlogPosts, getBlogPostBySlug, searchBlogPosts, trackBlogView, getRelatedPosts } from '../services/blog.service';
import { getCommentsByBlogId, createComment } from '../services/comment.service';

export const blogRouter = Router();

function getClientIp(req: any): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) return ip;
  }
  return req.ip || 'unknown';
}

blogRouter.get('/', async (_req, res) => {
  const posts = await listPublishedBlogPosts();
  res.json({ data: posts });
});

// Search blog posts
blogRouter.get('/search', async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Query must be at least 2 characters' });
  }
  const posts = await searchBlogPosts(query.trim());
  return res.json({ data: posts });
});

blogRouter.get('/:slug', async (req, res) => {
  const post = await getBlogPostBySlug(req.params.slug);
  if (!post) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  return res.json({ data: post });
});

// Track view count
blogRouter.post('/:slug/view', async (req, res) => {
  const { slug } = req.params;
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.id) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  
  const viewCount = await trackBlogView(parseInt(post.id), ipAddress, userAgent);
  return res.json({ viewCount });
});

// Get related posts
blogRouter.get('/:slug/related', async (req, res) => {
  const { slug } = req.params;
  const limit = parseInt(req.query.limit as string) || 6;
  
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.id) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  
  const relatedPosts = await getRelatedPosts(parseInt(post.id), post.category, post.tags, limit);
  return res.json({ data: relatedPosts });
});

// Get comments for a blog post
blogRouter.get('/:slug/comments', async (req, res) => {
  const { slug } = req.params;
  
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.id) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  
  const comments = await getCommentsByBlogId(parseInt(post.id));
  return res.json({ comments });
});

// Post a comment
blogRouter.post('/:slug/comments', async (req, res) => {
  const { slug } = req.params;
  const { name, email, content } = req.body;
  
  if (!name || !content) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tên và nội dung bình luận là bắt buộc' });
  }
  
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.id) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  
  const ipAddress = getClientIp(req);
  
  const comment = await createComment({
    blogPostId: parseInt(post.id),
    name: name.trim(),
    email: email?.trim() || null,
    content: content.trim(),
    ipAddress
  });
  
  return res.status(StatusCodes.CREATED).json({ comment });
});
