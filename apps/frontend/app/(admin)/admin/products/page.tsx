'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PaginationControls } from '@/components/admin/pagination-controls';
import { MediaListEditor, type MediaFormItem } from '@/components/admin/media-list-editor';
import { QuickMediaDialog } from '@/components/admin/quick-media-dialog';
import {
  useAdminProducts,
  useDeleteProductMutation,
  useSaveProductMutation
} from '@/hooks/admin';
import { useClientPagination } from '@/hooks/use-pagination';
import type { ProductDetail } from '@/types/content';
import { renderProductPreviewHtml } from '@/lib/legacy-preview';

type ProductStatus = 'draft' | 'active' | 'archived' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
const STATUS_OPTIONS: ProductStatus[] = ['draft', 'active', 'archived'];
const PRODUCT_PAGE_SIZE = 8;
const PRODUCT_IMAGE_TYPE_OPTIONS = [
  { value: 'inline', label: 'Chèn giữa nội dung' },
  { value: 'gallery', label: 'Thư viện cuối mô tả' },
  { value: 'hero', label: 'Ảnh hero' }
];
const PRODUCT_VIDEO_TYPE_OPTIONS = [
  { value: 'body', label: 'Video nội dung' },
  { value: 'demo', label: 'Video demo' },
  { value: 'hero', label: 'Video mở đầu' }
];
const DEFAULT_IMAGE_TYPE = PRODUCT_IMAGE_TYPE_OPTIONS[0]?.value ?? 'inline';
const DEFAULT_VIDEO_TYPE = PRODUCT_VIDEO_TYPE_OPTIONS[0]?.value ?? 'body';

type FlashMessage = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const createClientId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function createMediaItem(
  overrides: Partial<MediaFormItem> = {},
  fallbackType: string
): MediaFormItem {
  const position = typeof overrides.position === 'number' && overrides.position >= 0 ? overrides.position : '';
  return {
    id: overrides.id || createClientId(),
    url: overrides.url ?? '',
    caption: overrides.caption ?? '',
    type: overrides.type ?? fallbackType,
    position
  };
}

function ensureMediaFormItems(input: unknown, fallbackType: string): MediaFormItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const media = entry as Partial<MediaFormItem> & {
        url?: string | null;
        caption?: string | null;
        type?: string | null;
        position?: number | null;
      };
      return createMediaItem(
        {
          id: media.id || `${fallbackType}-${index}-${createClientId()}`,
          url: media.url ?? '',
          caption: media.caption ?? '',
          type: media.type ?? fallbackType,
          position: typeof media.position === 'number' ? media.position : ''
        },
        fallbackType
      );
    })
    .filter(Boolean) as MediaFormItem[];
}

function serializeMediaForSave(items: MediaFormItem[]) {
  return items
    .map(item => ({
      url: item.url.trim(),
      caption: item.caption?.trim() || undefined,
      type: item.type || undefined,
      position: typeof item.position === 'number' ? item.position : undefined
    }))
    .filter(item => Boolean(item.url));
}

function serializeMediaForPreview(items: MediaFormItem[]) {
  return items.map(item => ({
    url: item.url,
    caption: item.caption,
    type: item.type,
    position: typeof item.position === 'number' ? item.position : null,
    __clientId: item.id
  }));
}

function estimateParagraphCount(content: string) {
  if (!content?.trim()) return 0;
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean).length;
}

function getParagraphIndexAtCursor(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return 0;
  const value = textarea.value.replace(/\r\n/g, '\n');
  const cursor = textarea.selectionStart ?? value.length;
  const before = value.slice(0, cursor);
  return before
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean).length;
}

