import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { subscribeToNewsletter, unsubscribeFromNewsletter } from '../services/newsletter.service';

export const newsletterRouter = Router();

const subscribeSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  name: z.string().optional(),
  source: z.string().optional()
});

function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.ip || req.connection?.remoteAddress || '';
}

// Subscribe to newsletter
newsletterRouter.post('/subscribe', async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.flatten()
    });
  }

  try {
    const subscription = await subscribeToNewsletter({
      ...parsed.data,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    return res.status(StatusCodes.OK).json({
      message: 'Đăng ký nhận bản tin thành công!',
      data: subscription
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.'
    });
  }
});

// Unsubscribe from newsletter
newsletterRouter.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Email là bắt buộc'
    });
  }

  try {
    const success = await unsubscribeFromNewsletter(email);
    
    if (success) {
      return res.status(StatusCodes.OK).json({
        message: 'Đã hủy đăng ký nhận bản tin'
      });
    }
    
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Email chưa được đăng ký'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    });
  }
});
