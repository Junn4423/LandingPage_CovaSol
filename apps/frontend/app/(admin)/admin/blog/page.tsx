'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  useAdminBlogPosts,
  useDeleteBlogPostMutation,
  useSaveBlogPostMutation
} from '@/hooks/admin';
import type { BlogPostDetail, BlogStatus } from '@/types/content';

const STATUS_OPTIONS: BlogStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tagsText: string;
  heroImage: string;
  status: BlogStatus;
  publishedAt: string;
}

const emptyForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  tagsText: '',
  heroImage: '',
  status: 'DRAFT',
  publishedAt: ''
};

function toDateInputValue(timestamp?: string | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function AdminBlogPage() {
  const { data, isLoading, error } = useAdminBlogPosts();
  const saveMutation = useSaveBlogPostMutation();
  const deleteMutation = useDeleteBlogPostMutation();
  const [selectedPost, setSelectedPost] = useState<BlogPostDetail | null>(null);
  const [formState, setFormState] = useState<BlogFormState>(emptyForm);

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
      tagsText: selectedPost.tags.join(', '),
      heroImage: selectedPost.heroImage ?? '',
      status: selectedPost.status,
      publishedAt: toDateInputValue(selectedPost.publishedAt)
    });
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
      heroImage: formState.heroImage || null,
      status: formState.status,
      publishedAt: formState.publishedAt ? new Date(formState.publishedAt).toISOString() : null
    };

    await saveMutation.mutateAsync(payload);
    setSelectedPost(null);
    setFormState(emptyForm);
  }

  async function handleDelete(post: BlogPostDetail) {
    if (!window.confirm(`Xoá bài viết "${post.title}"?`)) {
      return;
    }
    await deleteMutation.mutateAsync(post.id);
    if (selectedPost?.id === post.id) {
      setSelectedPost(null);
      setFormState(emptyForm);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Blog Editor</h1>
        <p className="text-sm text-slate-500">CRUD realtime đang kết nối trực tiếp Prisma Service.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Danh sách bài viết ({data?.length ?? 0})</p>
          {isLoading ? <p className="text-xs text-slate-500">Đang tải...</p> : null}
        </div>
        {error ? <p className="text-sm text-red-600">Không thể tải danh sách bài viết.</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Tiêu đề</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Xuất bản</th>
                <th className="px-3 py-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map(post => (
                <tr key={post.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{post.title}</p>
                    <p className="text-xs text-slate-500">{post.slug}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{post.status}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-white"
                        onClick={() => setSelectedPost(post)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleDelete(post)}
                        disabled={deleteMutation.isPending}
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{selectedPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</p>
            <p className="text-xs text-slate-500">Form này đồng bộ với API `/v1/admin/blog`.</p>
          </div>
          {selectedPost ? (
            <button
              className="text-xs font-semibold text-brand-primary"
              onClick={() => {
                setSelectedPost(null);
                setFormState(emptyForm);
              }}
            >
              + Tạo bài viết mới
            </button>
          ) : null}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Tiêu đề
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.title}
              onChange={event => setFormState(prev => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Slug (tuỳ chọn)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.slug}
              onChange={event => setFormState(prev => ({ ...prev, slug: event.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Tóm tắt
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.excerpt}
              onChange={event => setFormState(prev => ({ ...prev, excerpt: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Nội dung
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={6}
              value={formState.content}
              onChange={event => setFormState(prev => ({ ...prev, content: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tags (phân cách bằng dấu phẩy)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.tagsText}
              onChange={event => setFormState(prev => ({ ...prev, tagsText: event.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Ảnh hero (URL)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.heroImage}
              onChange={event => setFormState(prev => ({ ...prev, heroImage: event.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Trạng thái
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.status}
              onChange={event => setFormState(prev => ({ ...prev, status: event.target.value as BlogStatus }))}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Ngày xuất bản
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.publishedAt}
              onChange={event => setFormState(prev => ({ ...prev, publishedAt: event.target.value }))}
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Đang lưu...' : selectedPost ? 'Cập nhật' : 'Tạo bài viết'}
            </button>
            {saveMutation.isError ? (
              <p className="text-sm text-red-600">Không thể lưu bài viết.</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
