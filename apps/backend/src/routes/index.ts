import { Router } from 'express';
import { authRouter } from './auth';
import { blogRouter } from './blog';
import { productRouter } from './products';
import { usersRouter } from './users';
import { adminBlogRouter } from './admin/blog';
import { adminProductRouter } from './admin/products';
import { adminAnalyticsRouter } from './admin/analytics';
import { requireAuth } from '../middleware/require-auth';

export const router = Router();

router.use('/auth', authRouter);
router.use('/blog', blogRouter);
router.use('/products', productRouter);
router.use('/users', usersRouter);
router.use('/admin/blog', requireAuth, adminBlogRouter);
router.use('/admin/products', requireAuth, adminProductRouter);
router.use('/admin/analytics', requireAuth, adminAnalyticsRouter);
