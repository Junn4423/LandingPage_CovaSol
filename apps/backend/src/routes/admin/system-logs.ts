import { Router } from 'express';
import {
  listSystemLogs,
  getLogStats,
  getLogFilterOptions,
  analyzeIPThreat,
  getTopSuspiciousIPs,
  blockIP,
  unblockIP,
  listBlockedIPs,
  getBlockedIPDetail,
  getSystemLogsDashboard
} from '../../services/system-log.service';

export const adminSystemLogsRouter = Router();

// =====================================================
// DASHBOARD
// =====================================================

/**
 * GET /admin/system-logs/dashboard
 * Lấy thống kê tổng quan cho trang System Logs
 */
adminSystemLogsRouter.get('/dashboard', async (_req, res) => {
  try {
    const data = await getSystemLogsDashboard();
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// =====================================================
// LOGS
// =====================================================

/**
 * GET /admin/system-logs
 * Lấy danh sách logs với filters và pagination
 */
adminSystemLogsRouter.get('/', async (req, res) => {
  try {
    const {
      action,
      resource,
      ipAddress,
      userId,
      startDate,
      endDate,
      search,
      page = '1',
      pageSize = '50'
    } = req.query;

    const filters = {
      action: action as string | undefined,
      resource: resource as string | undefined,
      ipAddress: ipAddress as string | undefined,
      userId: userId ? parseInt(userId as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined
    };

    const data = await listSystemLogs(
      filters,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] List error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * GET /admin/system-logs/stats
 * Lấy thống kê logs
 */
adminSystemLogsRouter.get('/stats', async (_req, res) => {
  try {
    const data = await getLogStats();
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /admin/system-logs/filters
 * Lấy danh sách filter options (actions, resources)
 */
adminSystemLogsRouter.get('/filters', async (_req, res) => {
  try {
    const data = await getLogFilterOptions();
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] Filters error:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// =====================================================
// IP THREAT ANALYSIS
// =====================================================

/**
 * GET /admin/system-logs/ip-analysis/:ip
 * Phân tích threat của một IP cụ thể
 */
adminSystemLogsRouter.get('/ip-analysis/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const data = await analyzeIPThreat(ip);
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] IP analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze IP' });
  }
});

/**
 * GET /admin/system-logs/suspicious-ips
 * Lấy danh sách IP đáng ngờ nhất
 */
adminSystemLogsRouter.get('/suspicious-ips', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await getTopSuspiciousIPs(limit);
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] Suspicious IPs error:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious IPs' });
  }
});

// =====================================================
// IP BLOCKING
// =====================================================

/**
 * GET /admin/system-logs/blocked-ips
 * Lấy danh sách IP đang bị block
 */
adminSystemLogsRouter.get('/blocked-ips', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const data = await listBlockedIPs(includeInactive);
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] Blocked IPs error:', error);
    res.status(500).json({ error: 'Failed to fetch blocked IPs' });
  }
});

/**
 * GET /admin/system-logs/blocked-ips/:ip
 * Lấy thông tin chi tiết về blocked IP
 */
adminSystemLogsRouter.get('/blocked-ips/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const data = await getBlockedIPDetail(ip);
    res.json({ data });
  } catch (error) {
    console.error('[SystemLogs] Blocked IP detail error:', error);
    res.status(500).json({ error: 'Failed to fetch blocked IP detail' });
  }
});

/**
 * POST /admin/system-logs/block-ip
 * Block một IP
 */
adminSystemLogsRouter.post('/block-ip', async (req, res) => {
  try {
    const { ipAddress, reason, expiresAt, notes } = req.body;
    
    if (!ipAddress || !reason) {
      return res.status(400).json({ error: 'ipAddress and reason are required' });
    }

    // Get current user from session
    const user = (req as any).session?.user;
    
    const data = await blockIP({
      ipAddress,
      reason,
      blockedBy: user?.id,
      blockedByName: user?.displayName || user?.username,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes
    });

    res.json({ data, message: `IP ${ipAddress} đã bị block` });
  } catch (error) {
    console.error('[SystemLogs] Block IP error:', error);
    res.status(500).json({ error: 'Failed to block IP' });
  }
});

/**
 * POST /admin/system-logs/unblock-ip
 * Unblock một IP
 */
adminSystemLogsRouter.post('/unblock-ip', async (req, res) => {
  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ error: 'ipAddress is required' });
    }

    // Get current user from session
    const user = (req as any).session?.user;
    
    const data = await unblockIP(
      ipAddress,
      user?.id,
      user?.displayName || user?.username
    );

    res.json({ data, message: `IP ${ipAddress} đã được unblock` });
  } catch (error) {
    console.error('[SystemLogs] Unblock IP error:', error);
    res.status(500).json({ error: 'Failed to unblock IP' });
  }
});
