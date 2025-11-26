import { prisma } from '../db/prisma';
import type { AdminOverviewStats } from '@/types/api';

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const [blogs, products, users] = await Promise.all([
    prisma.blogPost.count(),
    prisma.product.count(),
    prisma.user.count()
  ]);

  return {
    blogs,
    products,
    users,
    lastUpdated: new Date().toISOString()
  };
}
