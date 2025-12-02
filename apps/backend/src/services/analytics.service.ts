import { prisma } from '../db/prisma';
import type { AdminOverviewStats } from '@covasol/types';

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const [blogs, products, users, reviews] = await Promise.all([
    prisma.blogPost.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.customerReview.count()
  ]);

  return {
    blogs,
    products,
    users,
    reviews,
    lastUpdated: new Date().toISOString()
  };
}
