'use client';

import { useState } from 'react';
import { usePendingComments, useApproveCommentMutation, useRejectCommentMutation, useDeleteCommentMutation } from '@/hooks/admin';

export default function AdminCommentsPage() {
  const { data: comments = [], isLoading, error: fetchError, refetch } = usePendingComments();
  const approveCommentMutation = useApproveCommentMutation();
  const rejectCommentMutation = useRejectCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleApprove = async (commentId: string) => {
    try {
      setError('');
      await approveCommentMutation.mutateAsync(commentId);
      setSuccessMsg('Đã duyệt bình luận');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Không thể duyệt bình luận');
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      setError('');
      await rejectCommentMutation.mutateAsync(commentId);
      setSuccessMsg('Đã từ chối bình luận');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Không thể từ chối bình luận');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      setError('');
      await deleteCommentMutation.mutateAsync(commentId);
      setSuccessMsg('Đã xóa bình luận');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Không thể xóa bình luận');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý bình luận</h1>
        <p className="text-sm text-slate-500 mt-1">Duyệt và quản lý bình luận từ người dùng</p>
      </div>

      {(error || fetchError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error || 'Không thể tải danh sách bình luận'}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <i className="fas fa-check-circle" /> {successMsg}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <i className="fas fa-clock" /> Chờ duyệt ({comments.length})
        </div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-sync-alt" /> Làm mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <i className="fas fa-spinner fa-spin text-3xl mb-4" />
          <p>Đang tải...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <i className="far fa-comment-dots text-5xl mb-4" />
          <p>Không có bình luận nào cần duyệt</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Người gửi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nội dung</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Blog ID</th>
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
                    <div className="max-w-[300px] text-sm text-slate-600 break-words">
                      {comment.content}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{comment.blogPostId}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(comment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
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
    </div>
  );
}
