import { prisma } from '../db/prisma';
import type { Prisma } from '@prisma/client';

// =====================================================
// TYPES
// =====================================================

export interface LogEntryInput {
  action: string;
  resource: string;
  resourceId?: string | null;
  description?: string;
  ipAddress: string;
  userAgent?: string;
  userId?: number | null;
  username?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  requestBody?: unknown;
  responseSize?: number;
}

export interface SystemLogFilters {
  action?: string;
  resource?: string;
  ipAddress?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface IPThreatAnalysis {
  ipAddress: string;
  threatScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: ThreatIndicator[];
  stats: {
    totalRequests: number;
    requestsLastHour: number;
    requestsLast24h: number;
    uniquePaths: number;
    errorRate: number;
    avgRequestsPerMinute: number;
    userAgentCount: number;
    suspiciousPatterns: string[];
  };
  recommendation: string;
}

export interface ThreatIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
  description: string;
}

export interface BlockIPInput {
  ipAddress: string;
  reason: string;
  blockedBy?: number;
  blockedByName?: string;
  expiresAt?: Date | null;
  notes?: string;
}

// =====================================================
// CONSTANTS - Threat Detection Thresholds
// =====================================================

const THRESHOLDS = {
  // Requests per time window
  REQUESTS_PER_MINUTE_NORMAL: 30,
  REQUESTS_PER_MINUTE_HIGH: 60,
  REQUESTS_PER_MINUTE_CRITICAL: 120,
  REQUESTS_PER_HOUR_NORMAL: 500,
  REQUESTS_PER_HOUR_HIGH: 1000,
  REQUESTS_PER_HOUR_CRITICAL: 3000,
  
  // Error rates
  ERROR_RATE_NORMAL: 0.1,    // 10%
  ERROR_RATE_HIGH: 0.25,     // 25%
  ERROR_RATE_CRITICAL: 0.5,  // 50%
  
  // Path diversity (scraping indicator)
  UNIQUE_PATHS_PER_HOUR_HIGH: 100,
  UNIQUE_PATHS_PER_HOUR_CRITICAL: 300,
  
  // User agent diversity (bot indicator)
  USER_AGENTS_HIGH: 5,
  USER_AGENTS_CRITICAL: 10
};

// Suspicious patterns in paths/user agents
const SUSPICIOUS_PATTERNS = {
  paths: [
    /\/wp-admin/i,
    /\/\.env/i,
    /\/\.git/i,
    /\/phpmyadmin/i,
    /\/admin\.php/i,
    /\/shell/i,
    /\/eval/i,
    /\/cmd/i,
    /\.sql$/i,
    /\.bak$/i,
    /\/config/i
  ],
  userAgents: [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /scanner/i,
    /crawler/i,
    /scraper/i,
    /python-requests/i,
    /curl\//i,
    /wget/i,
    /bot(?!.*google|.*bing|.*yahoo)/i
  ]
};

// =====================================================
// LOGGING FUNCTIONS
// =====================================================

/**
 * Ghi log một hoạt động vào hệ thống
 */
export async function createSystemLog(input: LogEntryInput) {
  try {
    // Sanitize request body (remove sensitive data)
    let sanitizedBody = input.requestBody;
    if (sanitizedBody && typeof sanitizedBody === 'object') {
      const bodyObj = sanitizedBody as Record<string, unknown>;
      sanitizedBody = { ...bodyObj };
      // Remove sensitive fields
      delete (sanitizedBody as Record<string, unknown>).password;
      delete (sanitizedBody as Record<string, unknown>).passwordHash;
      delete (sanitizedBody as Record<string, unknown>).token;
      delete (sanitizedBody as Record<string, unknown>).secret;
    }

    const log = await prisma.systemLog.create({
      data: {
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        description: input.description,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent?.slice(0, 500),
        userId: input.userId,
        username: input.username,
        method: input.method,
        path: input.path?.slice(0, 500),
        statusCode: input.statusCode,
        duration: input.duration,
        requestBody: sanitizedBody as Prisma.InputJsonValue,
        responseSize: input.responseSize
      }
    });

    // Update IP analytics asynchronously
    updateIPAnalytics(input).catch(() => {});

    return log;
  } catch (error) {
    console.error('[SystemLog] Failed to create log:', error);
    return null;
  }
}

