'use client';

import { useState, useMemo } from 'react';
import {
  useSystemLogsDashboard,
  useSystemLogs,
  useSuspiciousIPs,
  useBlockedIPs,
  useIPThreatAnalysis,
  useBlockIPMutation,
  useUnblockIPMutation
} from '@/hooks/admin';
import type { SystemLogFilters, IPThreatAnalysis } from '@/lib/admin-api';

// =====================================================
// HELPERS
// =====================================================

function formatDate(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('vi-VN');
}

function formatDuration(ms?: number | null) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getRiskLevelColor(level: string) {
  switch (level) {
    case 'critical': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
    case 'high': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    case 'medium': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
    default: return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
  }
}

function getThreatScoreColor(score: number) {
  if (score >= 80) return '#dc2626';
  if (score >= 50) return '#ea580c';
  if (score >= 25) return '#d97706';
  return '#16a34a';
}

function getStatusCodeColor(code?: number | null) {
  if (!code) return 'text-slate-500';
  if (code >= 500) return 'text-red-600 font-bold';
  if (code >= 400) return 'text-orange-600';
  if (code >= 300) return 'text-blue-600';
  return 'text-green-600';
}

function getActionIcon(action: string) {
  switch (action.toUpperCase()) {
    case 'LOGIN': return 'fas fa-sign-in-alt text-green-600';
    case 'LOGOUT': return 'fas fa-sign-out-alt text-slate-500';
    case 'CREATE': return 'fas fa-plus-circle text-blue-600';
    case 'UPDATE': return 'fas fa-edit text-amber-600';
    case 'DELETE': return 'fas fa-trash-alt text-red-600';
    case 'VIEW': return 'fas fa-eye text-slate-500';
    case 'UPLOAD': return 'fas fa-cloud-upload-alt text-purple-600';
    case 'BLOCK_IP': return 'fas fa-ban text-red-600';
    case 'UNBLOCK_IP': return 'fas fa-unlock text-green-600';
    case 'BLOCKED_REQUEST': return 'fas fa-shield-alt text-red-600';
    default: return 'fas fa-circle text-slate-400';
  }
}

// =====================================================
// COMPONENTS
// =====================================================

function ThreatScoreGauge({ score }: { score: number }) {
  const color = getThreatScoreColor(score);
  const rotation = (score / 100) * 180;
  
  return (
    <div className="relative w-24 h-12 overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-12 rounded-t-full border-8 border-slate-200"></div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-12 rounded-t-full border-8 transition-all duration-500"
        style={{ 
          borderColor: color,
          clipPath: `polygon(0 100%, 50% 50%, ${50 + 50 * Math.sin((rotation * Math.PI) / 180)}% ${100 - 50 * Math.cos((rotation * Math.PI) / 180)}%, 50% 100%)`
        }}
      ></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-lg font-bold" style={{ color }}>
        {score}%
      </div>
    </div>
  );
}

