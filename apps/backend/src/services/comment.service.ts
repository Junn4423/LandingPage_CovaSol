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
  blogPostId: number;
  name: string;
  email?: string;
  content: string;
  status: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithBlogInfo extends Comment {
  blogTitle?: string;
  blogSlug?: string;
}

function toComment(comment: any): Comment {
  return {
    id: String(comment.id),
    blogPostId: comment.blogPostId,
    name: comment.name,
    email: comment.email || undefined,
    content: comment.content,
    status: comment.status,
    ipAddress: comment.ipAddress || undefined,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString()
  };
}

function toCommentWithBlogInfo(comment: any): CommentWithBlogInfo {
  return {
    ...toComment(comment),
    blogTitle: comment.blogPost?.title,
    blogSlug: comment.blogPost?.slug
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
export async function getPendingComments(): Promise<CommentWithBlogInfo[]> {
  const comments = await prisma.blogComment.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: {
      blogPost: {
        select: { title: true, slug: true }
      }
    }
  });
  
  return comments.map(c => ({
    ...toComment(c),
    blogTitle: (c as any).blogPost?.title,
    blogSlug: (c as any).blogPost?.slug
  }));
}

// Get all comments with pagination and filters (admin)
export async function getAllComments(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  blogPostId?: number;
  search?: string;
}): Promise<{ comments: CommentWithBlogInfo[]; total: number; page: number; pageSize: number }> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (params?.status) where.status = params.status;
  if (params?.blogPostId) where.blogPostId = params.blogPostId;
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
      { content: { contains: params.search } }
    ];
  }

  const [comments, total] = await Promise.all([
    prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        blogPost: {
          select: { title: true, slug: true }
        }
      }
    }),
    prisma.blogComment.count({ where })
  ]);

  return {
    comments: comments.map(c => ({
      ...toComment(c),
      blogTitle: (c as any).blogPost?.title,
      blogSlug: (c as any).blogPost?.slug
    })),
    total,
    page,
    pageSize
  };
}

// Get comment stats (admin)
export async function getCommentStats(): Promise<{
  totalComments: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}> {
  const [totalComments, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.blogComment.count(),
    prisma.blogComment.count({ where: { status: 'pending' } }),
    prisma.blogComment.count({ where: { status: 'approved' } }),
    prisma.blogComment.count({ where: { status: 'rejected' } })
  ]);

  return { totalComments, pendingCount, approvedCount, rejectedCount };
}

// Get comment by ID (admin)
export async function getCommentById(id: number): Promise<CommentWithBlogInfo | null> {
  const comment = await prisma.blogComment.findUnique({
    where: { id },
    include: {
      blogPost: {
        select: { title: true, slug: true }
      }
    }
  });
  
  if (!comment) return null;
  return {
    ...toComment(comment),
    blogTitle: (comment as any).blogPost?.title,
    blogSlug: (comment as any).blogPost?.slug
  };
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

// Update comment (admin)
export async function updateComment(id: number, data: {
  name?: string;
  email?: string | null;
  content?: string;
  status?: 'pending' | 'approved' | 'rejected';
}): Promise<Comment> {
  const comment = await prisma.blogComment.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.content && { content: data.content }),
      ...(data.status && { status: data.status })
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
