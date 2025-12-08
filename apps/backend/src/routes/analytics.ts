import { Router } from 'express';
import { getVisitOverview, recordVisit } from '../services/visit.service';
import { saveCookieConsent } from '../services/cookie-consent.service';

export const analyticsRouter = Router();

// POST /analytics/visit - log a visit by IP
analyticsRouter.post('/visit', async (req, res) => {
  const data = await recordVisit(req);
  res.json({ data });
});

// GET /analytics/overview - aggregated visit stats
analyticsRouter.get('/overview', async (_req, res) => {
  const data = await getVisitOverview();
  res.json({ data });
});

// POST /analytics/cookie-consent - store user cookie consent preferences
analyticsRouter.post('/cookie-consent', async (req, res) => {
  const consented = typeof req.body?.consented === 'boolean' ? req.body.consented : true;
  const preferences = req.body?.preferences ?? undefined;
  const data = await saveCookieConsent(req, { consented, preferences });
  res.json({ data });
});
