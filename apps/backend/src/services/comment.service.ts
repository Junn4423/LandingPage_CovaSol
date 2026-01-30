import { prisma } from '../db/prisma';

export interface CommentInput {
  blogPostId: number;
  name: string;
  email: string | null;
  content: string;
  ipAddress: string;
}

export interface Comment {
  id: string;
  name: string;
  email?: string;
  content: string;
  status: string;
  createdAt: string;
}

function toComment(comment: any): Comment {
  return {
    id: String(comment.id),
    name: comment.name,
    email: comment.email || undefined,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt.toISOString()
  };
}

// Get approved comments for a blog post
export async function getCommentsByBlogId(blogPostId: number): Promise<Comment[]> {
  const comments = await prisma.blogComment.findMany({
    where: {
      blogPostId,
      status: 'approved'
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return comments.map(toComment);
}

// Get all comments for a blog post (admin)
export async function getAllCommentsByBlogId(blogPostId: number): Promise<Comment[]> {
  const comments = await prisma.blogComment.findMany({
    where: { blogPostId },
    orderBy: { createdAt: 'desc' }
  });
  
  return comments.map(toComment);
}

// Get all pending comments (admin)
export async function getPendingComments(): Promise<(Comment & { blogPostId: number })[]> {
  const comments = await prisma.blogComment.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' }
  });
  
  return comments.map(c => ({
    ...toComment(c),
    blogPostId: c.blogPostId
  }));
}

// Create a new comment (pending by default)
export async function createComment(input: CommentInput): Promise<Comment> {
  const comment = await prisma.blogComment.create({
    data: {
      blogPostId: input.blogPostId,
      name: input.name,
      email: input.email,
      content: input.content,
      ipAddress: input.ipAddress,
      status: 'pending'
    }
  });
  
  return toComment(comment);
}

// Update comment status (admin)
export async function updateCommentStatus(id: number, status: 'approved' | 'rejected'): Promise<Comment> {
  const comment = await prisma.blogComment.update({
    where: { id },
    data: { status }
  });
  
  return toComment(comment);
}

// Delete a comment (admin)
export async function deleteComment(id: number): Promise<void> {
  await prisma.blogComment.delete({ where: { id } });
}

// Get comment count for a blog post
export async function getCommentCount(blogPostId: number): Promise<number> {
  return prisma.blogComment.count({
    where: {
      blogPostId,
      status: 'approved'
    }
  });
}
