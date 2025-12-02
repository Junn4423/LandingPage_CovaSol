'use client';

import { useAdminOverview } from '@/hooks/admin';

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useAdminOverview();
  const stats = [
    { label: 'Bài viết', value: data?.blogs ?? 0, icon: 'fas fa-newspaper', color: '#1c6e8c' },
    { label: 'Sản phẩm', value: data?.products ?? 0, icon: 'fas fa-cubes', color: '#2e8b57' },
    { label: 'Đánh giá', value: data?.reviews ?? 0, icon: 'fas fa-star', color: '#f59e0b' },
    { label: 'Người dùng', value: data?.users ?? 0, icon: 'fas fa-users', color: '#8b5cf6' }
  ];

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

      {/* Database Section */}
      <div className="rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#0d1b2a]">Sao lưu và đồng bộ</h3>
          <p className="mt-1 text-sm text-slate-500">Nhập xuất dữ liệu hệ thống.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h4 className="font-semibold text-[#0d1b2a]">Xuất database</h4>
            <p className="mt-1 text-sm text-slate-500">Tạo file Excel tổng hợp toàn bộ dữ liệu.</p>
            <button className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}>
              <i className="fas fa-file-export"></i>
              <span>Xuất file Excel</span>
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h4 className="font-semibold text-[#0d1b2a]">Tải template</h4>
            <p className="mt-1 text-sm text-slate-500">Sử dụng mẫu dữ liệu chuẩn hóa.</p>
            <button className="mt-4 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5">
              <i className="fas fa-file-download"></i>
              <span>Tải template</span>
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h4 className="font-semibold text-[#0d1b2a]">Import database</h4>
            <p className="mt-1 text-sm text-slate-500">Tải file Excel để đồng bộ dữ liệu.</p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center transition-all hover:border-[#1c6e8c] hover:bg-[#1c6e8c]/5">
              <label className="flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-[#1c6e8c]">
                <i className="fas fa-upload"></i>
                <span>Chọn file Excel</span>
                <input type="file" className="hidden" accept=".xlsx,.xls" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
