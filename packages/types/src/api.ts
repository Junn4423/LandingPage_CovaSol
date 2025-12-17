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
