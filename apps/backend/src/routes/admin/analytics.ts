import { Router } from 'express';
import { getAdminOverview } from '../../services/analytics.service';
import { listCookieConsents } from '../../services/cookie-consent.service';
import { getVisitOverview, listRecentVisits } from '../../services/visit.service';
import { getTrafficStatus } from '../../services/traffic-monitor.service';

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.get('/overview', async (_req, res) => {
  const data = await getAdminOverview();
  res.json({ data });
});

adminAnalyticsRouter.get('/traffic', async (_req, res) => {
  const data = getTrafficStatus();
  res.json({ data });
});

adminAnalyticsRouter.get('/visits', async (req, res) => {
  const limit = Number.parseInt(req.query.limit as string) || 50;
  const [overview, visitList] = await Promise.all([getVisitOverview(), listRecentVisits(limit)]);

  res.json({
    data: {
      items: visitList.items,
      total: visitList.total,
      uniqueVisitors: overview.uniqueVisitors,
      totalVisits: overview.totalVisits,
      lastVisitedAt: overview.lastVisitedAt
    }
  });
});

adminAnalyticsRouter.get('/consents', async (req, res) => {
  const page = Number.parseInt(req.query.page as string) || 1;
  const pageSize = Number.parseInt(req.query.pageSize as string) || 20;
  const data = await listCookieConsents(page, pageSize);
  res.json({ data });
});
