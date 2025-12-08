import { prisma } from '../db/prisma';
import type { AdminOverviewStats } from '@covasol/types';
import { getVisitOverview } from './visit.service';

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const [blogs, products, users, reviews, visits] = await Promise.all([
    prisma.blogPost.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.customerReview.count(),
    getVisitOverview()
  ]);

  return {
    blogs,
    products,
    users,
    reviews,
    uniqueVisitors: visits.uniqueVisitors,
    totalVisits: visits.totalVisits,
    lastVisitAt: visits.lastVisitedAt,
    lastUpdated: new Date().toISOString()
  };
}
