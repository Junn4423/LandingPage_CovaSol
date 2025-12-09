import type { Request } from 'express';
import { prisma } from '../db/prisma';

export interface VisitLog {
  id: number;
  ipAddress: string;
  userAgent?: string | null;
  visitCount: number;
  lastVisitedAt: string;
  createdAt: string;
}

export interface VisitOverview {
  uniqueVisitors: number;
  totalVisits: number;
  lastVisitedAt: string | null;
}

export interface VisitLogList {
  items: VisitLog[];
  total: number;
}

function extractClientIp(req: Request): string {
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  return forwarded || req.ip || req.socket.remoteAddress || 'unknown';
}

export async function recordVisit(req: Request): Promise<VisitLog> {
  const ipAddress = extractClientIp(req);
  const userAgent = req.headers['user-agent'] ?? null;
  const now = new Date();

  const existing = await prisma.visitStat.findUnique({ where: { ipAddress } });

  if (existing) {
    const updated = await prisma.visitStat.update({
      where: { id: existing.id },
      data: {
        visitCount: { increment: 1 },
        lastVisitedAt: now,
        userAgent,
      },
    });
    return {
      id: updated.id,
      ipAddress: updated.ipAddress,
      userAgent: updated.userAgent,
      visitCount: updated.visitCount,
      lastVisitedAt: updated.lastVisitedAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  const created = await prisma.visitStat.create({
    data: {
      ipAddress,
      userAgent,
      lastVisitedAt: now,
    },
  });

  return {
    id: created.id,
    ipAddress: created.ipAddress,
    userAgent: created.userAgent,
    visitCount: created.visitCount,
    lastVisitedAt: created.lastVisitedAt.toISOString(),
    createdAt: created.createdAt.toISOString(),
  };
}

export async function getVisitOverview(): Promise<VisitOverview> {
  const aggregate = await prisma.visitStat.aggregate({
    _count: { _all: true },
    _sum: { visitCount: true },
    _max: { lastVisitedAt: true },
  });

  return {
    uniqueVisitors: aggregate._count._all,
    totalVisits: aggregate._sum.visitCount ?? 0,
    lastVisitedAt: aggregate._max.lastVisitedAt ? aggregate._max.lastVisitedAt.toISOString() : null,
  };
}

export async function listRecentVisits(limit = 50): Promise<VisitLogList> {
  const [rows, total] = await Promise.all([
    prisma.visitStat.findMany({
      orderBy: { lastVisitedAt: 'desc' },
      take: limit,
    }),
    prisma.visitStat.count(),
  ]);

  return {
    items: rows.map(row => ({
      id: row.id,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      visitCount: row.visitCount,
      lastVisitedAt: row.lastVisitedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    })),
    total,
  };
}
