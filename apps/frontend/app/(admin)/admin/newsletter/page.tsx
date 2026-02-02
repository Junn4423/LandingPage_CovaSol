'use client';

import { useState } from 'react';
import {
  useNewsletterStats,
  useNewsletterSubscriptions,
  useDeleteNewsletterMutation
} from '@/hooks/admin';

const PAGE_SIZE = 15;

export default function AdminNewsletterPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'unsubscribed'>('all');

  const statusFilter = activeTab === 'all' ? undefined : activeTab;

  const { data: stats, isLoading: statsLoading } = useNewsletterStats();
  const { data: response, isLoading, error } = useNewsletterSubscriptions({
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter
  });
  const deleteMutation = useDeleteNewsletterMutation();

  const subscriptions = response?.subscriptions || [];
  const pagination = response?.pagination;

  async function handleDelete(id: number, email: string) {
    if (!window.confirm(`Xóa đăng ký của "${email}"?`)) return;
    await deleteMutation.mutateAsync(id);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Quản lý Newsletter</h2>
          <p className="mt-1 text-slate-500">Theo dõi danh sách đăng ký nhận tin từ người dùng.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <i className="fas fa-user-check text-green-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Đang hoạt động</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{stats.totalActive}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <i className="fas fa-user-slash text-slate-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Đã hủy đăng ký</p>
                <p className="mt-1 text-2xl font-bold text-slate-600">{stats.totalUnsubscribed}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <i className="fas fa-calendar-plus text-blue-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Đăng ký tháng này</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{stats.totalThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'active', label: 'Đang hoạt động' },
          { key: 'unsubscribed', label: 'Đã hủy' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as typeof activeTab); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-[#124e66] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải danh sách đăng ký.</p>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="rounded-2xl bg-white shadow-lg overflow-hidden" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0d1b2a]">Danh sách đăng ký</h3>
            {pagination && (
              <span className="text-sm text-slate-500">Tổng: {pagination.total} người đăng ký</span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#124e66] border-t-transparent"></div>
              <span>Đang tải...</span>
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            Chưa có đăng ký nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nguồn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#124e66]/10">
                          <i className="fas fa-envelope text-[#124e66] text-sm"></i>
                        </div>
                        <span className="font-medium text-[#0d1b2a]">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sub.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                        {sub.status === 'active' ? 'Hoạt động' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {sub.source || 'Website'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                      >
                        <i className="fas fa-trash-alt mr-1.5"></i>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-500">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Sau
                <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
