import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  getPendingComments,
  getAllCommentsByBlogId,
  getAllComments,
  getCommentStats,
  getCommentById,
  updateCommentStatus,
  updateComment,
  deleteComment
} from '../../services/comment.service';

export const adminCommentsRouter = Router();

// Get comment stats
adminCommentsRouter.get('/stats', async (_req, res) => {
  const stats = await getCommentStats();
  res.json({ data: stats });
});

// Get all pending comments
adminCommentsRouter.get('/pending', async (_req, res) => {
  const comments = await getPendingComments();
  res.json({ data: comments });
});

// Get all comments with pagination and filters
adminCommentsRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
  const status = req.query.status as string | undefined;
  const blogPostId = req.query.blogPostId ? parseInt(req.query.blogPostId as string, 10) : undefined;
  const search = req.query.search as string | undefined;

  const result = await getAllComments({ page, pageSize, status, blogPostId, search });
  return res.json({
    data: result.comments,
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / result.pageSize)
    }
  });
});

// Get all comments for a specific blog post
adminCommentsRouter.get('/blog/:blogId', async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10);
  if (isNaN(blogId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid blog ID' });
  }
  
  const comments = await getAllCommentsByBlogId(blogId);
  return res.json({ data: comments });
});

// Get comment by ID
adminCommentsRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid comment ID' });
  }
  
  const comment = await getCommentById(id);
  if (!comment) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
  }
  return res.json({ data: comment });
});

// Update comment
const updateCommentSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  content: z.string().min(1).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

adminCommentsRouter.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid comment ID' });
  }

  const parsed = updateCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }
  
  try {
    const comment = await updateComment(id, parsed.data);
    return res.json({ data: comment });
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
  }
});

// Approve a comment
adminCommentsRouter.put('/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid comment ID' });
  }
  
  try {
    const comment = await updateCommentStatus(id, 'approved');
    return res.json({ data: comment });
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
  }
});

// Reject a comment
adminCommentsRouter.put('/:id/reject', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid comment ID' });
  }
  
  try {
    const comment = await updateCommentStatus(id, 'rejected');
    return res.json({ data: comment });
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
  }
});

// Delete a comment
adminCommentsRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid comment ID' });
  }
  
  try {
    await deleteComment(id);
    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
  }
});
