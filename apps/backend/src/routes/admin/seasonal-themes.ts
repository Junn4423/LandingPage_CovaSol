import { Router, Request, Response } from 'express';
import * as seasonalThemeService from '../../services/seasonal-theme.service';

export const adminSeasonalThemeRouter = Router();

/**
 * GET /api/admin/seasonal-themes
 * Get all themes for admin (including inactive)
 */
adminSeasonalThemeRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const themes = await seasonalThemeService.getAllThemesAdmin();
    res.json({ data: themes });
  } catch (error) {
    console.error('Error fetching seasonal themes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/seasonal-themes/:id
 * Get theme by ID
 */
adminSeasonalThemeRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const theme = await seasonalThemeService.getThemeById(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    res.json({ data: theme });
  } catch (error) {
    console.error('Error fetching seasonal theme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/admin/seasonal-themes
 * Create new theme
 */
adminSeasonalThemeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    
    // Validate required fields
    if (!input.code || !input.name || !input.startDate || !input.endDate || !input.primaryColor || !input.secondaryColor) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const theme = await seasonalThemeService.createTheme(input);
    res.status(201).json({ data: theme, message: 'Theme created successfully' });
  } catch (error: any) {
    console.error('Error creating seasonal theme:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Theme code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/seasonal-themes/:id
 * Update theme
 */
adminSeasonalThemeRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const input = req.body;
    const theme = await seasonalThemeService.updateTheme(id, input);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    res.json({ data: theme, message: 'Theme updated successfully' });
  } catch (error: any) {
    console.error('Error updating seasonal theme:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Theme code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/seasonal-themes/:id
 * Delete theme
 */
adminSeasonalThemeRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const success = await seasonalThemeService.deleteTheme(id);
    if (!success) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    res.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Error deleting seasonal theme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/admin/seasonal-themes/:id/activate
 * Activate a specific theme (manual override)
 */
adminSeasonalThemeRouter.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const theme = await seasonalThemeService.activateTheme(id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    res.json({ data: theme, message: 'Theme activated successfully' });
  } catch (error) {
    console.error('Error activating seasonal theme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/admin/seasonal-themes/deactivate-all
 * Deactivate all themes (return to auto mode)
 */
adminSeasonalThemeRouter.post('/deactivate-all', async (_req: Request, res: Response) => {
  try {
    await seasonalThemeService.deactivateAllThemes();
    res.json({ message: 'All themes deactivated. Auto mode enabled.' });
  } catch (error) {
    console.error('Error deactivating seasonal themes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/seasonal-themes/settings
 * Get all settings
 */
adminSeasonalThemeRouter.get('/settings/all', async (_req: Request, res: Response) => {
  try {
    const settings = await seasonalThemeService.getAllSettings();
    res.json({ data: settings });
  } catch (error) {
    console.error('Error fetching seasonal theme settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/seasonal-themes/settings/:key
 * Upsert setting
 */
adminSeasonalThemeRouter.put('/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const setting = await seasonalThemeService.upsertSetting(key, value, description);
    res.json({ data: setting, message: 'Setting saved successfully' });
  } catch (error) {
    console.error('Error saving seasonal theme setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/seasonal-themes/settings/:key
 * Delete setting
 */
adminSeasonalThemeRouter.delete('/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const success = await seasonalThemeService.deleteSetting(key);
    
    if (!success) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting seasonal theme setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