function parseMultilineList(value: string) {
  return value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

interface DemoImage {
  url: string;
  caption: string;
}

interface ProductFormState {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  featureTagsText: string;
  highlightsText: string;
  status: ProductStatus;
  ctaPrimaryLabel: string;
  ctaPrimaryUrl: string;
  ctaSecondaryLabel: string;
  ctaSecondaryUrl: string;
  demoImages: DemoImage[];
  galleryMedia: MediaFormItem[];
  videoItems: MediaFormItem[];
}

const emptyForm: ProductFormState = {
  name: '',
  slug: '',
  category: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  featureTagsText: '',
  highlightsText: '',
  status: 'draft',
  ctaPrimaryLabel: '',
  ctaPrimaryUrl: '',
  ctaSecondaryLabel: '',
  ctaSecondaryUrl: '',
  demoImages: [],
  galleryMedia: [],
  videoItems: []
};

export default function AdminProductsPage() {
  const { data, isLoading, error } = useAdminProducts();
  const saveMutation = useSaveProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(emptyForm);
  const [showEditor, setShowEditor] = useState(false);
  const [mediaDialog, setMediaDialog] = useState<{ type: 'image' | 'video' } | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [formSnapshot, setFormSnapshot] = useState(() => JSON.stringify(emptyForm));
  const [cursorParagraph, setCursorParagraph] = useState(0);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pagination = useClientPagination(data ?? [], { pageSize: PRODUCT_PAGE_SIZE });
  const visibleProducts = pagination.items;
  const serializedForm = useMemo(() => JSON.stringify(formState), [formState]);
  const isDirty = serializedForm !== formSnapshot;
  const inlinePositionHint = useMemo(() => estimateParagraphCount(formState.description), [formState.description]);

  useEffect(() => {
    if (!selectedProduct) {
      setFormState(() => ({ ...emptyForm }));
      setFormSnapshot(JSON.stringify(emptyForm));
      setCursorParagraph(0);
      return;
    }
    const nextState: ProductFormState = {
      name: selectedProduct.name,
      slug: selectedProduct.slug,
      category: selectedProduct.category ?? '',
      shortDescription: selectedProduct.shortDescription ?? '',
      description: selectedProduct.description,
      imageUrl: selectedProduct.imageUrl ?? '',
      featureTagsText: (selectedProduct.featureTags ?? []).join('\n'),
      highlightsText: (selectedProduct.highlights ?? []).join('\n'),
      status: (selectedProduct.status as ProductStatus) || 'draft',
      ctaPrimaryLabel: selectedProduct.ctaPrimary?.label ?? '',
      ctaPrimaryUrl: selectedProduct.ctaPrimary?.url ?? '',
      ctaSecondaryLabel: selectedProduct.ctaSecondary?.label ?? '',
      ctaSecondaryUrl: selectedProduct.ctaSecondary?.url ?? '',
      demoImages: (selectedProduct.demoMedia ?? []).map((m: any) => ({ url: m.url || '', caption: m.caption || '' })),
      galleryMedia: ensureMediaFormItems(selectedProduct.galleryMedia, DEFAULT_IMAGE_TYPE),
      videoItems: ensureMediaFormItems(selectedProduct.videoItems, DEFAULT_VIDEO_TYPE)
    };
    setFormState(nextState);
    setFormSnapshot(JSON.stringify(nextState));
    setCursorParagraph(estimateParagraphCount(nextState.description));
    setShowEditor(true);
  }, [selectedProduct]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = 'Bạn có thay đổi chưa lưu.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const updateCursorInfo = () => {
    setCursorParagraph(getParagraphIndexAtCursor(contentInputRef.current));
  };

  function showFlash(message: string, type: FlashMessage['type'] = 'info') {
    setFlash({ message, type });
  }

  function handleMediaDialogSubmit(payload: { url: string; caption: string }) {
    if (!mediaDialog) return;
    const position = getParagraphIndexAtCursor(contentInputRef.current);
    if (mediaDialog.type === 'image') {
      setFormState(prev => ({
        ...prev,
        galleryMedia: [
          ...prev.galleryMedia,
          createMediaItem(
            {
              url: payload.url,
              caption: payload.caption,
              type: DEFAULT_IMAGE_TYPE,
              position
            },
            DEFAULT_IMAGE_TYPE
          )
        ]
      }));
      showFlash(`Đã chèn ảnh sau đoạn ${position}`, 'success');
    } else {
      setFormState(prev => ({
        ...prev,
        videoItems: [
          ...prev.videoItems,
          createMediaItem(
            {
              url: payload.url,
              caption: payload.caption,
              type: DEFAULT_VIDEO_TYPE,
              position
            },
            DEFAULT_VIDEO_TYPE
          )
        ]
      }));
      showFlash(`Đã chèn video sau đoạn ${position}`, 'success');
    }
    setMediaDialog(null);
    updateCursorInfo();
  }

  function confirmDiscardChanges() {
    if (!showEditor || !isDirty) {
      return true;
    }
    return window.confirm('Bạn có thay đổi chưa lưu. Tiếp tục và bỏ qua các thay đổi?');
  }

  function handleSelectProduct(product: ProductDetail) {
    if (!confirmDiscardChanges()) {
      return;
    }
    setSelectedProduct(product);
  }

  const previewData = useMemo<ProductDetail>(() => {
    const featureTags = parseMultilineList(formState.featureTagsText);
    const highlights = parseMultilineList(formState.highlightsText);
    return {
      id: selectedProduct?.id,
      code: selectedProduct?.code ?? 'PROD-DEMO',
      slug: formState.slug || selectedProduct?.slug || 'san-pham-demo',
      name: formState.name || 'Sản phẩm chưa đặt tên',
      category: formState.category || selectedProduct?.category || '',
      shortDescription: formState.shortDescription || 'Mô tả ngắn sẽ hiển thị tại đây.',
      description: formState.description || 'Nội dung sản phẩm đang được biên soạn...',
      imageUrl: formState.imageUrl || selectedProduct?.imageUrl || '',
      status: formState.status,
      featureTags,
      highlights,
      demoMedia: formState.demoImages
        .filter(img => img.url.trim())
        .map(img => ({ url: img.url.trim(), caption: img.caption.trim() })),
      galleryMedia: serializeMediaForPreview(formState.galleryMedia) as any,
      videoItems: serializeMediaForPreview(formState.videoItems) as any
    } as ProductDetail;
  }, [formState, selectedProduct]);

  const previewHtml = useMemo(() => renderProductPreviewHtml(previewData), [previewData]);

  const flashClass =
    flash?.type === 'success'
      ? 'bg-emerald-600'
      : flash?.type === 'error'
      ? 'bg-red-600'
      : 'bg-slate-900';
  const flashOverlay = flash ? (
    <div className={`fixed right-10 top-10 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${flashClass}`}>
      {flash.message}
    </div>
  ) : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const featureTags = parseMultilineList(formState.featureTagsText);
    const highlights = parseMultilineList(formState.highlightsText);
    const galleryMediaPayload = serializeMediaForSave(formState.galleryMedia);
    const videoItemsPayload = serializeMediaForSave(formState.videoItems);

    const payload = {
      id: selectedProduct?.id,
      name: formState.name,
      slug: formState.slug || undefined,
      category: formState.category || undefined,
      shortDescription: formState.shortDescription || undefined,
      description: formState.description,
      imageUrl: formState.imageUrl || undefined,
      featureTags,
      highlights,
      status: formState.status,
      ctaPrimary: formState.ctaPrimaryLabel || formState.ctaPrimaryUrl ? {
        label: formState.ctaPrimaryLabel || undefined,
        url: formState.ctaPrimaryUrl || undefined
      } : undefined,
      ctaSecondary: formState.ctaSecondaryLabel || formState.ctaSecondaryUrl ? {
        label: formState.ctaSecondaryLabel || undefined,
        url: formState.ctaSecondaryUrl || undefined
      } : undefined,
      galleryMedia: galleryMediaPayload.length ? galleryMediaPayload : undefined,
      videoItems: videoItemsPayload.length ? videoItemsPayload : undefined,
      demoMedia: formState.demoImages.filter(img => img.url).map(img => ({
        url: img.url,
        caption: img.caption
      }))
    };

    try {
      await saveMutation.mutateAsync(payload);
      showFlash(selectedProduct ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm mới', 'success');
      setSelectedProduct(null);
      setFormState(() => ({ ...emptyForm }));
      setFormSnapshot(JSON.stringify(emptyForm));
      setShowEditor(false);
    } catch (error) {
      showFlash((error as Error)?.message || 'Không thể lưu sản phẩm', 'error');
    }
  }

  async function handleDelete(product: ProductDetail) {
    if (!window.confirm(`Xoá sản phẩm "${product.name}"?`)) {
      return;
    }
    if (!product.id) {
      alert('Không thể xác định ID sản phẩm để xoá.');
      return;
    }
    try {
      await deleteMutation.mutateAsync(product.id);
      showFlash('Đã xoá sản phẩm', 'success');
      const isCurrentSelection = selectedProduct
        ? (selectedProduct.id && product.id
            ? selectedProduct.id === product.id
            : selectedProduct.code === product.code)
        : false;
      if (isCurrentSelection) {
        setSelectedProduct(null);
        setFormState(() => ({ ...emptyForm }));
        setFormSnapshot(JSON.stringify(emptyForm));
        setShowEditor(false);
      }
    } catch (error) {
      showFlash((error as Error)?.message || 'Không thể xoá sản phẩm', 'error');
    }
  }

  function handleNewProduct() {
    if (!confirmDiscardChanges()) {
      return;
    }
    setSelectedProduct(null);
    setFormState(() => ({ ...emptyForm }));
    setFormSnapshot(JSON.stringify(emptyForm));
    setShowEditor(true);
  }

  function handleCancelEdit() {
    if (!confirmDiscardChanges()) {
      return;
    }
    setSelectedProduct(null);
    setFormState(() => ({ ...emptyForm }));
    setFormSnapshot(JSON.stringify(emptyForm));
    setShowEditor(false);
  }

  function addDemoImage() {
    if (formState.demoImages.length >= 9) return;
    setFormState(prev => ({
      ...prev,
      demoImages: [...prev.demoImages, { url: '', caption: '' }]
    }));
  }

  function updateDemoImage(index: number, field: 'url' | 'caption', value: string) {
    setFormState(prev => ({
      ...prev,
      demoImages: prev.demoImages.map((img, i) => i === index ? { ...img, [field]: value } : img)
    }));
  }

  function removeDemoImage(index: number) {
    setFormState(prev => ({
      ...prev,
      demoImages: prev.demoImages.filter((_, i) => i !== index)
    }));
  }

  // Full-screen Editor View
  if (showEditor) {
    return (
      <>
        <div className="grid h-[calc(100vh-200px)] min-h-[600px] grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
          {/* Left: Editor Input */}
          <div className="flex flex-col overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}>
              <h2 className="text-lg font-semibold">{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                  onClick={() => setMediaDialog({ type: 'image' })}
                >
                  <i className="fas fa-image"></i>
                  <span>Chèn ảnh</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                  onClick={() => setMediaDialog({ type: 'video' })}
                >
                  <i className="fas fa-video"></i>
                  <span>Chèn video</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form id="productForm" onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
              {/* Metadata Section */}
            <div className="space-y-4 border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Tên sản phẩm</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={formState.name}
                  onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên sản phẩm..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Mô tả ngắn</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={formState.shortDescription}
                  onChange={e => setFormState(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Mô tả ngắn gọn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Danh mục</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.category}
                    onChange={e => setFormState(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="VD: Automation"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">URL ảnh đại diện</label>
                  <input
                    type="url"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.imageUrl}
                    onChange={e => setFormState(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Feature Tags (mỗi dòng 1 tag)</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  rows={2}
                  value={formState.featureTagsText}
                  onChange={e => setFormState(prev => ({ ...prev, featureTagsText: e.target.value }))}
                  placeholder="IoT&#10;Cloud&#10;AI"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Highlights (mỗi dòng 1 highlight)</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  rows={2}
                  value={formState.highlightsText}
                  onChange={e => setFormState(prev => ({ ...prev, highlightsText: e.target.value }))}
                  placeholder="Tính năng nổi bật 1&#10;Tính năng nổi bật 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">CTA Chính Label</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.ctaPrimaryLabel}
                    onChange={e => setFormState(prev => ({ ...prev, ctaPrimaryLabel: e.target.value }))}
                    placeholder="VD: Đặt lịch demo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Link CTA Chính</label>
                  <input
                    type="url"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.ctaPrimaryUrl}
                    onChange={e => setFormState(prev => ({ ...prev, ctaPrimaryUrl: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </div>

              {/* Demo Images Section */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-[#0f172a]">Combo ảnh demo</label>
                  <p className="mt-1 text-xs text-slate-500">Tối đa 9 ảnh. Chỉ dán URL ảnh đã được host công khai.</p>
                </div>
                <div className="space-y-3">
                  {formState.demoImages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                      Chưa có ảnh demo. Nhấn "Thêm ảnh demo" để bắt đầu.
                    </div>
                  ) : (
                    formState.demoImages.map((img, index) => (
                      <div key={index} className="grid grid-cols-[140px_1fr_auto] gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white">
                          {img.url ? (
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <i className="fas fa-image text-2xl text-slate-300"></i>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={img.url}
                            onChange={e => updateDemoImage(index, 'url', e.target.value)}
                            placeholder="URL ảnh demo"
                          />
                          <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={img.caption}
                            onChange={e => updateDemoImage(index, 'caption', e.target.value)}
                            placeholder="Mô tả ảnh (tuỳ chọn)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDemoImage(index)}
                          className="text-slate-400 transition-colors hover:text-red-500"
                        >
                          <i className="fas fa-times text-lg"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={addDemoImage}
                  disabled={formState.demoImages.length >= 9}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-plus"></i>
                  <span>Thêm ảnh demo</span>
                </button>
              </div>
            </div>

              {/* Content Editor */}
              <div className="flex flex-1 flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold text-[#0f172a]">Mô tả chi tiết sản phẩm</label>
                  <span className="flex items-center gap-1 text-xs italic text-slate-500">
                    <i className="fas fa-info-circle"></i>
                    Đặt con trỏ ở đoạn muốn chèn ảnh/video
                  </span>
                </div>
                <textarea
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-sans text-base leading-relaxed transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  ref={contentInputRef}
                  value={formState.description}
                  onChange={e => {
                    const value = e.target.value;
                    setFormState(prev => ({ ...prev, description: value }));
                    updateCursorInfo();
                  }}
                  onClick={updateCursorInfo}
                  onKeyUp={updateCursorInfo}
                  onMouseUp={updateCursorInfo}
                  onSelect={updateCursorInfo}
                  placeholder="Viết mô tả chi tiết về sản phẩm tại đây...

Mỗi đoạn văn cách nhau bởi 1 dòng trống.

Đặt con trỏ vào giữa các đoạn để chèn ảnh/video."
                required
                />
              </div>

              <div className="space-y-6 border-t border-slate-200 pt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <MediaListEditor
                    title="Hình ảnh & thư viện"
                    description="Điền vị trí để chèn trực tiếp giữa mô tả. Để trống = thư viện cuối bài."
                    items={formState.galleryMedia}
                    onChange={items => setFormState(prev => ({ ...prev, galleryMedia: items }))}
                    addLabel="Thêm ảnh"
                    typeOptions={PRODUCT_IMAGE_TYPE_OPTIONS}
                    nextPositionHint={inlinePositionHint}
                  />
                  <MediaListEditor
                    title="Video minh hoạ"
                    description="Hỗ trợ link YouTube, Vimeo hoặc file mp4. Điền vị trí để chèn inline."
                    items={formState.videoItems}
                    onChange={items => setFormState(prev => ({ ...prev, videoItems: items }))}
                    addLabel="Thêm video"
                    typeOptions={PRODUCT_VIDEO_TYPE_OPTIONS}
                    nextPositionHint={inlinePositionHint}
                  />
                </div>
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
                  onChange={e => setFormState(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  form="productForm"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #2e8b57, #3aa76d)' }}
                >
                  <i className="fas fa-save"></i>
                  <span>{saveMutation.isPending ? 'Đang lưu...' : selectedProduct ? 'Cập nhật' : 'Lưu sản phẩm'}</span>
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
              {formState.name || formState.description ? (
                <div
                  className="legacy-preview space-y-4"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <i className="fas fa-box-open mb-4 text-5xl"></i>
                  <p>Bắt đầu nhập thông tin sản phẩm để xem preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <QuickMediaDialog
          open={Boolean(mediaDialog)}
          type={mediaDialog?.type ?? 'image'}
          positionHint={cursorParagraph}
          onClose={() => setMediaDialog(null)}
          onSubmit={handleMediaDialogSubmit}
        />
        {flashOverlay}
      </>
    );
  }

  // Product List View
  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-6">
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Quản lý sản phẩm</h2>
          <p className="mt-1 text-slate-500">Xây dựng thông tin sản phẩm một cách nhất quán.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#124e66]/10 px-4 py-2 text-sm font-semibold text-[#1c6e8c]">
            {pagination.totalItems} sản phẩm
          </span>
          <button
            onClick={handleNewProduct}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}
          >
            <i className="fas fa-box"></i>
            <span>Thêm sản phẩm</span>
          </button>
        </div>
        </div>

        {/* Error State */}/}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">Không thể tải danh sách sản phẩm.</p>
          </div>
        ) : null}

        {/* Table */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#124e66]/[0.08]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Mã</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Tên</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Danh mục</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Trạng thái</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1c6e8c] border-t-transparent"></div>
                      <span>Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : pagination.totalItems === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Chưa có sản phẩm nào. Nhấn &quot;Thêm sản phẩm&quot; để bắt đầu.
                  </td>
                </tr>
              ) : (
                visibleProducts.map((product) => (
                  <tr key={product.id ?? product.code} className="border-t border-slate-100 transition-colors hover:bg-[#124e66]/[0.02]">
                    <td className="px-5 py-4 text-sm text-slate-600">{product.code}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0d1b2a]">{product.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{product.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        product.status === 'active' || product.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : product.status === 'archived' || product.status === 'ARCHIVED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.status === 'active' || product.status === 'PUBLISHED' ? 'Live' : product.status === 'archived' || product.status === 'ARCHIVED' ? 'Ẩn' : 'Nháp'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                        >
                          <i className="fas fa-edit"></i>
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
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
      {flashOverlay}
    </>
  );
}
