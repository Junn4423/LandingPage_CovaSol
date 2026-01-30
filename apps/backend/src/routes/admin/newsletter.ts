import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  getAllSubscriptions,
  getSubscriptionStats,
  deleteSubscription
} from '../../services/newsletter.service';

export const adminNewsletterRouter = Router();

// Get all subscriptions
adminNewsletterRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
  const status = req.query.status as string | undefined;

  try {
    const result = await getAllSubscriptions({ page, pageSize, status });
    return res.json({
      data: result.subscriptions,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize)
      }
    });
  } catch (error) {
    console.error('Admin newsletter list error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Không thể tải danh sách đăng ký'
    });
  }
});

// Get subscription stats
adminNewsletterRouter.get('/stats', async (_req, res) => {
  try {
    const stats = await getSubscriptionStats();
    return res.json({ data: stats });
  } catch (error) {
    console.error('Admin newsletter stats error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Không thể tải thống kê'
    });
  }
});

// Delete subscription
adminNewsletterRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'ID không hợp lệ' });
  }

  try {
    await deleteSubscription(id);
    return res.json({ message: 'Đã xóa đăng ký' });
  } catch (error) {
    console.error('Admin newsletter delete error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Không thể xóa đăng ký'
    });
  }
});
