'use client';

import {
  useAdminCookieConsents,
  useAdminOverview,
  useAdminVisitLogs
} from '@/hooks/admin';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('vi-VN');
}

function preferencesSummary(preferences?: unknown) {
  if (!preferences) return 'Không lưu chi tiết';
  try {
    const asText = JSON.stringify(preferences);
    return asText.length > 120 ? `${asText.slice(0, 120)}...` : asText;
  } catch (error) {
    return 'Không thể đọc cấu trúc';
  }
}

export default function AdminAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const { data: visits, isLoading: visitsLoading } = useAdminVisitLogs(50);
  const { data: consents, isLoading: consentsLoading } = useAdminCookieConsents({ page: 1, pageSize: 30 });

  const consentStats = consents?.stats;

  const cards = [
    {
      label: 'Lượt truy cập',
      value: overview?.totalVisits ?? 0,
      icon: 'fas fa-chart-column',
      color: '#124e66'
    },
    {
      label: 'Khách truy cập duy nhất',
      value: overview?.uniqueVisitors ?? 0,
      icon: 'fas fa-street-view',
      color: '#0d1b2a'
    },
    {
      label: 'Opt-in cookie',
      value: consentStats?.optIn ?? 0,
      icon: 'fas fa-cookie-bite',
      color: '#16a34a'
    },
    {
      label: 'Opt-out',
      value: consentStats?.optOut ?? 0,
      icon: 'fas fa-ban',
      color: '#dc2626'
    },
    {
      label: 'Tỉ lệ đồng ý',
      value: `${(consentStats?.optInRate ?? 0).toFixed(1)}%`,
      icon: 'fas fa-percentage',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#124e66]">Analytics & Consent</p>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Tăng trưởng truy cập & quyền riêng tư</h2>
          <p className="text-sm text-slate-500">Theo dõi traffic, opt-in cookie và ưu tiên nhóm khách hàng đồng ý nhận marketing.</p>
        </div>
        <span className="rounded-full bg-[#124e66]/10 px-4 py-2 text-sm font-semibold text-[#124e66]">
          Cập nhật: {overview?.lastUpdated ? formatDate(overview.lastUpdated) : 'Đang tải...'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(card => (
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
            <p className="mt-3 text-3xl font-bold" style={{ color: card.color }}>
              {overviewLoading || consentsLoading ? '—' : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="flex min-h-0 flex-col rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0d1b2a]">Lượt truy cập gần nhất</h3>
              <p className="text-sm text-slate-500">Ưu tiên IP/thiết bị tương tác nhiều để retargeting.</p>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {visitsLoading ? 'Đang tải...' : `${visits?.total ?? 0} bản ghi`}
            </span>
          </div>
          <div className="mt-4 flex-1 min-h-0 overflow-auto">
            {visitsLoading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#124e66] border-t-transparent"></div>
                  <span>Đang tải lượt truy cập...</span>
                </div>
              </div>
            ) : (visits?.items?.length ?? 0) === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
                Chưa có dữ liệu truy cập.
              </div>
            ) : (
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-[#124e66]/[0.08]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">IP</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Lượt</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Lần cuối</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Thiết bị</th>
                  </tr>
                </thead>
                <tbody>
                  {visits?.items?.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-semibold text-[#0d1b2a]">{item.ipAddress}</td>
                      <td className="px-4 py-3 text-slate-700">{item.visitCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.lastVisitedAt)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="line-clamp-2">{item.userAgent || 'Không rõ'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0d1b2a]">Cookie consent</h3>
              <p className="text-sm text-slate-500">Xem ai cho phép dùng cookie để kích hoạt chiến dịch remarketing.</p>
            </div>
            <div className="flex flex-col items-end text-sm text-slate-600">
              <span>24h gần nhất: {consentStats?.last24h ?? 0}</span>
              <span>IP duy nhất: {consentStats?.uniqueIp ?? 0}</span>
            </div>
          </div>
          <div className="mt-4 flex-1 min-h-0 overflow-auto">
            {consentsLoading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent"></div>
                  <span>Đang tải consent...</span>
                </div>
              </div>
            ) : (consents?.items?.length ?? 0) === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
                Chưa ghi nhận người dùng nào.
              </div>
            ) : (
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-[#f59e0b]/[0.08]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">IP</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Thời gian</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0d1b2a]">Ưu tiên</th>
                  </tr>
                </thead>
                <tbody>
                  {consents?.items?.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-semibold text-[#0d1b2a]">{item.ipAddress}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          item.consented ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.consented ? 'Opt-in' : 'Opt-out'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.consentedAt)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="line-clamp-2">{preferencesSummary(item.preferences)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
