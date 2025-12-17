import { Request, Response, NextFunction } from 'express';
import { createSystemLog, isIPBlocked } from '../services/system-log.service';
import { recordTrafficEvent } from '../services/traffic-monitor.service';

// Paths to exclude from logging (reduce noise)
const EXCLUDED_PATHS = [
  '/health',
  '/favicon.ico',
  /^\/assets\//,
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i
];

// Paths that should be logged with higher priority
const IMPORTANT_PATHS = [
  /^\/v1\/admin/,
  /^\/v1\/auth/,
  /^\/v1\/users/,
  /^\/database/
];

// Map HTTP methods and paths to action names
function getActionName(method: string, path: string): string {
  const methodMap: Record<string, string> = {
    GET: 'VIEW',
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE'
  };

  // Special cases
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/auth/me')) return 'SESSION_CHECK';
  if (path.includes('/uploads')) return 'UPLOAD';
  if (path.includes('/block-ip')) return 'BLOCK_IP';
  if (path.includes('/unblock-ip')) return 'UNBLOCK_IP';

  return methodMap[method.toUpperCase()] || 'REQUEST';
}

// Extract resource name from path
function getResourceName(path: string): string {
  // Remove version prefix and query string
  const cleanPath = path.replace(/^\/v1\//, '').split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean);
  
  if (parts[0] === 'admin' && parts[1]) {
    return parts[1]; // admin/blog -> blog
  }
  
  return parts[0] || 'unknown';
}

// Get resource ID from path
function getResourceId(path: string): string | null {
  const cleanPath = path.split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean);
  
  // Look for numeric or slug-like IDs
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    // Check if it looks like an ID (numeric or slug)
    if (/^\d+$/.test(part) || (part.length > 3 && !['admin', 'blog', 'products', 'users', 'reviews', 'analytics'].includes(part))) {
      return part;
    }
  }
  
  return null;
}

// Check if path should be excluded
function shouldExclude(path: string): boolean {
  for (const pattern of EXCLUDED_PATHS) {
    if (typeof pattern === 'string') {
      if (path === pattern) return true;
    } else if (pattern.test(path)) {
      return true;
    }
  }
  return false;
}

// Get client IP address
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  
  return req.headers['x-real-ip'] as string || 
         req.socket.remoteAddress || 
         'unknown';
}

/**
 * Middleware để log tất cả requests vào SystemLog
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Skip excluded paths
  const startTime = Date.now();
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'];

  // Track request volume for traffic spike detection
  recordTrafficEvent({ ipAddress, path: req.path, userAgent, method: req.method });

  if (shouldExclude(req.path)) {
    return next();
  }

  // Store original end function
  const originalEnd = res.end;
  let responseSize = 0;

  // Override end to capture response size
  res.end = function(this: Response, chunk?: any, encoding?: BufferEncoding, callback?: () => void) {
    if (chunk) {
      responseSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
    }
    return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
  } as typeof res.end;

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const session = (req as any).session;
    const user = session?.user;

    const action = getActionName(req.method, req.path);

    // Determine if this is an important request
    const isImportant = IMPORTANT_PATHS.some(pattern => pattern.test(req.path));
    
    // Skip noisy view-only logs (page reloads) unless error occurs or path is important
    if (action === 'VIEW' && res.statusCode < 400 && !isImportant) {
      return;
    }

    // For non-important paths, only log errors or slow requests
    if (!isImportant && res.statusCode < 400 && duration < 1000) {
      // Still log but with minimal data for analytics
      createSystemLog({
        action,
        resource: getResourceName(req.path),
        resourceId: getResourceId(req.path),
        ipAddress,
        userAgent,
        userId: user?.id,
        username: user?.displayName || user?.username,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      }).catch(() => {});
      return;
    }

    // Full logging for important requests
    let requestBody: unknown = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      requestBody = req.body;
    }

    const description = generateDescription(req.method, req.path, res.statusCode, user);

    createSystemLog({
      action,
      resource: getResourceName(req.path),
      resourceId: getResourceId(req.path),
      description,
      ipAddress,
      userAgent,
      userId: user?.id,
      username: user?.displayName || user?.username,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      requestBody,
      responseSize
    }).catch(() => {});
  });

  next();
}

function generateDescription(method: string, path: string, statusCode: number, user?: any): string {
  const action = getActionName(method, path);
  const resource = getResourceName(path);
  const resourceId = getResourceId(path);
  const status = statusCode >= 400 ? 'FAILED' : 'SUCCESS';
  const userName = user?.displayName || user?.username || 'Guest';

  if (action === 'LOGIN') {
    return statusCode < 400 ? `${userName} đã đăng nhập` : 'Đăng nhập thất bại';
  }
  if (action === 'LOGOUT') {
    return `${userName} đã đăng xuất`;
  }
  
  const resourceText = resourceId ? `${resource}#${resourceId}` : resource;
  return `${userName} ${action} ${resourceText} - ${status}`;
}

/**
 * Middleware để check và block IP
 */
export async function ipBlockChecker(req: Request, res: Response, next: NextFunction) {
  const ipAddress = getClientIP(req);
  
  try {
    const blocked = await isIPBlocked(ipAddress);
    if (blocked) {
      recordTrafficEvent({ ipAddress, path: req.path, userAgent: req.headers['user-agent'], method: req.method });

      // Log blocked request
      createSystemLog({
        action: 'BLOCKED_REQUEST',
        resource: 'security',
        description: `Blocked request from IP: ${ipAddress}`,
        ipAddress,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        statusCode: 403
      }).catch(() => {});

      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address has been blocked due to suspicious activity'
      });
    }
  } catch (error) {
    // Don't block on error - fail open
    console.error('[IPBlockChecker] Error:', error);
  }

  next();
}
