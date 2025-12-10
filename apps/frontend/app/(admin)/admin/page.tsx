'use client';

import { useState } from 'react';
import { useAdminOverview } from '@/hooks/admin';

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useAdminOverview();
  const [isExporting, setIsExporting] = useState(false);
  const stats = [
    { label: 'Bài viết', value: data?.blogs ?? 0, icon: 'fas fa-newspaper', color: '#1c6e8c' },
    { label: 'Sản phẩm', value: data?.products ?? 0, icon: 'fas fa-cubes', color: '#2e8b57' },
    { label: 'Đánh giá', value: data?.reviews ?? 0, icon: 'fas fa-star', color: '#f59e0b' },
    { label: 'Người dùng', value: data?.users ?? 0, icon: 'fas fa-users', color: '#8b5cf6' },
    { label: 'Lượt truy cập', value: data?.totalVisits ?? 0, icon: 'fas fa-chart-column', color: '#0d1b2a' },
    { label: 'Khách duy nhất', value: data?.uniqueVisitors ?? 0, icon: 'fas fa-street-view', color: '#124e66' },
    { label: 'Opt-in cookie', value: data?.consentsOptIn ?? 0, icon: 'fas fa-cookie-bite', color: '#16a34a' },
    { label: 'Opt-out', value: data?.consentsOptOut ?? 0, icon: 'fas fa-ban', color: '#dc2626' }
  ];

  const overviewRows = [
    { label: 'Bài viết', value: data?.blogs },
    { label: 'Sản phẩm', value: data?.products },
    { label: 'Đánh giá', value: data?.reviews },
    { label: 'Người dùng', value: data?.users },
    { label: 'Tổng lượt truy cập', value: data?.totalVisits },
    { label: 'Khách duy nhất', value: data?.uniqueVisitors },
    { label: 'Consent tổng', value: data?.consentsTotal },
    { label: 'Opt-in', value: data?.consentsOptIn },
    { label: 'Opt-out', value: data?.consentsOptOut },
    { label: 'Tỉ lệ đồng ý', value: data?.consentRate ? `${(data.consentRate * 100).toFixed(1)}%` : '—' },
    { label: 'Lần truy cập gần nhất', value: data?.lastVisitAt ? new Date(data.lastVisitAt).toLocaleString('vi-VN') : '—' },
    { label: 'Lần cập nhật gần nhất', value: data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('vi-VN') : '—' }
  ];

  const formatNumber = (val?: number | null) =>
    typeof val === 'number' ? val.toLocaleString('vi-VN') : '—';

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const exportUrl = process.env.NEXT_PUBLIC_EXCEL_EXPORT_URL || `${apiBase}/database/export`;

      const res = await fetch(exportUrl, { credentials: 'include' });
      if (!res.ok) throw new Error('Không thể tải file Excel');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'covasol.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error)?.message || 'Xuất file Excel thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Tổng quan hệ thống</h2>
          <p className="mt-1 text-slate-500">
            {data?.lastUpdated 
              ? `Cập nhật lúc ${new Date(data.lastUpdated).toLocaleString('vi-VN')}` 
              : 'Đang tải dữ liệu realtime từ API...'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#124e66]/10 px-4 py-2 text-sm font-semibold text-[#1c6e8c]">
            {(data?.blogs ?? 0) + (data?.products ?? 0) + (data?.reviews ?? 0)} tài nguyên
          </span>
          <button
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <i className={`fas fa-sync-alt ${isFetching ? 'animate-spin' : ''}`}></i>
            <span>{isFetching ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải dữ liệu. Thử lại sau.</p>
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(item => (
          <div
            key={item.label}
            className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-4xl font-bold" style={{ color: item.color }}>
                  {isLoading ? (
                    <span className="inline-block h-10 w-16 animate-pulse rounded-lg bg-slate-100"></span>
                  ) : (
                    item.value
                  )}
                </p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
              >
                <i className={`${item.icon} text-lg`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