function IPAnalysisModal({ 
  ip, 
  onClose, 
  onBlock 
}: { 
  ip: string; 
  onClose: () => void; 
  onBlock: (ip: string, reason: string) => void;
}) {
  const { data: analysis, isLoading } = useIPThreatAnalysis(ip);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockForm, setShowBlockForm] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#124e66] border-t-transparent"></div>
            <span>Đang phân tích IP {ip}...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const riskColors = getRiskLevelColor(analysis.riskLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-[#0d1b2a]">Phân tích IP: {ip}</h3>
            <p className="text-sm text-slate-500">Chi tiết mức độ đe dọa và khuyến nghị</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <i className="fas fa-times text-slate-500"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Threat Score Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`rounded-xl p-4 ${riskColors.bg} ${riskColors.border} border`}>
              <p className="text-sm font-medium text-slate-600">Threat Score</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-4xl font-bold" style={{ color: getThreatScoreColor(analysis.threatScore) }}>
                  {analysis.threatScore}%
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${riskColors.bg} ${riskColors.text}`}>
                  {analysis.riskLevel}
                </span>
              </div>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-600">Requests 24h</p>
              <p className="mt-2 text-3xl font-bold text-[#124e66]">{analysis.stats.requestsLast24h.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{analysis.stats.avgRequestsPerMinute.toFixed(1)}/phút trung bình</p>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-600">Error Rate</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: analysis.stats.errorRate > 0.25 ? '#dc2626' : '#16a34a' }}>
                {(analysis.stats.errorRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">{analysis.stats.uniquePaths} unique paths</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-xl p-4 ${analysis.threatScore >= 50 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-start gap-3">
              <i className={`fas ${analysis.threatScore >= 50 ? 'fa-exclamation-triangle text-red-500' : 'fa-info-circle text-blue-500'} mt-0.5`}></i>
              <div>
                <p className="font-semibold text-slate-800">Khuyến nghị</p>
                <p className="text-sm text-slate-600">{analysis.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Threat Indicators */}
          {analysis.indicators.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold text-[#0d1b2a]">Dấu hiệu đe dọa ({analysis.indicators.length})</h4>
              <div className="space-y-2">
                {analysis.indicators.map((indicator, idx) => {
                  const severityColors = {
                    high: 'bg-red-100 text-red-700 border-red-200',
                    medium: 'bg-amber-100 text-amber-700 border-amber-200',
                    low: 'bg-slate-100 text-slate-700 border-slate-200'
                  };
                  return (
                    <div key={idx} className={`flex items-start gap-3 rounded-lg border p-3 ${severityColors[indicator.severity]}`}>
                      <span className="mt-0.5 rounded-full bg-white px-2 py-0.5 text-xs font-bold">
                        +{indicator.score}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{indicator.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs opacity-80">{indicator.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suspicious Patterns */}
          {analysis.stats.suspiciousPatterns.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold text-[#0d1b2a]">Patterns đáng ngờ</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.stats.suspiciousPatterns.map((pattern, idx) => (
                  <span key={idx} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div>
            <h4 className="mb-3 font-semibold text-[#0d1b2a]">Thống kê chi tiết</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Requests', value: analysis.stats.totalRequests.toLocaleString(), icon: 'fa-chart-bar' },
                { label: 'Last Hour', value: analysis.stats.requestsLastHour.toLocaleString(), icon: 'fa-clock' },
                { label: 'Unique Paths', value: analysis.stats.uniquePaths, icon: 'fa-sitemap' },
                { label: 'User Agents', value: analysis.stats.userAgentCount, icon: 'fa-laptop' }
              ].map(stat => (
                <div key={stat.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${stat.icon} text-[#124e66]`}></i>
                    <span className="text-xs text-slate-500">{stat.label}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-[#0d1b2a]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Block Form */}
          {analysis.threatScore >= 25 && !showBlockForm && (
            <button
              onClick={() => setShowBlockForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-all hover:bg-red-700"
            >
              <i className="fas fa-ban"></i>
              <span>Block IP này</span>
            </button>
          )}

          {showBlockForm && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h4 className="mb-3 font-semibold text-red-800">Block IP: {ip}</h4>
              <input
                type="text"
                placeholder="Lý do block (VD: DDoS, Scraping, Spam...)"
                className="mb-3 w-full rounded-lg border border-red-300 px-4 py-2 focus:border-red-500 focus:outline-none"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (blockReason.trim()) {
                      onBlock(ip, blockReason);
                      onClose();
                    }
                  }}
                  disabled={!blockReason.trim()}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                >
                  <i className="fas fa-ban mr-2"></i>Xác nhận Block
                </button>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function SystemLogsPage() {
  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'threats' | 'blocked'>('dashboard');
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [logFilters, setLogFilters] = useState<SystemLogFilters>({ page: 1, pageSize: 50 });

  // Queries
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useSystemLogsDashboard();
  const { data: logs, isLoading: logsLoading } = useSystemLogs(logFilters);
  const { data: suspiciousIPs, isLoading: suspiciousLoading } = useSuspiciousIPs(20);
  const { data: blockedIPs, isLoading: blockedLoading, refetch: refetchBlocked } = useBlockedIPs(false);

  // Mutations
  const blockMutation = useBlockIPMutation();
  const unblockMutation = useUnblockIPMutation();

  const handleBlockIP = async (ip: string, reason: string) => {
    try {
      await blockMutation.mutateAsync({ ipAddress: ip, reason });
      refetchDashboard();
      refetchBlocked();
    } catch (error) {
      alert('Không thể block IP');
    }
  };

  const handleUnblockIP = async (ip: string) => {
    if (!confirm(`Bạn có chắc muốn unblock IP ${ip}?`)) return;
    try {
      await unblockMutation.mutateAsync(ip);
      refetchDashboard();
      refetchBlocked();
    } catch (error) {
      alert('Không thể unblock IP');
    }
  };

  // Stats cards for dashboard
  const statsCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: 'Tổng logs', value: dashboard.logStats.totalLogs.toLocaleString(), icon: 'fas fa-database', color: '#124e66' },
      { label: 'Logs 24h', value: dashboard.logStats.logsLast24h.toLocaleString(), icon: 'fas fa-calendar-day', color: '#1c6e8c' },
      { label: 'Logs/giờ', value: dashboard.logStats.logsLastHour.toLocaleString(), icon: 'fas fa-clock', color: '#2e8b57' },
      { label: 'IP duy nhất 24h', value: dashboard.logStats.uniqueIPs24h.toLocaleString(), icon: 'fas fa-network-wired', color: '#8b5cf6' },
      { label: 'IP đang block', value: dashboard.blockedIPsCount, icon: 'fas fa-ban', color: '#dc2626' },
      { label: 'Đe dọa cao', value: dashboard.highThreatCount, icon: 'fas fa-exclamation-triangle', color: '#ea580c' },
      { label: 'Đe dọa nghiêm trọng', value: dashboard.criticalThreatCount, icon: 'fas fa-skull-crossbones', color: '#dc2626' },
      { label: 'Avg requests/h', value: Math.round(dashboard.logStats.avgRequestsPerHour).toLocaleString(), icon: 'fas fa-chart-line', color: '#0d1b2a' }
    ];
  }, [dashboard]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#124e66]">Security & Monitoring</p>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Nhật ký hệ thống</h2>
          <p className="text-sm text-slate-500">Giám sát hoạt động, phát hiện và ngăn chặn các mối đe dọa</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchDashboard()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <i className={`fas fa-sync-alt ${dashboardLoading ? 'animate-spin' : ''}`}></i>
            <span>Làm mới</span>
          </button>
          {dashboard && (
            <span className="rounded-full bg-[#124e66]/10 px-4 py-2 text-sm font-semibold text-[#124e66]">
              Cập nhật realtime
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'dashboard', label: 'Tổng quan', icon: 'fa-chart-pie' },
          { id: 'logs', label: 'Chi tiết logs', icon: 'fa-list-ul' },
          { id: 'threats', label: 'Phát hiện đe dọa', icon: 'fa-shield-alt' },
          { id: 'blocked', label: 'IP đã block', icon: 'fa-ban' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'border-[#124e66] text-[#124e66]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
            {tab.id === 'blocked' && blockedIPs && blockedIPs.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {blockedIPs.length}
              </span>
            )}
            {tab.id === 'threats' && dashboard && dashboard.criticalThreatCount > 0 && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {dashboard.criticalThreatCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100"></div>
                ))
              ) : (
                statsCards.map(card => (
                  <div
                    key={card.label}
                    className="rounded-2xl bg-white p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                    style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                        style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}
                      >
                        <i className={`${card.icon} text-sm`}></i>
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                  </div>
                ))
              )}
            </div>

            {/* Action Breakdown & Recent Errors */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Action Breakdown */}
              <div className="rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
                <h3 className="mb-4 text-lg font-semibold text-[#0d1b2a]">Phân bố Actions</h3>
                {dashboard?.logStats.actionBreakdown && (
                  <div className="space-y-3">
                    {dashboard.logStats.actionBreakdown.map(item => {
                      const total = dashboard.logStats.actionBreakdown.reduce((s, i) => s + i.count, 0);
                      const percent = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.action} className="flex items-center gap-3">
                          <i className={getActionIcon(item.action)}></i>
                          <span className="w-24 text-sm font-medium text-slate-700">{item.action}</span>
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-[#124e66] transition-all"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-slate-600">{item.count.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Errors */}
              <div className="rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
                <h3 className="mb-4 text-lg font-semibold text-[#0d1b2a]">Lỗi gần đây (24h)</h3>
                {dashboard?.logStats.recentErrors && dashboard.logStats.recentErrors.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {dashboard.logStats.recentErrors.slice(0, 10).map(err => (
                      <div key={err.id} className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${getStatusCodeColor(err.statusCode)} bg-white`}>
                          {err.statusCode}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{err.path}</p>
                          <p className="text-xs text-slate-500">
                            {err.ipAddress} • {formatDate(err.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-slate-500">
                    <i className="fas fa-check-circle mr-2 text-green-500"></i>
                    Không có lỗi trong 24h qua
                  </div>
                )}
              </div>
            </div>

            {/* Top Suspicious IPs Preview */}
            {dashboard?.topSuspiciousIPs && dashboard.topSuspiciousIPs.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#0d1b2a]">IP đáng ngờ hàng đầu</h3>
                  <button 
                    onClick={() => setActiveTab('threats')}
                    className="text-sm font-medium text-[#124e66] hover:underline"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dashboard.topSuspiciousIPs.slice(0, 6).map(ip => {
                    const colors = getRiskLevelColor(ip.riskLevel);
                    return (
                      <button
                        key={ip.ipAddress}
                        onClick={() => setSelectedIP(ip.ipAddress)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md ${colors.border} ${colors.bg}`}
                      >
                        <div 
                          className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white"
                          style={{ backgroundColor: getThreatScoreColor(ip.threatScore) }}
                        >
                          {ip.threatScore}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{ip.ipAddress}</p>
                          <p className="text-xs text-slate-600">
                            {ip.stats.requestsLast24h.toLocaleString()} req/24h
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${colors.text}`}>
                          {ip.riskLevel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-[#124e66] focus:outline-none"
                value={logFilters.search || ''}
                onChange={(e) => setLogFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
              <select
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                value={logFilters.action || ''}
                onChange={(e) => setLogFilters(prev => ({ ...prev, action: e.target.value || undefined, page: 1 }))}
              >
                <option value="">Tất cả actions</option>
                {dashboard?.filterOptions.actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                value={logFilters.resource || ''}
                onChange={(e) => setLogFilters(prev => ({ ...prev, resource: e.target.value || undefined, page: 1 }))}
              >
                <option value="">Tất cả resources</option>
                {dashboard?.filterOptions.resources.map(resource => (
                  <option key={resource} value={resource}>{resource}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Lọc theo IP"
                className="w-40 rounded-lg border border-slate-200 px-4 py-2 text-sm"
                value={logFilters.ipAddress || ''}
                onChange={(e) => setLogFilters(prev => ({ ...prev, ipAddress: e.target.value || undefined, page: 1 }))}
              />
            </div>

            {/* Logs Table */}
            <div className="rounded-2xl bg-white shadow-lg overflow-hidden" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
              {logsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#124e66] border-t-transparent"></div>
                    <span className="text-slate-500">Đang tải logs...</span>
                  </div>
                </div>
              ) : logs && logs.items.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm">
                      <thead className="bg-[#124e66]/[0.08]">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Thời gian</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Action</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Resource</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">User</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">IP</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Path</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.items.map(log => (
                          <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-2">
                                <i className={getActionIcon(log.action)}></i>
                                <span className="font-medium text-slate-800">{log.action}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{log.resource}</td>
                            <td className="px-4 py-3 text-slate-700">{log.username || '—'}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedIP(log.ipAddress)}
                                className="text-[#124e66] hover:underline font-mono text-xs"
                              >
                                {log.ipAddress}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={log.path || ''}>
                              {log.path || '—'}
                            </td>
                            <td className={`px-4 py-3 ${getStatusCodeColor(log.statusCode)}`}>
                              {log.statusCode || '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{formatDuration(log.duration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                    <span className="text-sm text-slate-500">
                      Hiển thị {logs.items.length} / {logs.total.toLocaleString()} logs
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLogFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                        disabled={!logFilters.page || logFilters.page <= 1}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                      >
                        ← Trước
                      </button>
                      <span className="px-3 py-1 text-sm text-slate-600">
                        Trang {logs.page} / {logs.totalPages}
                      </span>
                      <button
                        onClick={() => setLogFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                        disabled={logs.page >= logs.totalPages}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-64 items-center justify-center text-slate-500">
                  Không có logs nào khớp với bộ lọc
                </div>
              )}
            </div>
          </div>
        )}

        {/* THREATS TAB */}
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-shield-alt mt-0.5 text-amber-600"></i>
                <div>
                  <p className="font-semibold text-amber-800">Hệ thống phát hiện đe dọa</p>
                  <p className="text-sm text-amber-700">
                    Phân tích request patterns, error rates, user agent rotation và các dấu hiệu đáng ngờ khác.
                    Click vào IP để xem chi tiết và quyết định block.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {suspiciousLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100"></div>
                ))
              ) : suspiciousIPs && suspiciousIPs.length > 0 ? (
                suspiciousIPs.map(ip => {
                  const colors = getRiskLevelColor(ip.riskLevel);
                  return (
                    <div 
                      key={ip.ipAddress}
                      className={`rounded-2xl border bg-white p-5 shadow-lg transition-all hover:shadow-xl ${colors.border}`}
                      style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Threat Score */}
                        <div 
                          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                          style={{ backgroundColor: getThreatScoreColor(ip.threatScore) }}
                        >
                          {ip.threatScore}%
                        </div>

                        {/* IP Info */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#0d1b2a] font-mono">{ip.ipAddress}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
                              {ip.riskLevel}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{ip.recommendation}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-center">
                          <div>
                            <p className="text-2xl font-bold text-[#124e66]">{ip.stats.requestsLast24h.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Requests 24h</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold" style={{ color: ip.stats.errorRate > 0.25 ? '#dc2626' : '#16a34a' }}>
                              {(ip.stats.errorRate * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-slate-500">Error rate</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-700">{ip.stats.uniquePaths}</p>
                            <p className="text-xs text-slate-500">Unique paths</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedIP(ip.ipAddress)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <i className="fas fa-search mr-2"></i>Chi tiết
                          </button>
                          {ip.threatScore >= 50 && (
                            <button
                              onClick={() => handleBlockIP(ip.ipAddress, `Auto: Threat score ${ip.threatScore}%`)}
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                              <i className="fas fa-ban mr-2"></i>Block
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Indicators */}
                      {ip.indicators.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {ip.indicators.slice(0, 5).map((ind, idx) => (
                            <span 
                              key={idx} 
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                ind.severity === 'high' ? 'bg-red-100 text-red-700' :
                                ind.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}
                            >
                              +{ind.score} {ind.type.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {ip.indicators.length > 5 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              +{ip.indicators.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl bg-white text-slate-500">
                  <i className="fas fa-check-circle mr-2 text-green-500"></i>
                  Không phát hiện IP đáng ngờ
                </div>
              )}
            </div>
          </div>
        )}

        {/* BLOCKED TAB */}
        {activeTab === 'blocked' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-ban mt-0.5 text-red-600"></i>
                <div>
                  <p className="font-semibold text-red-800">Quản lý IP bị chặn</p>
                  <p className="text-sm text-red-700">
                    Các IP trong danh sách này sẽ bị từ chối truy cập hoàn toàn vào hệ thống.
                    Bạn có thể unblock bất kỳ lúc nào.
                  </p>
                </div>
              </div>
            </div>

            {blockedLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                  <span className="text-slate-500">Đang tải danh sách blocked...</span>
                </div>
              </div>
            ) : blockedIPs && blockedIPs.length > 0 ? (
              <div className="rounded-2xl bg-white shadow-lg overflow-hidden" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">IP Address</th>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">Lý do</th>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">Threat Score</th>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">Blocked by</th>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">Thời gian</th>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">Hết hạn</th>
                      <th className="px-4 py-3 text-left font-semibold text-red-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedIPs.map(ip => (
                      <tr key={ip.id} className="border-b border-slate-100 hover:bg-red-50/50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedIP(ip.ipAddress)}
                            className="font-mono font-semibold text-[#124e66] hover:underline"
                          >
                            {ip.ipAddress}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{ip.reason}</td>
                        <td className="px-4 py-3">
                          <span 
                            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            style={{ backgroundColor: getThreatScoreColor(ip.threatScore) }}
                          >
                            {ip.threatScore}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{ip.blockedByName || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(ip.blockedAt)}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {ip.expiresAt ? formatDate(ip.expiresAt) : 'Vĩnh viễn'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleUnblockIP(ip.ipAddress)}
                            className="rounded-lg border border-green-300 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100"
                          >
                            <i className="fas fa-unlock mr-1"></i>Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl bg-white text-slate-500">
                <i className="fas fa-check-circle mr-2 text-green-500"></i>
                Chưa có IP nào bị block
              </div>
            )}
          </div>
        )}
      </div>

      {/* IP Analysis Modal */}
      {selectedIP && (
        <IPAnalysisModal
          ip={selectedIP}
          onClose={() => setSelectedIP(null)}
          onBlock={handleBlockIP}
        />
      )}
    </div>
  );
}
