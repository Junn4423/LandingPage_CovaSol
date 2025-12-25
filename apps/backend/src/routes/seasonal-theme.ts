import { Router, Request, Response } from 'express';
import * as seasonalThemeService from '../services/seasonal-theme.service';

export const seasonalThemeRouter = Router();

/**
 * GET /api/seasonal-theme/active
 * Get the currently active seasonal theme (public API)
 */
seasonalThemeRouter.get('/active', async (_req: Request, res: Response) => {
  try {
    const result = await seasonalThemeService.getActiveTheme();
    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching active seasonal theme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/seasonal-theme/list
 * Get all active themes (public API)
 */
seasonalThemeRouter.get('/list', async (_req: Request, res: Response) => {
  try {
    const themes = await seasonalThemeService.getAllThemes();
    res.json({ data: themes });
  } catch (error) {
    console.error('Error fetching seasonal themes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
