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
import {
  createEditRequest,
  getPendingRequestsForAuthor,
  getPendingRequestsForPost,
  getEditRequestById,
  approveEditRequest,
  rejectEditRequest,
  deleteEditRequest,
  getRequestsByUser
} from '../../services/blog-edit-request.service';
import { isAuthorNameRegistered } from '../../services/users.service';
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
  const cleanPayload = {
    ...parsed.data,
    subtitle: parsed.data.subtitle ?? undefined,
    imageUrl: parsed.data.imageUrl ?? undefined,
    category: parsed.data.category ?? undefined,
    authorName: parsed.data.authorName ?? undefined,
    authorRole: parsed.data.authorRole ?? undefined,
    publishedAt: parsed.data.publishedAt ?? undefined
  };

  const post = await createBlogPost({ ...cleanPayload, authorId: req.user!.id });
  res.status(StatusCodes.CREATED).json({ data: post });
});

adminBlogRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  const parsed = blogPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  // Get the current post to check ownership
  const existingPost = await getBlogPostById(req.params.id);
  if (!existingPost) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }

  const currentUser = req.user!;
  const isOwner = existingPost.authorId && String(existingPost.authorId) === String(currentUser.id);
  const isSuperAdmin = currentUser.role === 'super-admin';
  
  // Check if the current author name matches any registered user
  // If authorName doesn't match any user, anyone can edit freely
  const authorNameIsRegistered = existingPost.authorName 
    ? await isAuthorNameRegistered(existingPost.authorName)
    : false;
  
  // If author name is not registered (doesn't match any user), allow free editing
  const canEditFreely = !existingPost.authorId && !authorNameIsRegistered;

  // Check if user needs to request approval
  // Only super-admin, the post owner, or posts with unregistered authors can be directly edited
  const needsApproval = !isOwner && !isSuperAdmin && !canEditFreely;

  const cleanPayload = {
    ...parsed.data,
    subtitle: parsed.data.subtitle ?? undefined,
    imageUrl: parsed.data.imageUrl ?? undefined,
    category: parsed.data.category ?? undefined,
    authorName: parsed.data.authorName ?? undefined,
    authorRole: parsed.data.authorRole ?? undefined,
    publishedAt: parsed.data.publishedAt ?? undefined
  };

  if (needsApproval) {
    // Create an edit request instead of directly updating
    const editRequest = await createEditRequest({
      blogPostId: parseInt(req.params.id, 10),
      requesterId: currentUser.id,
      proposedData: cleanPayload as Record<string, unknown>
    });
    
    return res.status(StatusCodes.ACCEPTED).json({ 
      message: 'Yêu cầu sửa bài đã được gửi đến tác giả để duyệt',
      editRequest 
    });
  }

  // For super-admin editing others' posts, preserve the original author info
  if (isSuperAdmin && !isOwner) {
    // Don't allow changing author name/id
    delete cleanPayload.authorName;
  }

  const post = await updateBlogPost(req.params.id, cleanPayload);
  res.json({ data: post });
});

// =====================================================
// Edit Request Routes
// =====================================================

// Get all pending edit requests for posts authored by current user
adminBlogRouter.get('/edit-requests/my-posts', async (req: AuthenticatedRequest, res) => {
  const requests = await getPendingRequestsForAuthor(req.user!.id);
  res.json({ data: requests });
});

// Get all edit requests made by current user (any status)
adminBlogRouter.get('/edit-requests/my-requests', async (req: AuthenticatedRequest, res) => {
  const requests = await getRequestsByUser(req.user!.id);
  res.json({ data: requests });
});

// Get pending edit requests for a specific post
adminBlogRouter.get('/:id/edit-requests', async (req: AuthenticatedRequest, res) => {
  const postId = parseInt(req.params.id, 10);
  const requests = await getPendingRequestsForPost(postId);
  res.json({ data: requests });
});

// Get a specific edit request
adminBlogRouter.get('/edit-requests/:requestId', async (req: AuthenticatedRequest, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  const editRequest = await getEditRequestById(requestId);
  
  if (!editRequest) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy yêu cầu sửa bài' });
  }
  
  return res.json({ data: editRequest });
});

// Approve an edit request (only post author or super-admin)
adminBlogRouter.post('/edit-requests/:requestId/approve', async (req: AuthenticatedRequest, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  const editRequest = await getEditRequestById(requestId);
  
  if (!editRequest) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy yêu cầu sửa bài' });
  }
  
  // Get the post to verify ownership
  const post = await getBlogPostById(editRequest.blogPostId);
  if (!post) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  
  const currentUser = req.user!;
  const isOwner = post.authorId && String(post.authorId) === String(currentUser.id);
  const isSuperAdmin = currentUser.role === 'super-admin';
  
  if (!isOwner && !isSuperAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({ 
      message: 'Chỉ tác giả hoặc super-admin mới có quyền duyệt yêu cầu sửa bài' 
    });
  }
  
  const { reviewNote } = req.body || {};
  const approved = await approveEditRequest(requestId, reviewNote);
  res.json({ data: approved, message: 'Đã duyệt và áp dụng các thay đổi' });
});

// Reject an edit request (only post author or super-admin)
adminBlogRouter.post('/edit-requests/:requestId/reject', async (req: AuthenticatedRequest, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  const editRequest = await getEditRequestById(requestId);
  
  if (!editRequest) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy yêu cầu sửa bài' });
  }
  
  // Get the post to verify ownership
  const post = await getBlogPostById(editRequest.blogPostId);
  if (!post) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
  }
  
  const currentUser = req.user!;
  const isOwner = post.authorId && String(post.authorId) === String(currentUser.id);
  const isSuperAdmin = currentUser.role === 'super-admin';
  
  if (!isOwner && !isSuperAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({ 
      message: 'Chỉ tác giả hoặc super-admin mới có quyền từ chối yêu cầu sửa bài' 
    });
  }
  
  const { reviewNote } = req.body || {};
  const rejected = await rejectEditRequest(requestId, reviewNote);
  res.json({ data: rejected, message: 'Đã từ chối yêu cầu sửa bài' });
});

// Delete own pending edit request
adminBlogRouter.delete('/edit-requests/:requestId', async (req: AuthenticatedRequest, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  
  try {
    await deleteEditRequest(requestId, req.user!.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xóa yêu cầu';
    res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
});

adminBlogRouter.delete('/:id', async (req, res) => {
  await deleteBlogPost(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
