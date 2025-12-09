import type { Request } from 'express';
import { prisma } from '../db/prisma';

export interface CookieConsentPayload {
  consented: boolean;
  preferences?: unknown;
}

export interface CookieConsentRecord {
  id: number;
  ipAddress: string;
  userAgent?: string | null;
  consented: boolean;
  preferences?: unknown;
  consentedAt: string;
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

export interface CookieConsentList {
  items: CookieConsentRecord[];
  total: number;
  page: number;
  pageSize: number;
  stats: CookieConsentStats;
}

function extractClientIp(req: Request): string {
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  return forwarded || req.ip || req.socket.remoteAddress || 'unknown';
}

export async function saveCookieConsent(req: Request, payload: CookieConsentPayload): Promise<CookieConsentRecord> {
  const ipAddress = extractClientIp(req);
  const userAgent = req.headers['user-agent'] ?? null;
  const consentedAt = new Date();

  const created = await prisma.cookieConsent.create({
    data: {
      ipAddress,
      userAgent,
      consented: payload.consented,
      preferences: payload.preferences ?? undefined,
      consentedAt,
    },
  });

  return {
    id: created.id,
    ipAddress: created.ipAddress,
    userAgent: created.userAgent,
    consented: created.consented,
    preferences: created.preferences ?? undefined,
    consentedAt: created.consentedAt.toISOString(),
  };
}

export async function getCookieConsentStats(): Promise<CookieConsentStats> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [total, optIn, optOut, lastConsent, last24h, uniqueIp] = await Promise.all([
    prisma.cookieConsent.count(),
    prisma.cookieConsent.count({ where: { consented: true } }),
    prisma.cookieConsent.count({ where: { consented: false } }),
    prisma.cookieConsent.findFirst({ orderBy: { consentedAt: 'desc' } }),
    prisma.cookieConsent.count({ where: { consentedAt: { gte: twentyFourHoursAgo } } }),
    prisma.cookieConsent.findMany({ select: { ipAddress: true }, distinct: ['ipAddress'] }).then(res => res.length),
  ]);

  const optInRate = total === 0 ? 0 : (optIn / total) * 100;

  return {
    total,
    optIn,
    optOut,
    optInRate,
    last24h,
    uniqueIp,
    lastConsentAt: lastConsent ? lastConsent.consentedAt.toISOString() : null,
  };
}

export async function listCookieConsents(page = 1, pageSize = 20): Promise<CookieConsentList> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);
  const skip = (safePage - 1) * safePageSize;

  const [rows, total, stats] = await Promise.all([
    prisma.cookieConsent.findMany({
      orderBy: { consentedAt: 'desc' },
      skip,
      take: safePageSize,
    }),
    prisma.cookieConsent.count(),
    getCookieConsentStats(),
  ]);

  return {
    items: rows.map(item => ({
      id: item.id,
      ipAddress: item.ipAddress,
      userAgent: item.userAgent,
      consented: item.consented,
      preferences: item.preferences ?? undefined,
      consentedAt: item.consentedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    pageSize: safePageSize,
    stats,
  };
}
