'use client';

import { useState } from 'react';
import {
  useMyPostsEditRequests,
  useMyEditRequests,
  useEditRequestDetail,
  useApproveEditRequestMutation,
  useRejectEditRequestMutation,
  useDeleteEditRequestMutation,
  useAdminSession
} from '@/hooks/admin';

type TabType = 'my-posts' | 'my-requests';

interface FlashMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Chờ duyệt</span>;
    case 'approved':
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Đã duyệt</span>;
    case 'rejected':
      return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Từ chối</span>;
    default:
      return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{status}</span>;
  }
}

// Helper to render value comparison
function renderValueDiff(label: string, currentValue: unknown, proposedValue: unknown) {
  const current = currentValue ?? '(trống)';
  const proposed = proposedValue ?? '(trống)';
  
  if (JSON.stringify(current) === JSON.stringify(proposed)) {
    return null; // No change
  }

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined || val === '') return '(trống)';
    if (Array.isArray(val)) return val.join(', ') || '(trống)';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  return (
    <div key={label} className="border-b border-slate-100 py-3 last:border-0">
      <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-red-50 p-3">
          <p className="mb-1 text-xs font-medium text-red-600">Hiện tại</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{formatValue(current)}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <p className="mb-1 text-xs font-medium text-green-600">Đề xuất</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{formatValue(proposed)}</p>
        </div>
      </div>
    </div>
  );
}

// Field labels for display
const FIELD_LABELS: Record<string, string> = {
  title: 'Tiêu đề',
  subtitle: 'Phụ đề',
  excerpt: 'Mô tả tóm tắt',
  content: 'Nội dung',
  category: 'Danh mục',
  tags: 'Tags',
  keywords: 'Keywords',
  imageUrl: 'URL ảnh bìa',
  authorName: 'Tên tác giả',
  authorRole: 'Chức danh',
  status: 'Trạng thái',
  isFeatured: 'Nổi bật',
  publishedAt: 'Ngày xuất bản',
  galleryMedia: 'Thư viện ảnh',
  videoItems: 'Video',
  sourceLinks: 'Nguồn tham khảo'
};

