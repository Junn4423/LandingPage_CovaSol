import type { TrafficAlert, TrafficLevel, TrafficStatus } from '../types/covasol';

interface TrafficEvent {
  timestamp: number;
  ipAddress: string;
}

const WINDOW_MS = 60_000; // 1 minute sliding window
const BURST_WINDOW_MS = 5_000;
const HIGH_TRAFFIC_THRESHOLD = 3_000;
const CRITICAL_TRAFFIC_THRESHOLD = 5_000;
const MIN_ALERT_GAP_MS = 30_000;
const EMA_ALPHA = 0.1; // smoothing for baseline RPM
const MAX_ALERT_HISTORY = 20;

const recentEvents: TrafficEvent[] = [];
const ipCounters = new Map<string, number>();
let baselineRpm = 0;
let lastAlertAt = 0;
let lastSnapshot: TrafficStatus | null = null;
const alertHistory: TrafficAlert[] = [];
let lastComputedAt = 0;

function pruneOld(now: number) {
  while (recentEvents.length && now - recentEvents[0].timestamp > WINDOW_MS) {
    const expired = recentEvents.shift() as TrafficEvent;
    const current = ipCounters.get(expired.ipAddress) ?? 0;
    if (current <= 1) {
      ipCounters.delete(expired.ipAddress);
    } else {
      ipCounters.set(expired.ipAddress, current - 1);
    }
  }
}

function computeTopIps(total: number) {
  return Array.from(ipCounters.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ipAddress, count]) => ({
      ipAddress,
      count,
      percent: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    }));
}

function detectLevel(requestsPerMinute: number, rpmChange: number): { level: TrafficLevel; label: string } {
  if (requestsPerMinute >= CRITICAL_TRAFFIC_THRESHOLD || rpmChange >= 8) {
    return { level: 'critical', label: 'Potential DDoS' };
  }

  if (requestsPerMinute >= HIGH_TRAFFIC_THRESHOLD || rpmChange >= 4) {
    return { level: 'high', label: 'High Traffic' };
  }

  return { level: 'normal', label: 'Normal' };
}

function maybeEmitAlert(snapshot: TrafficStatus, now: number) {
  if (snapshot.level === 'normal') return;
  if (now - lastAlertAt < MIN_ALERT_GAP_MS) return;

  const alert: TrafficAlert = {
    id: `${now}`,
    level: snapshot.level,
    label: snapshot.label,
    message:
      snapshot.level === 'critical'
        ? 'Lưu lượng nghi ngờ DDoS - request/phút vượt xa ngưỡng an toàn'
        : 'Lưu lượng tăng đột biến so với mức cơ bản',
    triggeredAt: new Date(now).toISOString(),
    requestsPerMinute: snapshot.requestsPerMinute,
    requestsLast5s: snapshot.requestsLast5s,
    uniqueIps: snapshot.uniqueIps,
    baselineRpm: snapshot.baselineRpm,
    rpmChange: snapshot.rpmChange,
    topIps: snapshot.topIps
  };

  alertHistory.push(alert);
  if (alertHistory.length > MAX_ALERT_HISTORY) {
    alertHistory.splice(0, alertHistory.length - MAX_ALERT_HISTORY);
  }
  lastAlertAt = now;
}

function buildSnapshot(now: number): TrafficStatus {
  pruneOld(now);

  const requestsPerMinute = recentEvents.length;
  const requestsLast5s = recentEvents.filter(event => now - event.timestamp <= BURST_WINDOW_MS).length;
  const uniqueIps = ipCounters.size;

  baselineRpm = baselineRpm === 0 ? requestsPerMinute : baselineRpm * (1 - EMA_ALPHA) + requestsPerMinute * EMA_ALPHA;
  const rpmChange = baselineRpm > 0 ? (requestsPerMinute - baselineRpm) / Math.max(baselineRpm, 1) : 0;

  const topIps = computeTopIps(requestsPerMinute);
  const { level, label } = detectLevel(requestsPerMinute, rpmChange);

  return {
    level,
    label,
    requestsPerMinute,
    requestsLast5s,
    uniqueIps,
    baselineRpm: Number(baselineRpm.toFixed(1)),
    rpmChange: Number(rpmChange.toFixed(2)),
    topIps,
    recentAlerts: alertHistory.slice(-5).reverse(),
    lastUpdated: new Date(now).toISOString()
  };
}

export function recordTrafficEvent(input: { ipAddress: string; path?: string; userAgent?: string; method?: string }) {
  const now = Date.now();
  const ipAddress = input.ipAddress || 'unknown';

  recentEvents.push({ timestamp: now, ipAddress });
  ipCounters.set(ipAddress, (ipCounters.get(ipAddress) ?? 0) + 1);

  if (now - lastComputedAt < 750 && lastSnapshot) {
    return lastSnapshot;
  }

  const snapshot = buildSnapshot(now);
  lastSnapshot = snapshot;
  lastComputedAt = now;

  maybeEmitAlert(snapshot, now);
  return snapshot;
}

export function getTrafficStatus(): TrafficStatus {
  const now = Date.now();
  if (!lastSnapshot || now - lastComputedAt > 1_000) {
    lastSnapshot = buildSnapshot(now);
    lastComputedAt = now;
  }
  return lastSnapshot;
}

export function getTrafficAlerts() {
  return alertHistory.slice(-10).reverse();
}
