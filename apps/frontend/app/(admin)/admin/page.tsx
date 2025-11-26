'use client';

import { useAdminOverview } from '@/hooks/admin';

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useAdminOverview();
  const stats = [
    { label: 'Bài viết', value: data?.blogs ?? 0 },
    { label: 'Sản phẩm', value: data?.products ?? 0 },
    { label: 'Người dùng', value: data?.users ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-primary">Xin chào Admin!</p>
        <h1 className="text-3xl font-semibold text-slate-900">Bảng điều khiển (MVP)</h1>
        <p className="mt-2 text-sm text-slate-500">
          {data?.lastUpdated ? `Cập nhật lúc ${new Date(data.lastUpdated).toLocaleString('vi-VN')}` : 'Đang tải dữ liệu realtime từ API...'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Đang đồng bộ...' : 'Làm mới dữ liệu'}
        </button>
        {error ? <p className="text-sm text-red-600">Không thể tải dữ liệu. Thử lại sau.</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(item => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-3xl font-semibold text-slate-900">
              {isLoading ? '—' : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
