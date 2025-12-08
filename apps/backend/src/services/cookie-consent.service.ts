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
