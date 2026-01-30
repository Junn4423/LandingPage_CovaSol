import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  getPendingComments,
  getAllCommentsByBlogId,
  updateCommentStatus,
  deleteComment
} from '../../services/comment.service';

export const adminCommentsRouter = Router();

// Get all pending comments
adminCommentsRouter.get('/pending', async (_req, res) => {
  const comments = await getPendingComments();
  res.json({ data: comments });
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
