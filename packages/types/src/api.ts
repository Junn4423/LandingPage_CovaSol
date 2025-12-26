export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export interface AdminOverviewStats {
  blogs: number;
  products: number;
  users: number;
  reviews: number;
  uniqueVisitors: number;
  totalVisits: number;
  lastVisitAt: string | null;
  consentsTotal: number;
  consentsOptIn: number;
  consentsOptOut: number;
  consentRate: number;
  lastConsentAt: string | null;
  lastUpdated: string;
}

export type TrafficLevel = 'normal' | 'high' | 'critical';

export interface TrafficTopIp {
  ipAddress: string;
  count: number;
  percent: number;
}

export interface TrafficAlert {
  id: string;
  level: TrafficLevel;
  label: string;
  message: string;
  triggeredAt: string;
  requestsPerMinute: number;
  requestsLast5s: number;
  uniqueIps: number;
  baselineRpm: number;
  rpmChange: number;
  topIps: TrafficTopIp[];
}

export interface TrafficStatus {
  level: TrafficLevel;
  label: string;
  requestsPerMinute: number;
  requestsLast5s: number;
  uniqueIps: number;
  baselineRpm: number;
  rpmChange: number;
  topIps: TrafficTopIp[];
  recentAlerts: TrafficAlert[];
  lastUpdated: string;
}

export interface VisitLogEntry {
  id: number;
  ipAddress: string;
  userAgent?: string | null;
  visitCount: number;
  lastVisitedAt: string;
  createdAt: string;
}

export interface VisitLogResponse {
  items: VisitLogEntry[];
  total: number;
  uniqueVisitors: number;
  totalVisits: number;
  lastVisitedAt: string | null;
}

export interface CookieConsentEntry {
  id: number;
  ipAddress: string;
  userAgent?: string | null;
  consented: boolean;
  preferences?: unknown;
  consentedAt: string;
  createdAt: string;
}

export interface CookieConsentStats {
  total: number;
  optIn: number;
  optOut: number;
  optInRate: number;
  last24h: number;
  uniqueIp: number;
  lastConsentAt: string | null;
}

export interface AdminConsentResponse {
  items: CookieConsentEntry[];
  total: number;
  page: number;
  pageSize: number;
  stats: CookieConsentStats;
}

// =====================================================
// Seasonal Theme Types
// =====================================================
export type SeasonalEffectType = 
  | 'snow'           // Tuyết rơi (Christmas)
  | 'firework'       // Pháo hoa (New Year)
  | 'petals'         // Cánh hoa đào/mai (Tết)
  | 'hearts'         // Trái tim (Valentine)
  | 'confetti'       // Hoa giấy (Celebration)
  | 'leaves'         // Lá rơi (Autumn)
  | 'lanterns'       // Đèn lồng (Mid-Autumn)
  | 'bats'           // Dơi bay (Halloween)
  | 'bubbles'        // Bong bóng (Summer)
  | 'stars'          // Ngôi sao (General)
  | 'lixi'           // Bao lì xì (Tết)
  | 'none';          // Không hiệu ứng

export interface SeasonalDecoration {
  id: string;
  type: 'corner' | 'banner' | 'icon' | 'floating' | 'couplet';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'header' | 'footer' | 'side-left' | 'side-right';
  imageUrl: string;
  altText?: string;
  link?: string;
  size?: 'small' | 'medium' | 'large';
  width?: number;  // Custom width in pixels for couplets
  animation?: 'none' | 'swing' | 'bounce' | 'pulse' | 'shake';
}

export interface SeasonalTheme {
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
  backgroundImageUrl?: string;  // Background image for the website
  bannerImageUrl?: string;
  bannerText?: string;
  bannerLink?: string;
  isActive: boolean;
  priority: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SeasonalThemeInput {
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
  backgroundImageUrl?: string;  // Background image for the website
  bannerImageUrl?: string;
  bannerText?: string;
  bannerLink?: string;
  isActive?: boolean;
  priority?: number;
  status?: 'active' | 'inactive';
}

export interface SeasonalThemeSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSeasonalThemeResponse {
  theme: SeasonalTheme | null;
  settings: Record<string, string>;
}