export default function EditRequestsPage() {
  const { data: currentUser } = useAdminSession();
  const [activeTab, setActiveTab] = useState<TabType>('my-posts');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  const { data: myPostsRequests = [], isLoading: loadingMyPosts } = useMyPostsEditRequests();
  const { data: myRequests = [], isLoading: loadingMyRequests } = useMyEditRequests();
  const { data: selectedRequest, isLoading: loadingDetail } = useEditRequestDetail(selectedRequestId ?? 0);

  const approveMutation = useApproveEditRequestMutation();
  const rejectMutation = useRejectEditRequestMutation();
  const deleteMutation = useDeleteEditRequestMutation();

  const showFlash = (message: string, type: FlashMessage['type'] = 'info') => {
    setFlash({ message, type });
    setTimeout(() => setFlash(null), 3200);
  };

  const handleApprove = async () => {
    if (!selectedRequestId) return;
    try {
      await approveMutation.mutateAsync({ requestId: selectedRequestId, reviewNote: reviewNote || undefined });
      showFlash('Đã duyệt và áp dụng các thay đổi', 'success');
      setSelectedRequestId(null);
      setReviewNote('');
    } catch (err) {
      showFlash((err as Error)?.message || 'Không thể duyệt yêu cầu', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;
    if (!reviewNote.trim()) {
      showFlash('Vui lòng nhập lý do từ chối', 'error');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ requestId: selectedRequestId, reviewNote });
      showFlash('Đã từ chối yêu cầu sửa bài', 'success');
      setSelectedRequestId(null);
      setReviewNote('');
    } catch (err) {
      showFlash((err as Error)?.message || 'Không thể từ chối yêu cầu', 'error');
    }
  };

  const handleDelete = async (requestId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) return;
    try {
      await deleteMutation.mutateAsync(requestId);
      showFlash('Đã xóa yêu cầu', 'success');
      if (selectedRequestId === requestId) {
        setSelectedRequestId(null);
      }
    } catch (err) {
      showFlash((err as Error)?.message || 'Không thể xóa yêu cầu', 'error');
    }
  };

  const requests = activeTab === 'my-posts' ? myPostsRequests : myRequests;
  const isLoading = activeTab === 'my-posts' ? loadingMyPosts : loadingMyRequests;
  const pendingCount = myPostsRequests.filter(r => r.status === 'pending').length;

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0d1b2a]">Yêu cầu chỉnh sửa</h2>
            <p className="mt-1 text-slate-500">Quản lý các yêu cầu sửa bài viết cần phê duyệt.</p>
          </div>
          {pendingCount > 0 && (
            <span className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              <i className="fas fa-bell"></i>
              {pendingCount} yêu cầu chờ duyệt
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('my-posts'); setSelectedRequestId(null); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'my-posts'
                ? 'bg-[#124e66] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-inbox"></i>
            Yêu cầu cho bài của tôi
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('my-requests'); setSelectedRequestId(null); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'my-requests'
                ? 'bg-[#124e66] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
            Yêu cầu tôi đã gửi
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid flex-1 min-h-0 grid-cols-[1fr_1.2fr] gap-6">
          {/* Request List */}
          <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-[#0d1b2a]">
                {activeTab === 'my-posts' ? 'Yêu cầu chờ duyệt' : 'Yêu cầu đã gửi'}
              </h3>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1c6e8c] border-t-transparent"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <i className="fas fa-folder-open mb-3 text-3xl"></i>
                  <p>Chưa có yêu cầu nào</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {requests.map(req => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`cursor-pointer px-5 py-4 transition-colors hover:bg-slate-50 ${
                        selectedRequestId === req.id ? 'bg-[#124e66]/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#0d1b2a]">{req.blogPostTitle}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {activeTab === 'my-posts' ? (
                              <>Từ: <span className="font-medium">{req.requesterName}</span></>
                            ) : (
                              <>Ngày gửi: {formatDate(req.createdAt)}</>
                            )}
                          </p>
                          {activeTab === 'my-requests' && req.status === 'rejected' && (
                            <p className="mt-1 line-clamp-2 text-xs text-red-600">
                              Lý do từ chối: {req.reviewNote || 'Không có ghi chú'}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(req.status)}
                          {activeTab === 'my-requests' && req.status === 'pending' && (
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(req.id); }}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Request Detail */}
          <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-[#0d1b2a]">Chi tiết thay đổi</h3>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              {!selectedRequestId ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <i className="fas fa-mouse-pointer mb-3 text-3xl"></i>
                  <p>Chọn một yêu cầu để xem chi tiết</p>
                </div>
              ) : loadingDetail ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1c6e8c] border-t-transparent"></div>
                </div>
              ) : selectedRequest ? (
                <div className="space-y-6">
                  {/* Request Info */}
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Bài viết</p>
                        <p className="font-semibold text-[#0d1b2a]">{selectedRequest.blogPostTitle}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Người yêu cầu</p>
                        <p className="font-semibold text-[#0d1b2a]">{selectedRequest.requesterName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Ngày gửi</p>
                        <p className="font-semibold text-[#0d1b2a]">{formatDate(selectedRequest.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Trạng thái</p>
                        {getStatusBadge(selectedRequest.status)}
                      </div>
                    </div>
                  </div>

                  {/* Changes Comparison */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-[#0d1b2a]">
                      <i className="fas fa-code-compare text-[#1c6e8c]"></i>
                      Nội dung thay đổi
                    </h4>
                    <div className="rounded-xl border border-slate-200">
                      {Object.entries(selectedRequest.proposedData || {}).map(([key, value]) => 
                        renderValueDiff(
                          FIELD_LABELS[key] || key,
                          undefined, // We don't have current values in this view - could enhance later
                          value
                        )
                      ).filter(Boolean)}
                      {Object.keys(selectedRequest.proposedData || {}).length === 0 && (
                        <p className="p-4 text-center text-slate-500">Không có thay đổi nào</p>
                      )}
                    </div>
                  </div>

                  {/* Review Note Display */}
                  {selectedRequest.reviewNote && (
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-blue-700">Ghi chú duyệt</p>
                      <p className="text-sm text-blue-800">{selectedRequest.reviewNote}</p>
                    </div>
                  )}

                  {/* Actions for my-posts tab (approve/reject) */}
                  {activeTab === 'my-posts' && selectedRequest.status === 'pending' && (
                    <div className="space-y-4 border-t border-slate-200 pt-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Ghi chú (bắt buộc khi từ chối)
                        </label>
                        <textarea
                          value={reviewNote}
                          onChange={e => setReviewNote(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                          rows={3}
                          placeholder="Nhập ghi chú cho người yêu cầu..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          <i className="fas fa-check"></i>
                          {approveMutation.isPending ? 'Đang xử lý...' : 'Duyệt & Áp dụng'}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={rejectMutation.isPending}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          <i className="fas fa-times"></i>
                          {rejectMutation.isPending ? 'Đang xử lý...' : 'Từ chối'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <i className="fas fa-exclamation-circle mb-3 text-3xl"></i>
                  <p>Không tìm thấy yêu cầu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flash Message */}
      {flash && (
        <div className={`fixed right-10 top-10 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${
          flash.type === 'success' ? 'bg-emerald-600' : flash.type === 'error' ? 'bg-red-600' : 'bg-slate-900'
        }`}>
          {flash.message}
        </div>
      )}
    </>
  );
}
