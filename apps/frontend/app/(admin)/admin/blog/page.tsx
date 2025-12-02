'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PaginationControls } from '@/components/admin/pagination-controls';
import {
  useAdminBlogPosts,
  useDeleteBlogPostMutation,
  useSaveBlogPostMutation
} from '@/hooks/admin';
import { useClientPagination } from '@/hooks/use-pagination';
import type { BlogPostDetail } from '@/types/content';

type BlogStatus = 'draft' | 'published' | 'archived' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
const STATUS_OPTIONS: BlogStatus[] = ['draft', 'published', 'archived'];
const BLOG_PAGE_SIZE = 8;

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tagsText: string;
  heroImage: string;
  status: BlogStatus;
  publishedAt: string;
  isFeatured: boolean;
  authorName: string;
  authorRole: string;
}

const emptyForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  tagsText: '',
  heroImage: '',
  status: 'draft',
  publishedAt: '',
  isFeatured: false,
  authorName: '',
  authorRole: ''
};

function toDateInputValue(timestamp?: string | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AdminBlogPage() {
  const { data, isLoading, error } = useAdminBlogPosts();
  const saveMutation = useSaveBlogPostMutation();
  const deleteMutation = useDeleteBlogPostMutation();
  const [selectedPost, setSelectedPost] = useState<BlogPostDetail | null>(null);
  const [formState, setFormState] = useState<BlogFormState>(emptyForm);
  const [showEditor, setShowEditor] = useState(false);
  const pagination = useClientPagination(data ?? [], { pageSize: BLOG_PAGE_SIZE });
  const visiblePosts = pagination.items;

  const excerptWordCount = countWords(formState.excerpt);

  useEffect(() => {
    if (!selectedPost) {
      setFormState(emptyForm);
      return;
    }
    setFormState({
      title: selectedPost.title,
      slug: selectedPost.slug,
      excerpt: selectedPost.excerpt,
      content: selectedPost.content,
      tagsText: (selectedPost.tags ?? []).join(', '),
      heroImage: selectedPost.heroImage ?? selectedPost.imageUrl ?? '',
      status: (selectedPost.status as BlogStatus) || 'draft',
      publishedAt: toDateInputValue(selectedPost.publishedAt),
      isFeatured: selectedPost.isFeatured ?? false,
      authorName: selectedPost.authorName ?? '',
      authorRole: selectedPost.authorRole ?? ''
    });
    setShowEditor(true);
  }, [selectedPost]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      id: selectedPost?.id,
      title: formState.title,
      slug: formState.slug || undefined,
      excerpt: formState.excerpt,
      content: formState.content,
      tags: formState.tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      imageUrl: formState.heroImage || null,
      status: formState.status,
      publishedAt: formState.publishedAt ? new Date(formState.publishedAt).toISOString() : null,
      isFeatured: formState.isFeatured,
      authorName: formState.authorName || undefined,
      authorRole: formState.authorRole || undefined
    };

    await saveMutation.mutateAsync(payload);
    setSelectedPost(null);
    setFormState(emptyForm);
    setShowEditor(false);
  }

  async function handleDelete(post: BlogPostDetail) {
    if (!window.confirm(`Xoá bài viết "${post.title}"?`)) {
      return;
    }
    if (!post.id) {
      alert('Không thể xác định ID bài viết để xoá.');
      return;
    }
    await deleteMutation.mutateAsync(post.id);
      const isCurrentSelection = selectedPost
        ? (selectedPost.id && post.id
            ? selectedPost.id === post.id
            : selectedPost.code === post.code)
        : false;
      if (isCurrentSelection) {
      setSelectedPost(null);
      setFormState(emptyForm);
      setShowEditor(false);
    }
  }

  function handleNewPost() {
    setSelectedPost(null);
    setFormState(emptyForm);
    setShowEditor(true);
  }

  function handleCancelEdit() {
    setSelectedPost(null);
    setFormState(emptyForm);
    setShowEditor(false);
  }

  // Full-screen Editor View
  if (showEditor) {
    return (
      <div className="grid h-[calc(100vh-200px)] min-h-[600px] grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        {/* Left: Editor Input */}
        <div className="flex flex-col overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}>
            <h2 className="text-lg font-semibold">{selectedPost ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                onClick={() => {/* Insert image logic */}}
              >
                <i className="fas fa-image"></i>
                <span>Chèn ảnh</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                onClick={() => {/* Insert video logic */}}
              >
                <i className="fas fa-video"></i>
                <span>Chèn video</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form id="blogForm" onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
            {/* Metadata Section */}
            <div className="space-y-4 border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Tiêu đề</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={formState.title}
                  onChange={e => setFormState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Phụ đề</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={formState.slug}
                  onChange={e => setFormState(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Mô tả ngắn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Danh mục</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.tagsText.split(',')[0] || ''}
                    onChange={e => setFormState(prev => ({ ...prev, tagsText: e.target.value + (prev.tagsText.includes(',') ? ', ' + prev.tagsText.split(',').slice(1).join(',') : '') }))}
                    placeholder="VD: Chuyển đổi số"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">URL ảnh bìa</label>
                  <input
                    type="url"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.heroImage}
                    onChange={e => setFormState(prev => ({ ...prev, heroImage: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                  Mô tả tóm tắt
                  <span className={`font-normal italic ${excerptWordCount > 60 ? 'text-red-500' : 'text-slate-500'}`}>
                    ({excerptWordCount}/60 từ)
                  </span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  rows={2}
                  value={formState.excerpt}
                  onChange={e => setFormState(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Đoạn mở đầu xuất hiện trong danh sách..."
                  required
                />
                <p className="text-xs text-slate-500">Giới hạn 60 từ để tối ưu SEO và hiển thị</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Tags</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.tagsText}
                    onChange={e => setFormState(prev => ({ ...prev, tagsText: e.target.value }))}
                    placeholder="VD: IoT, AI (phân cách bằng dấu phẩy)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Tác giả</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.authorName}
                    onChange={e => setFormState(prev => ({ ...prev, authorName: e.target.value }))}
                    placeholder="Tên tác giả"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Chức danh</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.authorRole}
                    onChange={e => setFormState(prev => ({ ...prev, authorRole: e.target.value }))}
                    placeholder="VD: Biên tập viên"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formState.isFeatured}
                    onChange={e => setFormState(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-[#1c6e8c] focus:ring-[#1c6e8c]"
                  />
                  <span className="text-sm font-medium text-[#0f172a]">Đánh dấu bài viết này là nổi bật</span>
                </label>
              </div>
              <p className="text-xs italic text-slate-500">Chỉ 1 bài viết được gắn nổi bật. Thao tác này sẽ thay thế bài cũ.</p>
            </div>

            {/* Content Editor */}
            <div className="flex flex-1 flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-[#0f172a]">Nội dung bài viết</label>
                <span className="flex items-center gap-1 text-xs italic text-slate-500">
                  <i className="fas fa-info-circle"></i>
                  Đặt con trỏ ở đoạn muốn chèn ảnh/video
                </span>
              </div>
              <textarea
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-sans text-base leading-relaxed transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                value={formState.content}
                onChange={e => setFormState(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Viết nội dung bài viết tại đây...

Mỗi đoạn văn cách nhau bởi 1 dòng trống.

Đặt con trỏ vào giữa các đoạn để chèn ảnh/video."
                required
              />
            </div>
          </form>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Quay lại</span>
            </button>
            <div className="flex items-center gap-3">
              <select
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium"
                value={formState.status}
                onChange={e => setFormState(prev => ({ ...prev, status: e.target.value as BlogStatus }))}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button
                type="submit"
                form="blogForm"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #2e8b57, #3aa76d)' }}
              >
                <i className="fas fa-save"></i>
                <span>{saveMutation.isPending ? 'Đang lưu...' : selectedPost ? 'Cập nhật' : 'Lưu bài viết'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col overflow-hidden bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-[#0d1b2a]">
              <i className="fas fa-eye text-[#1c6e8c]"></i>
              Preview trực tiếp
            </h3>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Real-time</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            {formState.title || formState.content ? (
              <article className="prose prose-slate max-w-none">
                {formState.heroImage && (
                  <img
                    src={formState.heroImage}
                    alt={formState.title}
                    className="mb-6 aspect-video w-full rounded-2xl object-cover"
                  />
                )}
                <h1 className="text-3xl font-bold text-[#0d1b2a]">{formState.title || 'Tiêu đề bài viết'}</h1>
                {formState.excerpt && (
                  <p className="text-lg text-slate-600">{formState.excerpt}</p>
                )}
                <div className="mt-6 whitespace-pre-wrap text-slate-700">
                  {formState.content || 'Nội dung bài viết sẽ hiển thị ở đây...'}
                </div>
              </article>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <i className="fas fa-pen-to-square mb-4 text-5xl"></i>
                <p>Bắt đầu nhập nội dung để xem preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Blog List View
  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Quản lý blog</h2>
          <p className="mt-1 text-slate-500">Theo dõi, chỉnh sửa và tổ chức bài viết.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#124e66]/10 px-4 py-2 text-sm font-semibold text-[#1c6e8c]">
            {pagination.totalItems} bài viết
          </span>
          <button
            onClick={handleNewPost}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}
          >
            <i className="fas fa-pen-to-square"></i>
            <span>Soạn bài viết</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải danh sách bài viết.</p>
        </div>
      ) : null}

      {/* Table */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#124e66]/[0.08]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Mã</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Tiêu đề</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Danh mục</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Ngày xuất bản</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Nổi bật</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Trạng thái</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1c6e8c] border-t-transparent"></div>
                      <span>Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : pagination.totalItems === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    Chưa có bài viết nào. Nhấn "Soạn bài viết" để bắt đầu.
                  </td>
                </tr>
              ) : (
                visiblePosts.map((post) => (
                  <tr key={post.id ?? post.code} className="border-t border-slate-100 transition-colors hover:bg-[#124e66]/[0.02]">
                    <td className="px-5 py-4 text-sm text-slate-600">{post.code}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0d1b2a]">{post.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{post.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{post.category || (post.tags ?? [])[0] || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-lg ${post.isFeatured ? 'text-yellow-500' : 'text-slate-300'}`}>
                        {post.isFeatured ? '★' : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          post.status === 'published' || post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : post.status === 'archived' || post.status === 'ARCHIVED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {post.status === 'published' || post.status === 'PUBLISHED' ? 'Live' : post.status === 'archived' || post.status === 'ARCHIVED' ? 'Ẩn' : 'Nháp'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                        >
                          <i className="fas fa-edit"></i>
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-50 disabled:opacity-50"
                        >
                          <i className="fas fa-trash"></i>
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          className="border-t border-slate-100 bg-white px-5 py-3"
        />
      </div>
    </div>
  );
}
