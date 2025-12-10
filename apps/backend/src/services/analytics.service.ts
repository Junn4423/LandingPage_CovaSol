import { prisma } from '../db/prisma';
import type { AdminOverviewStats } from '../types/covasol';
import { getCookieConsentStats } from './cookie-consent.service';
import { getVisitOverview } from './visit.service';

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const [blogs, products, users, reviews, visits, consentStats] = await Promise.all([
    prisma.blogPost.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.customerReview.count(),
    getVisitOverview(),
    getCookieConsentStats()
  ]);

  return {
    blogs,
    products,
    users,
    reviews,
    uniqueVisitors: visits.uniqueVisitors,
    totalVisits: visits.totalVisits,
    lastVisitAt: visits.lastVisitedAt,
    consentsTotal: consentStats.total,
    consentsOptIn: consentStats.optIn,
    consentsOptOut: consentStats.optOut,
    consentRate: consentStats.optInRate,
    lastConsentAt: consentStats.lastConsentAt,
    lastUpdated: new Date().toISOString()
  };
}
