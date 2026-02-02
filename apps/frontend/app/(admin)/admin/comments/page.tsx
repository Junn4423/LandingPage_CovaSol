'use client';

import { useState } from 'react';
import { 
  useAllComments, 
  useCommentStats,
  useApproveCommentMutation, 
  useRejectCommentMutation, 
  useDeleteCommentMutation,
  useUpdateCommentMutation
} from '@/hooks/admin';
import type { AdminComment } from '@/lib/admin-api';

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminCommentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingComment, setEditingComment] = useState<AdminComment | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', content: '' });
  
  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  
  const { data: statsData } = useCommentStats();
  const { data: commentsData, isLoading, refetch } = useAllComments({
    page,
    pageSize: 15,
    status: statusFilter,
    search: search || undefined
  });
  
  const approveCommentMutation = useApproveCommentMutation();
  const rejectCommentMutation = useRejectCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  const updateCommentMutation = useUpdateCommentMutation();
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleApprove = async (commentId: string) => {
    try {
      setError('');
      await approveCommentMutation.mutateAsync(commentId);
      showSuccess('Đã duyệt bình luận');
    } catch (err) {
      setError('Không thể duyệt bình luận');
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      setError('');
      await rejectCommentMutation.mutateAsync(commentId);
      showSuccess('Đã từ chối bình luận');
    } catch (err) {
      setError('Không thể từ chối bình luận');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      setError('');
      await deleteCommentMutation.mutateAsync(commentId);
      showSuccess('Đã xóa bình luận');
    } catch (err) {
      setError('Không thể xóa bình luận');
    }
  };

  const handleEdit = (comment: AdminComment) => {
    setEditingComment(comment);
    setEditForm({
      name: comment.name,
      email: comment.email || '',
      content: comment.content
    });
  };

  const handleSaveEdit = async () => {
    if (!editingComment) return;
    
    try {
      setError('');
      await updateCommentMutation.mutateAsync({
        id: editingComment.id,
        data: {
          name: editForm.name,
          email: editForm.email || null,
          content: editForm.content
        }
      });
      showSuccess('Đã cập nhật bình luận');
      setEditingComment(null);
    } catch (err) {
      setError('Không thể cập nhật bình luận');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Chờ duyệt</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Đã duyệt</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Từ chối</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const comments = commentsData?.comments || [];
  const pagination = commentsData?.pagination;
  const stats = statsData;

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả', count: stats?.totalComments },
    { key: 'pending', label: 'Chờ duyệt', count: stats?.pendingCount },
    { key: 'approved', label: 'Đã duyệt', count: stats?.approvedCount },
    { key: 'rejected', label: 'Từ chối', count: stats?.rejectedCount }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý bình luận</h1>
            <p className="text-sm text-slate-500 mt-1">Duyệt, chỉnh sửa và quản lý bình luận từ người dùng</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <i className="fas fa-sync-alt" /> Làm mới
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-comments text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalComments}</p>
                  <p className="text-xs text-slate-500">Tổng bình luận</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-clock text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
                  <p className="text-xs text-slate-500">Chờ duyệt</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <i className="fas fa-check text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
                  <p className="text-xs text-slate-500">Đã duyệt</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <i className="fas fa-times text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
                  <p className="text-xs text-slate-500">Từ chối</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <i className="fas fa-exclamation-circle" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <i className="fas fa-check-circle" /> {successMsg}
          </div>
        )}

        {/* Tabs & Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
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
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124e66]/20 focus:border-[#124e66]"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Comments Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <i className="fas fa-spinner fa-spin text-3xl mb-4" />
            <p>Đang tải...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <i className="far fa-comment-dots text-5xl mb-4" />
            <p>Không có bình luận nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Người gửi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nội dung</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Bài viết</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày gửi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comments.map(comment => (
                  <tr key={comment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600">{comment.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-slate-800">{comment.name}</div>
                        {comment.email && (
                          <div className="text-xs text-slate-500">{comment.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[250px] text-sm text-slate-600 break-words line-clamp-2">
                        {comment.content}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {comment.blogTitle ? (
                        <a 
                          href={`/blog/${comment.blogSlug}`} 
                          target="_blank"
                          className="text-sm text-[#124e66] hover:underline line-clamp-1 max-w-[150px]"
                        >
                          {comment.blogTitle}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">ID: {comment.blogPostId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(comment.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(comment.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {comment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(comment.id)}
                              disabled={approveCommentMutation.isPending}
                              title="Duyệt"
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <i className="fas fa-check" />
                            </button>
                            <button
                              onClick={() => handleReject(comment.id)}
                              disabled={rejectCommentMutation.isPending}
                              title="Từ chối"
                              className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <i className="fas fa-times" />
                            </button>
                          </>
                        )}
                        {comment.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(comment.id)}
                            disabled={approveCommentMutation.isPending}
                            title="Duyệt lại"
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <i className="fas fa-check" />
                          </button>
                        )}
                        {comment.status === 'approved' && (
                          <button
                            onClick={() => handleReject(comment.id)}
                            disabled={rejectCommentMutation.isPending}
                            title="Từ chối"
                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <i className="fas fa-times" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(comment)}
                          title="Sửa"
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          title="Xóa"
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total} bình luận
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left mr-1" /> Trước
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau <i className="fas fa-chevron-right ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingComment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa bình luận</h2>
                <p className="text-sm text-slate-500 mt-1">ID: {editingComment.id}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên người gửi</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124e66]/20 focus:border-[#124e66]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124e66]/20 focus:border-[#124e66]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                  <textarea
                    rows={4}
                    value={editForm.content}
                    onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124e66]/20 focus:border-[#124e66] resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setEditingComment(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateCommentMutation.isPending}
                  className="px-4 py-2 bg-[#124e66] text-white rounded-lg font-medium hover:bg-[#0d3a4d] transition-colors disabled:opacity-50"
                >
                  {updateCommentMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