/**
 * Cập nhật thống kê IP theo giờ
 */
async function updateIPAnalytics(input: LogEntryInput) {
  const hourWindow = new Date();
  hourWindow.setMinutes(0, 0, 0);

  const isError = input.statusCode && input.statusCode >= 400;

  try {
    await prisma.iPAnalytics.upsert({
      where: {
        ipAddress_hourWindow: {
          ipAddress: input.ipAddress,
          hourWindow
        }
      },
      create: {
        ipAddress: input.ipAddress,
        hourWindow,
        requestCount: 1,
        uniquePaths: 1,
        errorCount: isError ? 1 : 0,
        avgDuration: input.duration || 0,
        userAgents: 1
      },
      update: {
        requestCount: { increment: 1 },
        errorCount: isError ? { increment: 1 } : undefined,
        avgDuration: input.duration
          ? { set: input.duration }
          : undefined
      }
    });
  } catch (error) {
    // Silently fail - analytics is not critical
  }
}

// =====================================================
// QUERY FUNCTIONS
// =====================================================

/**
 * Lấy danh sách logs với filters và pagination
 */
export async function listSystemLogs(
  filters: SystemLogFilters = {},
  page = 1,
  pageSize = 50
) {
  const where: Prisma.SystemLogWhereInput = {};

  if (filters.action) where.action = filters.action;
  if (filters.resource) where.resource = filters.resource;
  if (filters.ipAddress) where.ipAddress = { contains: filters.ipAddress };
  if (filters.userId) where.userId = filters.userId;
  
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search } },
      { path: { contains: filters.search } },
      { username: { contains: filters.search } },
      { ipAddress: { contains: filters.search } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.systemLog.count({ where })
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Lấy thống kê tổng quan logs
 */
export async function getLogStats() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    totalLogs,
    logsLast24h,
    logsLastHour,
    uniqueIPs24h,
    actionBreakdown,
    resourceBreakdown,
    recentErrors
  ] = await Promise.all([
    prisma.systemLog.count(),
    prisma.systemLog.count({ where: { createdAt: { gte: last24h } } }),
    prisma.systemLog.count({ where: { createdAt: { gte: lastHour } } }),
    prisma.systemLog.groupBy({
      by: ['ipAddress'],
      where: { createdAt: { gte: last24h } },
      _count: true
    }),
    prisma.systemLog.groupBy({
      by: ['action'],
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10
    }),
    prisma.systemLog.groupBy({
      by: ['resource'],
      _count: { resource: true },
      orderBy: { _count: { resource: 'desc' } },
      take: 10
    }),
    prisma.systemLog.findMany({
      where: {
        statusCode: { gte: 400 },
        createdAt: { gte: last24h }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ]);

  return {
    totalLogs,
    logsLast24h,
    logsLastHour,
    uniqueIPs24h: uniqueIPs24h.length,
    actionBreakdown: actionBreakdown.map((a: { action: string; _count: { action: number } }) => ({
      action: a.action,
      count: a._count.action
    })),
    resourceBreakdown: resourceBreakdown.map((r: { resource: string; _count: { resource: number } }) => ({
      resource: r.resource,
      count: r._count.resource
    })),
    recentErrors,
    avgRequestsPerHour: logsLast24h / 24
  };
}

/**
 * Lấy danh sách actions/resources unique để filter
 */
export async function getLogFilterOptions() {
  const [actions, resources] = await Promise.all([
    prisma.systemLog.groupBy({
      by: ['action'],
      _count: true
    }),
    prisma.systemLog.groupBy({
      by: ['resource'],
      _count: true
    })
  ]);

  return {
    actions: actions.map((a: { action: string }) => a.action).filter(Boolean),
    resources: resources.map((r: { resource: string }) => r.resource).filter(Boolean)
  };
}

// =====================================================
// IP THREAT DETECTION
// =====================================================

/**
 * Phân tích mức độ đe dọa của một IP
 */
export async function analyzeIPThreat(ipAddress: string): Promise<IPThreatAnalysis> {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Lấy thống kê từ logs
  const [
    totalRequests,
    requestsLastHour,
    requestsLast24h,
    uniquePathsResult,
    errorCountResult,
    userAgentCountResult,
    recentLogs
  ] = await Promise.all([
    prisma.systemLog.count({ where: { ipAddress } }),
    prisma.systemLog.count({ where: { ipAddress, createdAt: { gte: lastHour } } }),
    prisma.systemLog.count({ where: { ipAddress, createdAt: { gte: last24h } } }),
    prisma.systemLog.groupBy({
      by: ['path'],
      where: { ipAddress, createdAt: { gte: last24h } }
    }),
    prisma.systemLog.count({
      where: { ipAddress, statusCode: { gte: 400 }, createdAt: { gte: last24h } }
    }),
    prisma.systemLog.groupBy({
      by: ['userAgent'],
      where: { ipAddress, createdAt: { gte: last24h } }
    }),
    prisma.systemLog.findMany({
      where: { ipAddress, createdAt: { gte: last24h } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { path: true, userAgent: true, statusCode: true, action: true }
    })
  ]);

  const uniquePaths = uniquePathsResult.length;
  const errorRate = requestsLast24h > 0 ? errorCountResult / requestsLast24h : 0;
  const userAgentCount = userAgentCountResult.length;
  const avgRequestsPerMinute = requestsLastHour / 60;

  // Phát hiện patterns đáng ngờ
  const suspiciousPatterns: string[] = [];
  const indicators: ThreatIndicator[] = [];

  // Check request rate
  if (avgRequestsPerMinute >= THRESHOLDS.REQUESTS_PER_MINUTE_CRITICAL) {
    indicators.push({
      type: 'high_request_rate',
      severity: 'high',
      score: 30,
      description: `${avgRequestsPerMinute.toFixed(1)} requests/phút (critical threshold: ${THRESHOLDS.REQUESTS_PER_MINUTE_CRITICAL})`
    });
    suspiciousPatterns.push('DDoS - Request rate cực cao');
  } else if (avgRequestsPerMinute >= THRESHOLDS.REQUESTS_PER_MINUTE_HIGH) {
    indicators.push({
      type: 'elevated_request_rate',
      severity: 'medium',
      score: 15,
      description: `${avgRequestsPerMinute.toFixed(1)} requests/phút (high threshold: ${THRESHOLDS.REQUESTS_PER_MINUTE_HIGH})`
    });
    suspiciousPatterns.push('Request rate cao bất thường');
  }

  // Check error rate
  if (errorRate >= THRESHOLDS.ERROR_RATE_CRITICAL) {
    indicators.push({
      type: 'high_error_rate',
      severity: 'high',
      score: 25,
      description: `${(errorRate * 100).toFixed(1)}% requests lỗi (critical: ${THRESHOLDS.ERROR_RATE_CRITICAL * 100}%)`
    });
    suspiciousPatterns.push('Scanning/Probing - Error rate cao');
  } else if (errorRate >= THRESHOLDS.ERROR_RATE_HIGH) {
    indicators.push({
      type: 'elevated_error_rate',
      severity: 'medium',
      score: 12,
      description: `${(errorRate * 100).toFixed(1)}% requests lỗi`
    });
  }

  // Check path diversity (scraping indicator)
  if (uniquePaths >= THRESHOLDS.UNIQUE_PATHS_PER_HOUR_CRITICAL) {
    indicators.push({
      type: 'high_path_diversity',
      severity: 'high',
      score: 20,
      description: `${uniquePaths} unique paths trong 24h (critical: ${THRESHOLDS.UNIQUE_PATHS_PER_HOUR_CRITICAL})`
    });
    suspiciousPatterns.push('Scraping - Truy cập nhiều paths');
  } else if (uniquePaths >= THRESHOLDS.UNIQUE_PATHS_PER_HOUR_HIGH) {
    indicators.push({
      type: 'elevated_path_diversity',
      severity: 'medium',
      score: 10,
      description: `${uniquePaths} unique paths trong 24h`
    });
  }

  // Check user agent diversity (bot indicator)
  if (userAgentCount >= THRESHOLDS.USER_AGENTS_CRITICAL) {
    indicators.push({
      type: 'user_agent_rotation',
      severity: 'high',
      score: 20,
      description: `${userAgentCount} user agents khác nhau (bot rotation)`
    });
    suspiciousPatterns.push('Bot - User-Agent rotation');
  } else if (userAgentCount >= THRESHOLDS.USER_AGENTS_HIGH) {
    indicators.push({
      type: 'multiple_user_agents',
      severity: 'medium',
      score: 8,
      description: `${userAgentCount} user agents khác nhau`
    });
  }

  // Check suspicious path patterns
  for (const log of recentLogs) {
    if (log.path) {
      for (const pattern of SUSPICIOUS_PATTERNS.paths) {
        if (pattern.test(log.path)) {
          const patternStr = pattern.toString();
          if (!suspiciousPatterns.includes(`Suspicious path: ${patternStr}`)) {
            indicators.push({
              type: 'suspicious_path',
              severity: 'medium',
              score: 15,
              description: `Truy cập path đáng ngờ: ${log.path}`
            });
            suspiciousPatterns.push(`Suspicious path: ${patternStr}`);
          }
          break;
        }
      }
    }

    if (log.userAgent) {
      for (const pattern of SUSPICIOUS_PATTERNS.userAgents) {
        if (pattern.test(log.userAgent)) {
          const patternStr = pattern.toString();
          if (!suspiciousPatterns.includes(`Suspicious UA: ${patternStr}`)) {
            indicators.push({
              type: 'suspicious_user_agent',
              severity: 'medium',
              score: 10,
              description: `User-Agent đáng ngờ: ${log.userAgent.slice(0, 100)}`
            });
            suspiciousPatterns.push(`Suspicious UA: ${patternStr}`);
          }
          break;
        }
      }
    }
  }

  // Calculate total threat score (max 100)
  const rawScore = indicators.reduce((sum, ind) => sum + ind.score, 0);
  const threatScore = Math.min(100, rawScore);

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (threatScore >= 80) riskLevel = 'critical';
  else if (threatScore >= 50) riskLevel = 'high';
  else if (threatScore >= 25) riskLevel = 'medium';
  else riskLevel = 'low';

  // Generate recommendation
  let recommendation: string;
  if (threatScore >= 80) {
    recommendation = 'Khuyến nghị BLOCK NGAY - IP này có dấu hiệu tấn công rõ ràng';
  } else if (threatScore >= 50) {
    recommendation = 'Cân nhắc block tạm thời và theo dõi thêm';
  } else if (threatScore >= 25) {
    recommendation = 'Theo dõi chặt chẽ, chưa cần block';
  } else {
    recommendation = 'IP bình thường, không cần hành động';
  }

  return {
    ipAddress,
    threatScore,
    riskLevel,
    indicators,
    stats: {
      totalRequests,
      requestsLastHour,
      requestsLast24h,
      uniquePaths,
      errorRate,
      avgRequestsPerMinute,
      userAgentCount,
      suspiciousPatterns
    },
    recommendation
  };
}

/**
 * Lấy danh sách IP đáng ngờ nhất
 */
export async function getTopSuspiciousIPs(limit = 20) {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Lấy top IPs theo request count
  const topIPs = await prisma.systemLog.groupBy({
    by: ['ipAddress'],
    where: { createdAt: { gte: last24h } },
    _count: { ipAddress: true },
    orderBy: { _count: { ipAddress: 'desc' } },
    take: limit * 2 // Lấy nhiều hơn để filter sau
  });

  // Phân tích từng IP
  const analyses = await Promise.all(
    topIPs.slice(0, limit).map(async (ip: { ipAddress: string }) => {
      const analysis = await analyzeIPThreat(ip.ipAddress);
      return analysis;
    })
  );

  // Sort by threat score
  return analyses.sort((a: IPThreatAnalysis, b: IPThreatAnalysis) => b.threatScore - a.threatScore);
}

// =====================================================
// IP BLOCKING FUNCTIONS
// =====================================================

/**
 * Block một IP
 */
export async function blockIP(input: BlockIPInput) {
  // Lấy threat analysis trước
  const analysis = await analyzeIPThreat(input.ipAddress);

  const blocked = await prisma.blockedIP.upsert({
    where: { ipAddress: input.ipAddress },
    create: {
      ipAddress: input.ipAddress,
      reason: input.reason,
      threatScore: analysis.threatScore,
      requestCount: analysis.stats.totalRequests,
      blockedBy: input.blockedBy,
      blockedByName: input.blockedByName,
      expiresAt: input.expiresAt,
      notes: input.notes,
      isActive: true
    },
    update: {
      reason: input.reason,
      threatScore: analysis.threatScore,
      requestCount: analysis.stats.totalRequests,
      blockedBy: input.blockedBy,
      blockedByName: input.blockedByName,
      expiresAt: input.expiresAt,
      notes: input.notes,
      isActive: true,
      blockedAt: new Date()
    }
  });

  // Log action
  await createSystemLog({
    action: 'BLOCK_IP',
    resource: 'security',
    resourceId: input.ipAddress,
    description: `Blocked IP: ${input.ipAddress} - Reason: ${input.reason}`,
    ipAddress: 'system',
    userId: input.blockedBy,
    username: input.blockedByName
  });

  return blocked;
}

/**
 * Unblock một IP
 */
export async function unblockIP(ipAddress: string, unblockBy?: number, unblockByName?: string) {
  const result = await prisma.blockedIP.update({
    where: { ipAddress },
    data: { isActive: false }
  });

  // Log action
  await createSystemLog({
    action: 'UNBLOCK_IP',
    resource: 'security',
    resourceId: ipAddress,
    description: `Unblocked IP: ${ipAddress}`,
    ipAddress: 'system',
    userId: unblockBy,
    username: unblockByName
  });

  return result;
}

/**
 * Kiểm tra IP có bị block không
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const blocked = await prisma.blockedIP.findFirst({
    where: {
      ipAddress,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  });

  return !!blocked;
}

/**
 * Lấy danh sách IP đang bị block
 */
export async function listBlockedIPs(includeInactive = false) {
  const where: Prisma.BlockedIPWhereInput = includeInactive ? {} : { isActive: true };

  const items = await prisma.blockedIP.findMany({
    where,
    orderBy: { blockedAt: 'desc' }
  });

  return items;
}

/**
 * Lấy thông tin chi tiết về một blocked IP
 */
export async function getBlockedIPDetail(ipAddress: string) {
  const [blockedInfo, currentAnalysis] = await Promise.all([
    prisma.blockedIP.findUnique({ where: { ipAddress } }),
    analyzeIPThreat(ipAddress)
  ]);

  return {
    blockedInfo,
    currentAnalysis
  };
}

// =====================================================
// DASHBOARD STATS
// =====================================================

/**
 * Lấy thống kê tổng quan cho dashboard System Logs
 */
export async function getSystemLogsDashboard() {
  const [
    logStats,
    blockedIPs,
    topSuspicious,
    filterOptions
  ] = await Promise.all([
    getLogStats(),
    listBlockedIPs(),
    getTopSuspiciousIPs(10),
    getLogFilterOptions()
  ]);

  return {
    logStats,
    blockedIPsCount: blockedIPs.length,
    blockedIPs,
    topSuspiciousIPs: topSuspicious,
    filterOptions,
    highThreatCount: topSuspicious.filter((ip: IPThreatAnalysis) => ip.threatScore >= 50).length,
    criticalThreatCount: topSuspicious.filter((ip: IPThreatAnalysis) => ip.threatScore >= 80).length
  };
}
