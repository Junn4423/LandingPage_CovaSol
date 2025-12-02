import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { listPublishedReviews, getReviewById, getReviewsStats } from '../services/review.service';

export const reviewRouter = Router();

// GET /reviews - Lấy danh sách reviews đã published
reviewRouter.get('/', async (_req, res) => {
  const reviews = await listPublishedReviews();
  res.json({ data: reviews });
});

// GET /reviews/stats - Lấy thống kê đánh giá
reviewRouter.get('/stats', async (_req, res) => {
  const stats = await getReviewsStats();
  res.json({ data: stats });
});

// GET /reviews/:id - Lấy chi tiết review
reviewRouter.get('/:id', async (req, res) => {
  const review = await getReviewById(req.params.id);
  if (!review) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy đánh giá' });
  }
  return res.json({ data: review });
});
