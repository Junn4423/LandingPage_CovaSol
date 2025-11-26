import { Router } from 'express';
import { getAdminOverview } from '../../services/analytics.service';

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.get('/overview', async (_req, res) => {
  const data = await getAdminOverview();
  res.json({ data });
});
