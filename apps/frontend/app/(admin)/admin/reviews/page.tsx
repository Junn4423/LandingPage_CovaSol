'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PaginationControls } from '@/components/admin/pagination-controls';
import {
  useAdminReviews,
  useAdminReviewStats,
  useDeleteReviewMutation,
  useSaveReviewMutation,
  useApproveReviewMutation,
  useRejectReviewMutation
} from '@/hooks/admin';
import { useClientPagination } from '@/hooks/use-pagination';
import type { CustomerReviewDetail } from '@/types/content';

interface ReviewFormState {
  name: string;
  role: string;
  company: string;
  rating: number;
  quote: string;
  bgColor: string;
  status: 'pending' | 'draft' | 'published';
  isFeatured: boolean;
}

const emptyForm: ReviewFormState = {
  name: '',
  role: '',
  company: '',
  rating: 5,
  quote: '',
  bgColor: '#124e66',
  status: 'pending',
  isFeatured: false
};

const REVIEW_PAGE_SIZE = 6;

export default function AdminReviewsPage() {
  const { data: reviews, isLoading, error } = useAdminReviews();
  const { data: stats } = useAdminReviewStats();
  const saveMutation = useSaveReviewMutation();
  const deleteMutation = useDeleteReviewMutation();
  const approveMutation = useApproveReviewMutation();
  const rejectMutation = useRejectReviewMutation();

  const [selectedReview, setSelectedReview] = useState<CustomerReviewDetail | null>(null);
  const [formState, setFormState] = useState<ReviewFormState>(emptyForm);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'published'>('all');

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (activeTab === 'all') return reviews;
    return reviews.filter(r => r.status === activeTab);
  }, [reviews, activeTab]);

  const pagination = useClientPagination(filteredReviews, { pageSize: REVIEW_PAGE_SIZE });
  const visibleReviews = pagination.items;

  const pendingCount = useMemo(() => reviews?.filter(r => r.status === 'pending').length ?? 0, [reviews]);
  const featuredCount = useMemo(() => reviews?.filter(review => review.isFeatured).length ?? 0, [reviews]);

  useEffect(() => {
    if (!selectedReview) {
      setFormState(emptyForm);
      return;
    }
    setFormState({
      name: selectedReview.name,
      role: selectedReview.role,
      company: selectedReview.company ?? '',
      rating: selectedReview.rating ?? 5,
      quote: selectedReview.quote,
      bgColor: selectedReview.bgColor ?? '#124e66',
      status: (selectedReview.status as ReviewFormState['status']) ?? 'published',
      isFeatured: selectedReview.isFeatured ?? false
    });
  }, [selectedReview]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveMutation.mutateAsync({
      id: selectedReview?.id,
      name: formState.name,
      role: formState.role,
      company: formState.company || undefined,
      rating: Number(formState.rating) || 5,
      quote: formState.quote,
      bgColor: formState.bgColor || undefined,
      status: formState.status,
      isFeatured: formState.isFeatured
    });
    setSelectedReview(null);
    setFormState(emptyForm);
  }

  async function handleDelete(review: CustomerReviewDetail) {
    if (!review.id) {
      alert('Không thể xác định ID đánh giá.');
      return;
    }
    if (!window.confirm(`Xoá đánh giá của "${review.name}"?`)) {
      return;
    }
    await deleteMutation.mutateAsync(review.id);
    if (selectedReview?.id === review.id) {
      setSelectedReview(null);
      setFormState(emptyForm);
    }
  }

  async function handleApprove(review: CustomerReviewDetail) {
    if (!review.id) return;
    await approveMutation.mutateAsync(review.id);
  }

  async function handleReject(review: CustomerReviewDetail) {
    if (!review.id) return;
    await rejectMutation.mutateAsync(review.id);
  }

  function handleEdit(review: CustomerReviewDetail) {
    setSelectedReview(review);
  }

  function handleCancel() {
    setSelectedReview(null);
    setFormState(emptyForm);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Quản lý đánh giá</h2>
          <p className="mt-1 text-slate-500">Theo dõi, duyệt phản hồi và spotlight review nổi bật.</p>
        </div>
        <button
          onClick={() => setSelectedReview(null)}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <i className="fas fa-star"></i>
          <span>Thêm đánh giá mới</span>
        </button>
      </div>

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <p className="text-sm font-medium text-slate-500">Tổng số đánh giá</p>
            <p className="mt-2 text-3xl font-bold text-[#0d1b2a]">{stats.totalReviews}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <p className="text-sm font-medium text-slate-500">Chờ duyệt</p>
            <p className="mt-2 text-3xl font-bold text-amber-500">{pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <p className="text-sm font-medium text-slate-500">Điểm trung bình</p>
            <p className="mt-2 text-3xl font-bold text-[#f59e0b]">{stats.averageRating.toFixed(1)} / 5</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
            <p className="text-sm font-medium text-slate-500">Review nổi bật</p>
            <p className="mt-2 text-3xl font-bold text-[#1c6e8c]">{featuredCount}</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải danh sách đánh giá.</p>
        </div>
      ) : null}

      {/* Tab Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tất cả', count: reviews?.length },
          { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
          { key: 'published', label: 'Đã duyệt', count: reviews?.filter(r => r.status === 'published').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === tab.key 
                ? 'bg-[#124e66] text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="flex min-h-0 flex-col rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0d1b2a]">Danh sách đánh giá</h3>
            <span className="text-sm font-medium text-slate-500">{pagination.totalItems} đánh giá</span>
          </div>
          <div className="mt-4 flex-1 min-h-0">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent"></div>
                  <span>Đang tải phản hồi...</span>
                </div>
              </div>
            ) : pagination.totalItems === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                Chưa có đánh giá nào. Nhấn &quot;Thêm đánh giá mới&quot; để khởi tạo đầu tiên.
              </div>
            ) : (
              <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
                {visibleReviews.map(review => (
                  <article
                    key={review.id}
                    className={`rounded-2xl border px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow ${
                      selectedReview?.id === review.id ? 'border-[#f59e0b] bg-[#fff7ed]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-[#0d1b2a]">{review.name}</p>
                        <p className="text-sm text-slate-500">{review.role}{review.company ? ` • ${review.company}` : ''}</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#f59e0b]">
                        <i className="fas fa-star"></i>
                        {review.rating?.toFixed(1) ?? '5.0'}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">&quot;{review.quote}&quot;</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        review.status === 'published' ? 'bg-green-100 text-green-700' : 
                        review.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {review.status === 'published' ? 'Đang hiển thị' : review.status === 'pending' ? 'Chờ duyệt' : 'Bản nháp'}
                      </span>
                      {review.isFeatured ? (
                        <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#b45309]">
                          Featured
                        </span>
                      ) : null}
                      <div className="ml-auto flex flex-wrap gap-1">
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(review)}
                              disabled={approveMutation.isPending}
                              className="rounded-lg bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 transition-all hover:bg-green-200 disabled:opacity-50"
                            >
                              <i className="fas fa-check mr-1"></i>Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(review)}
                              disabled={rejectMutation.isPending}
                              className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-200 disabled:opacity-50"
                            >
                              <i className="fas fa-times mr-1"></i>Từ chối
                            </button>
                          </>
                        )}
                        {review.status === 'published' && (
                          <button
                            onClick={() => handleReject(review)}
                            disabled={rejectMutation.isPending}
                            className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-200 disabled:opacity-50"
                          >
                            <i className="fas fa-eye-slash mr-1"></i>Ẩn
                          </button>
                        )}
                        {review.status === 'draft' && (
                          <button
                            onClick={() => handleApprove(review)}
                            disabled={approveMutation.isPending}
                            className="rounded-lg bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 transition-all hover:bg-green-200 disabled:opacity-50"
                          >
                            <i className="fas fa-check mr-1"></i>Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(review)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(review)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <PaginationControls
            start={pagination.startIndex}
            end={pagination.endIndex}
            total={pagination.totalItems}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPrev={pagination.goToPrev}
            onNext={pagination.goToNext}
            isLoading={isLoading}
            className="mt-4 border-t border-slate-100 pt-4"
          />
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl bg-white p-6 shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0d1b2a]">{selectedReview ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}</h3>
              <p className="text-sm text-slate-500">Điền thông tin ngắn gọn và lời trích dẫn nổi bật.</p>
            </div>
            {selectedReview ? (
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                <i className="fas fa-times"></i>
              </button>
            ) : null}
          </div>
          <form onSubmit={handleSubmit} className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0f172a]">Họ tên</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                value={formState.name}
                onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Vai trò</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                  value={formState.role}
                  onChange={e => setFormState(prev => ({ ...prev, role: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Doanh nghiệp (tuỳ chọn)</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                  value={formState.company}
                  onChange={e => setFormState(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Điểm rating</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                  value={formState.rating}
                  onChange={e => setFormState(prev => ({ ...prev, rating: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Màu nhấn (hex)</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                  value={formState.bgColor}
                  onChange={e => setFormState(prev => ({ ...prev, bgColor: e.target.value }))}
                  placeholder="#124e66"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0f172a]">Trích dẫn</label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                rows={4}
                value={formState.quote}
                onChange={e => setFormState(prev => ({ ...prev, quote: e.target.value }))}
                placeholder="Chia sẻ nổi bật nhất từ khách hàng"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Trạng thái</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20"
                  value={formState.status}
                  onChange={e => setFormState(prev => ({ ...prev, status: e.target.value as ReviewFormState['status'] }))}
                >
                  <option value="pending">Chờ duyệt</option>
                  <option value="published">Đã duyệt (Published)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                </select>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <input
                  id="featured-toggle"
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-[#f59e0b] focus:ring-[#f59e0b]"
                  checked={formState.isFeatured}
                  onChange={e => setFormState(prev => ({ ...prev, isFeatured: e.target.checked }))}
                />
                <label htmlFor="featured-toggle" className="text-sm font-semibold text-[#0f172a]">
                  Đánh dấu Featured
                </label>
              </div>
            </div>
            {saveMutation.isError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Không thể lưu đánh giá. Vui lòng thử lại.</p>
            ) : null}
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <i className="fas fa-save"></i>
              <span>{saveMutation.isPending ? 'Đang lưu...' : selectedReview ? 'Cập nhật đánh giá' : 'Lưu đánh giá'}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
