import { prisma } from '../db/prisma';

// Types defined locally to avoid cross-package import issues
interface SeasonalDecoration {
  id: string;
  type: 'corner' | 'banner' | 'icon' | 'floating';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'header' | 'footer';
  imageUrl: string;
  altText?: string;
  link?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: 'none' | 'swing' | 'bounce' | 'pulse' | 'shake';
}

type SeasonalEffectType = 
  | 'snow' | 'firework' | 'petals' | 'hearts' | 'confetti' 
  | 'leaves' | 'lanterns' | 'bats' | 'bubbles' | 'stars' | 'lixi' | 'none';

interface SeasonalTheme {
  id: number;
  code: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  effectType?: SeasonalEffectType;
  effectConfig?: Record<string, unknown>;
  effectEnabled: boolean;
  disableOnMobile: boolean;
  decorations?: SeasonalDecoration[];
  bannerImageUrl?: string;
  bannerText?: string;
  bannerLink?: string;
  isActive: boolean;
  priority: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface SeasonalThemeInput {
  code: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  effectType?: SeasonalEffectType;
  effectConfig?: Record<string, unknown>;
  effectEnabled?: boolean;
  disableOnMobile?: boolean;
  decorations?: SeasonalDecoration[];
  bannerImageUrl?: string;
  bannerText?: string;
  bannerLink?: string;
  isActive?: boolean;
  priority?: number;
  status?: 'active' | 'inactive';
}

interface SeasonalThemeSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActiveSeasonalThemeResponse {
  theme: SeasonalTheme | null;
  settings: Record<string, string>;
}

// =====================================================
// Helper: Serialize Prisma object to API response
// =====================================================
function serializeTheme(theme: any): SeasonalTheme {
  return {
    id: theme.id,
    code: theme.code,
    name: theme.name,
    description: theme.description ?? undefined,
    startDate: theme.startDate.toISOString(),
    endDate: theme.endDate.toISOString(),
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor ?? undefined,
    effectType: theme.effectType ?? undefined,
    effectConfig: theme.effectConfig ?? undefined,
    effectEnabled: theme.effectEnabled,
    disableOnMobile: theme.disableOnMobile,
    decorations: theme.decorations ?? undefined,
    bannerImageUrl: theme.bannerImageUrl ?? undefined,
    bannerText: theme.bannerText ?? undefined,
    bannerLink: theme.bannerLink ?? undefined,
    isActive: theme.isActive,
    priority: theme.priority,
    status: theme.status as 'active' | 'inactive',
    createdAt: theme.createdAt.toISOString(),
    updatedAt: theme.updatedAt.toISOString(),
  };
}

function serializeSetting(setting: any): SeasonalThemeSetting {
  return {
    id: setting.id,
    key: setting.key,
    value: setting.value,
    description: setting.description ?? undefined,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}

// =====================================================
// Public API: Get all themes
// =====================================================
export async function getAllThemes(): Promise<SeasonalTheme[]> {
  const themes = await prisma.seasonalTheme.findMany({
    where: { status: 'active' },
    orderBy: [{ priority: 'desc' }, { startDate: 'asc' }],
  });
  return themes.map(serializeTheme);
}

// =====================================================
// Public API: Get active theme (based on current date or manual override)
// =====================================================
export async function getActiveTheme(): Promise<ActiveSeasonalThemeResponse> {
  // First check if there's a manually activated theme
  let theme = await prisma.seasonalTheme.findFirst({
    where: { isActive: true, status: 'active' },
  });

  // If no manual override, check date-based activation
  if (!theme) {
    const now = new Date();
    theme = await prisma.seasonalTheme.findFirst({
      where: {
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { priority: 'desc' },
    });
  }

  // Get global settings
  const settingsRows = await prisma.seasonalThemeSetting.findMany();
  const settings: Record<string, string> = {};
  for (const row of settingsRows) {
    settings[row.key] = row.value;
  }

  return {
    theme: theme ? serializeTheme(theme) : null,
    settings,
  };
}

// =====================================================
// Admin API: Get theme by ID
// =====================================================
export async function getThemeById(id: number): Promise<SeasonalTheme | null> {
  const theme = await prisma.seasonalTheme.findUnique({ where: { id } });
  return theme ? serializeTheme(theme) : null;
}

// =====================================================
// Admin API: Create new theme
// =====================================================
export async function createTheme(input: SeasonalThemeInput): Promise<SeasonalTheme> {
  const theme = await prisma.seasonalTheme.create({
    data: {
      code: input.code,
      name: input.name,
      description: input.description,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      effectType: input.effectType,
      effectConfig: input.effectConfig ? JSON.parse(JSON.stringify(input.effectConfig)) : undefined,
      effectEnabled: input.effectEnabled ?? true,
      disableOnMobile: input.disableOnMobile ?? true,
      decorations: input.decorations ? JSON.parse(JSON.stringify(input.decorations)) : undefined,
      bannerImageUrl: input.bannerImageUrl,
      bannerText: input.bannerText,
      bannerLink: input.bannerLink,
      isActive: input.isActive ?? false,
      priority: input.priority ?? 0,
      status: input.status ?? 'active',
    },
  });
  return serializeTheme(theme);
}

// =====================================================
// Admin API: Update theme
// =====================================================
export async function updateTheme(id: number, input: Partial<SeasonalThemeInput>): Promise<SeasonalTheme | null> {
  const existing = await prisma.seasonalTheme.findUnique({ where: { id } });
  if (!existing) return null;

  const theme = await prisma.seasonalTheme.update({
    where: { id },
    data: {
      code: input.code ?? existing.code,
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      startDate: input.startDate ? new Date(input.startDate) : existing.startDate,
      endDate: input.endDate ? new Date(input.endDate) : existing.endDate,
      primaryColor: input.primaryColor ?? existing.primaryColor,
      secondaryColor: input.secondaryColor ?? existing.secondaryColor,
      accentColor: input.accentColor !== undefined ? input.accentColor : existing.accentColor,
      effectType: input.effectType !== undefined ? input.effectType : existing.effectType,
      effectConfig: input.effectConfig !== undefined ? JSON.parse(JSON.stringify(input.effectConfig)) : undefined,
      effectEnabled: input.effectEnabled ?? existing.effectEnabled,
      disableOnMobile: input.disableOnMobile ?? existing.disableOnMobile,
      decorations: input.decorations !== undefined ? JSON.parse(JSON.stringify(input.decorations)) : undefined,
      bannerImageUrl: input.bannerImageUrl !== undefined ? input.bannerImageUrl : existing.bannerImageUrl,
      bannerText: input.bannerText !== undefined ? input.bannerText : existing.bannerText,
      bannerLink: input.bannerLink !== undefined ? input.bannerLink : existing.bannerLink,
      isActive: input.isActive ?? existing.isActive,
      priority: input.priority ?? existing.priority,
      status: input.status ?? existing.status,
    },
  });
  return serializeTheme(theme);
}

// =====================================================
// Admin API: Delete theme
// =====================================================
export async function deleteTheme(id: number): Promise<boolean> {
  try {
    await prisma.seasonalTheme.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// Admin API: Set theme as active (deactivate others)
// =====================================================
export async function activateTheme(id: number): Promise<SeasonalTheme | null> {
  // Deactivate all themes first
  await prisma.seasonalTheme.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Activate the selected theme
  const theme = await prisma.seasonalTheme.update({
    where: { id },
    data: { isActive: true },
  });

  return serializeTheme(theme);
}

// =====================================================
// Admin API: Deactivate theme (back to auto mode)
// =====================================================
export async function deactivateAllThemes(): Promise<void> {
  await prisma.seasonalTheme.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });
}

// =====================================================
// Admin API: Get all settings
// =====================================================
export async function getAllSettings(): Promise<SeasonalThemeSetting[]> {
  const settings = await prisma.seasonalThemeSetting.findMany({
    orderBy: { key: 'asc' },
  });
  return settings.map(serializeSetting);
}

// =====================================================
// Admin API: Upsert setting
// =====================================================
export async function upsertSetting(key: string, value: string, description?: string): Promise<SeasonalThemeSetting> {
  const setting = await prisma.seasonalThemeSetting.upsert({
    where: { key },
    create: { key, value, description },
    update: { value, description },
  });
  return serializeSetting(setting);
}

// =====================================================
// Admin API: Delete setting
// =====================================================
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    await prisma.seasonalThemeSetting.delete({ where: { key } });
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// Admin API: Get all themes (including inactive) for admin
// =====================================================
export async function getAllThemesAdmin(): Promise<SeasonalTheme[]> {
  const themes = await prisma.seasonalTheme.findMany({
    orderBy: [{ priority: 'desc' }, { startDate: 'asc' }],
  });
  return themes.map(serializeTheme);
}
