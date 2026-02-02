import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  listAllReviews,
  getReviewById,
  upsertReview,
  deleteReview,
  getReviewsStats
} from '../../services/review.service';

const reviewPayloadSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  role: z.string().min(2, 'Vai trò phải có ít nhất 2 ký tự'),
  company: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional(),
  quote: z.string().min(10, 'Nội dung đánh giá phải có ít nhất 10 ký tự'),
  bgColor: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  isFeatured: z.boolean().optional(),
});

export const adminReviewRouter = Router();

// GET /admin/reviews - Lấy tất cả reviews
adminReviewRouter.get('/', async (_req, res) => {
  const reviews = await listAllReviews();
  res.json({ data: reviews });
});

// GET /admin/reviews/stats - Lấy thống kê
adminReviewRouter.get('/stats', async (_req, res) => {
  const stats = await getReviewsStats();
  res.json({ data: stats });
});

// GET /admin/reviews/:id - Lấy chi tiết review
adminReviewRouter.get('/:id', async (req, res) => {
  const review = await getReviewById(req.params.id);
  if (!review) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy đánh giá' });
  }
  return res.json({ data: review });
});

// POST /admin/reviews - Tạo mới review
adminReviewRouter.post('/', async (req, res) => {
  const parsed = reviewPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const review = await upsertReview(parsed.data);
  res.status(StatusCodes.CREATED).json({ data: review });
});

// PUT /admin/reviews/:id - Cập nhật review
adminReviewRouter.put('/:id', async (req, res) => {
  const parsed = reviewPayloadSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'ID không hợp lệ' });
  }

  const review = await upsertReview({ ...parsed.data, id } as any);
  res.json({ data: review });
});

// PUT /admin/reviews/:id/approve - Duyệt review
adminReviewRouter.put('/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'ID không hợp lệ' });
  }

  const review = await upsertReview({ id, status: 'published' } as any);
  res.json({ data: review });
});

// PUT /admin/reviews/:id/reject - Từ chối review
adminReviewRouter.put('/:id/reject', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'ID không hợp lệ' });
  }

  const review = await upsertReview({ id, status: 'draft' } as any);
  res.json({ data: review });
});

// DELETE /admin/reviews/:id - Xóa review
adminReviewRouter.delete('/:id', async (req, res) => {
  const deleted = await deleteReview(req.params.id);
  if (!deleted) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy đánh giá' });
  }
  res.status(StatusCodes.NO_CONTENT).send();
});
