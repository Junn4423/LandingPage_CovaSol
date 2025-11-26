'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  useAdminProducts,
  useDeleteProductMutation,
  useSaveProductMutation
} from '@/hooks/admin';
import type { ProductDetail, ProductStatus } from '@/types/content';

const STATUS_OPTIONS: ProductStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

interface ProductFormState {
  name: string;
  slug: string;
  category: string;
  headline: string;
  summary: string;
  description: string;
  thumbnail: string;
  featuresText: string;
  metricsText: string;
  status: ProductStatus;
  publishedAt: string;
}

const emptyForm: ProductFormState = {
  name: '',
  slug: '',
  category: '',
  headline: '',
  summary: '',
  description: '',
  thumbnail: '',
  featuresText: '',
  metricsText: '',
  status: 'DRAFT',
  publishedAt: ''
};

function toDateInputValue(timestamp?: string | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function AdminProductsPage() {
  const { data, isLoading, error } = useAdminProducts();
  const saveMutation = useSaveProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(emptyForm);

  useEffect(() => {
    if (!selectedProduct) {
      setFormState(emptyForm);
      return;
    }
    setFormState({
      name: selectedProduct.name,
      slug: selectedProduct.slug,
      category: selectedProduct.category,
      headline: selectedProduct.headline,
      summary: selectedProduct.summary,
      description: selectedProduct.description,
      thumbnail: selectedProduct.thumbnail ?? '',
      featuresText: selectedProduct.features.join('\n'),
      metricsText:
        selectedProduct.metrics?.map(metric => `${metric.label}|${metric.value}`).join('\n') ?? '',
      status: selectedProduct.status,
      publishedAt: toDateInputValue(selectedProduct.publishedAt)
    });
  }, [selectedProduct]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const features = formState.featuresText
      .split('\n')
      .map(feature => feature.trim())
      .filter(Boolean);
    const metrics = formState.metricsText
      .split('\n')
      .map(row => row.trim())
      .filter(Boolean)
      .map(entry => {
        const [label, value] = entry.split('|').map(part => part.trim());
        if (!label || !value) {
          return null;
        }
        return { label, value };
      })
      .filter((metric): metric is { label: string; value: string } => Boolean(metric));

    const payload = {
      id: selectedProduct?.id,
      name: formState.name,
      slug: formState.slug || undefined,
      category: formState.category,
      headline: formState.headline,
      summary: formState.summary,
      description: formState.description,
      thumbnail: formState.thumbnail || undefined,
      features,
      metrics,
      status: formState.status,
      publishedAt: formState.publishedAt ? new Date(formState.publishedAt).toISOString() : null
    };

    await saveMutation.mutateAsync(payload);
    setSelectedProduct(null);
    setFormState(emptyForm);
  }

  async function handleDelete(product: ProductDetail) {
    if (!window.confirm(`Xoá sản phẩm "${product.name}"?`)) {
      return;
    }
    await deleteMutation.mutateAsync(product.id);
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null);
      setFormState(emptyForm);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Product Editor</h1>
        <p className="text-sm text-slate-500">Quản lý danh mục sản phẩm và lộ trình triển khai.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Danh sách sản phẩm ({data?.length ?? 0})</p>
          {isLoading ? <p className="text-xs text-slate-500">Đang tải...</p> : null}
        </div>
        {error ? <p className="text-sm text-red-600">Không thể tải danh sách sản phẩm.</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Tên sản phẩm</th>
                <th className="px-3 py-2">Danh mục</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Xuất bản</th>
                <th className="px-3 py-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map(product => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.slug}</p>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600">{product.category}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{product.status}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-500">{product.publishedAt ? new Date(product.publishedAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-white"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleDelete(product)}
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
            <p className="text-sm font-semibold text-slate-900">{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</p>
            <p className="text-xs text-slate-500">Kết nối trực tiếp API `/v1/admin/products`.</p>
          </div>
          {selectedProduct ? (
            <button
              className="text-xs font-semibold text-brand-primary"
              onClick={() => {
                setSelectedProduct(null);
                setFormState(emptyForm);
              }}
            >
              + Tạo sản phẩm mới
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Tên sản phẩm
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.name}
              onChange={event => setFormState(prev => ({ ...prev, name: event.target.value }))}
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
          <label className="text-sm font-medium text-slate-700">
            Danh mục
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.category}
              onChange={event => setFormState(prev => ({ ...prev, category: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Thumbnail (URL)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.thumbnail}
              onChange={event => setFormState(prev => ({ ...prev, thumbnail: event.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Headline
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.headline}
              onChange={event => setFormState(prev => ({ ...prev, headline: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Tóm tắt
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.summary}
              onChange={event => setFormState(prev => ({ ...prev, summary: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Mô tả chi tiết
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={5}
              value={formState.description}
              onChange={event => setFormState(prev => ({ ...prev, description: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tính năng (mỗi dòng một mục)
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.featuresText}
              onChange={event => setFormState(prev => ({ ...prev, featuresText: event.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Metrics (định dạng Label|Value)
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.metricsText}
              onChange={event => setFormState(prev => ({ ...prev, metricsText: event.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Trạng thái
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={formState.status}
              onChange={event => setFormState(prev => ({ ...prev, status: event.target.value as ProductStatus }))}
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
              {saveMutation.isPending ? 'Đang lưu...' : selectedProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
            {saveMutation.isError ? (
              <p className="text-sm text-red-600">Không thể lưu sản phẩm.</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
