'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PaginationControls } from '@/components/admin/pagination-controls';
import { MediaListEditor, type MediaFormItem } from '@/components/admin/media-list-editor';
import { SourceLinksEditor, type SourceLinkItem } from '@/components/admin/source-links-editor';
import { QuickMediaDialog } from '@/components/admin/quick-media-dialog';
import { QuickSourceDialog } from '@/components/admin/quick-source-dialog';
import { ImageSelector } from '@/components/admin/image-selector';
import { AlbumPickerModal } from '@/components/admin/album-picker-modal';
import {
  useAdminBlogPosts,
  useDeleteBlogPostMutation,
  useSaveBlogPostMutation,
  useUploadMediaMutation
} from '@/hooks/admin';
import { useClientPagination } from '@/hooks/use-pagination';
import type { BlogPostDetail } from '@/types/content';
import { renderBlogPreviewHtml } from '@/lib/legacy-preview';

type BlogStatus = 'draft' | 'published' | 'archived' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
const STATUS_OPTIONS: BlogStatus[] = ['draft', 'published', 'archived'];
const BLOG_PAGE_SIZE = 8;

interface BlogFormState {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  tagsText: string;
  keywordsText: string;
  imageUrl: string;
  status: BlogStatus;
  publishedAt: string;
  isFeatured: boolean;
  authorName: string;
  authorRole: string;
  galleryMedia: MediaFormItem[];
  videoItems: MediaFormItem[];
  sourceLinks: SourceLinkItem[];
}

type FlashMessage = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const IMAGE_TYPE_OPTIONS = [
  { value: 'inline', label: 'Chèn trong nội dung' },
  { value: 'gallery', label: 'Thư viện cuối bài' },
  { value: 'cover', label: 'Ảnh bìa' }
];

const VIDEO_TYPE_OPTIONS = [
  { value: 'body', label: 'Video nội dung' },
  { value: 'demo', label: 'Video demo' },
  { value: 'hero', label: 'Video mở đầu' },
  { value: 'interview', label: 'Video phỏng vấn' }
];

const emptyForm: BlogFormState = {
  title: '',
  subtitle: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '',
  tagsText: '',
  keywordsText: '',
  imageUrl: '',
  status: 'draft',
  publishedAt: '',
  isFeatured: false,
  authorName: '',
  authorRole: '',
  galleryMedia: [],
  videoItems: [],
  sourceLinks: []
};

const DEFAULT_IMAGE_TYPE = IMAGE_TYPE_OPTIONS[0]?.value ?? 'inline';
const DEFAULT_VIDEO_TYPE = VIDEO_TYPE_OPTIONS[0]?.value ?? 'body';

const createClientId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function parseDelimitedList(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function formatDelimitedList(items?: (string | null | undefined)[]) {
  if (!items || !items.length) return '';
  return items.filter(Boolean).join(', ');
}

function createMediaItem(
  overrides: Partial<MediaFormItem> = {},
  fallbackType: string = DEFAULT_IMAGE_TYPE
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

function ensureSourceLinkItems(input: unknown): SourceLinkItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const source = entry as Partial<SourceLinkItem> & { label?: string | null; url?: string | null };
      return {
        id: source.id || `source-${index}-${createClientId()}`,
        label: source.label ?? '',
        url: source.url ?? ''
      };
    })
    .filter(Boolean) as SourceLinkItem[];
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

function serializeSourceLinks(items: SourceLinkItem[]) {
  return items
    .map(item => ({
      label: item.label?.trim() || undefined,
      url: item.url.trim()
    }))
    .filter(item => Boolean(item.url));
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

function toDateInputValue(timestamp?: string | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function pickImageFile(): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      resolve(file ?? null);
    };
    input.click();
  });
}

function toErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.') {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

export default function AdminBlogPage() {
  const { data, isLoading, error } = useAdminBlogPosts();
  const saveMutation = useSaveBlogPostMutation();
  const deleteMutation = useDeleteBlogPostMutation();
  const uploadMutation = useUploadMediaMutation();
  const [selectedPost, setSelectedPost] = useState<BlogPostDetail | null>(null);
  const [formState, setFormState] = useState<BlogFormState>(() => ({ ...emptyForm }));
  const [showEditor, setShowEditor] = useState(false);
  const [mediaDialog, setMediaDialog] = useState<{ type: 'image' | 'video' } | null>(null);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [formSnapshot, setFormSnapshot] = useState(() => JSON.stringify(emptyForm));
  const [cursorParagraph, setCursorParagraph] = useState(0);
  const [albumPickerIndex, setAlbumPickerIndex] = useState<number | null>(null);
  const [isInlineInsertMode, setIsInlineInsertMode] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const imageMenuRef = useRef<HTMLDivElement | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pagination = useClientPagination(data ?? [], { pageSize: BLOG_PAGE_SIZE });
  const visiblePosts = pagination.items;
  const serializedForm = useMemo(() => JSON.stringify(formState), [formState]);
  const isDirty = serializedForm !== formSnapshot;

  const excerptWordCount = countWords(formState.excerpt);
  const inlinePositionHint = useMemo(() => estimateParagraphCount(formState.content), [formState.content]);

  const previewData = useMemo<BlogPostDetail>(() => {
    const parsedTags = parseDelimitedList(formState.tagsText);
    const tags = parsedTags.length ? parsedTags : selectedPost?.tags ?? [];
    const parsedKeywords = parseDelimitedList(formState.keywordsText);
    const keywords = parsedKeywords.length ? parsedKeywords : selectedPost?.keywords;
    const publishedAtIso = formState.publishedAt ? new Date(formState.publishedAt).toISOString() : selectedPost?.publishedAt;

    return {
      id: selectedPost?.id,
      code: selectedPost?.code ?? 'BLOG-DEMO',
      slug: formState.slug || selectedPost?.slug || 'blog-demo-slug',
      title: formState.title || 'Bài viết chưa đặt tên',
      subtitle: formState.subtitle || selectedPost?.subtitle,
      excerpt: formState.excerpt || 'Đoạn mô tả xem trước sẽ hiển thị tại đây.',
      content: formState.content || 'Nội dung bài viết đang được biên soạn...',
      tags,
      keywords,
      heroImage: formState.imageUrl || selectedPost?.heroImage || selectedPost?.imageUrl || undefined,
      imageUrl: formState.imageUrl || selectedPost?.heroImage || selectedPost?.imageUrl || undefined,
      category: formState.category || selectedPost?.category,
      publishedAt: publishedAtIso ?? undefined,
      authorName: formState.authorName || selectedPost?.authorName || selectedPost?.author || undefined,
      author: formState.authorName || selectedPost?.authorName || selectedPost?.author || undefined,
      authorRole: formState.authorRole || selectedPost?.authorRole,
      status: formState.status,
      isFeatured: formState.isFeatured,
      galleryMedia: serializeMediaForPreview(formState.galleryMedia) as any,
      videoItems: serializeMediaForPreview(formState.videoItems) as any,
      sourceLinks: serializeSourceLinks(formState.sourceLinks),
      createdAt: selectedPost?.createdAt,
      updatedAt: selectedPost?.updatedAt
    } as BlogPostDetail;
  }, [formState, selectedPost]);

  const hasPreviewSeed = Boolean(formState.title || formState.content);
  const previewHtml = useMemo(() => {
    if (!hasPreviewSeed) return '';
    try {
      return renderBlogPreviewHtml(previewData);
    } catch (error) {
      console.error('Không thể render preview blog:', error);
      return '';
    }
  }, [hasPreviewSeed, previewData]);

  // Close image dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setIsImageMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCursorInfo = () => {
    setCursorParagraph(getParagraphIndexAtCursor(contentInputRef.current));
  };

  function showFlash(message: string, type: FlashMessage['type'] = 'info') {
    setFlash({ message, type });
  }

  async function handleUploadHeroImage() {
    const file = await pickImageFile();
    if (!file) return;
    try {
      const uploaded = await uploadMutation.mutateAsync({ file, folder: 'blog/hero' });
      setFormState(prev => ({ ...prev, imageUrl: uploaded.url }));
      showFlash('Đã upload ảnh bìa lên Cloudinary', 'success');
    } catch (err) {
      showFlash(toErrorMessage(err), 'error');
    }
  }

  async function handleUploadGalleryItem(index: number) {
    const file = await pickImageFile();
    if (!file) return;
    try {
      const uploaded = await uploadMutation.mutateAsync({ file, folder: 'blog/gallery' });
      setFormState(prev => {
        const next = [...prev.galleryMedia];
        next[index] = { ...next[index], url: uploaded.url };
        return { ...prev, galleryMedia: next };
      });
      showFlash('Đã upload ảnh vào thư viện', 'success');
    } catch (err) {
      showFlash(toErrorMessage(err), 'error');
    }
  }

  function handleSelectFromAlbum(index: number) {
    setAlbumPickerIndex(index);
  }

  function handleAlbumImageSelected(url: string) {
    if (isInlineInsertMode) {
      const position = cursorParagraph;
      setFormState(prev => ({
        ...prev,
        galleryMedia: [
          ...prev.galleryMedia,
          createMediaItem({ url, type: 'inline', position }, DEFAULT_IMAGE_TYPE)
        ]
      }));
      showFlash(`Đã chèn ảnh từ Album sau đoạn ${position}`, 'success');
      setIsInlineInsertMode(false);
      setIsImageMenuOpen(false);
    } else if (albumPickerIndex !== null) {
      setFormState(prev => {
        const next = [...prev.galleryMedia];
        next[albumPickerIndex] = { ...next[albumPickerIndex], url };
        return { ...prev, galleryMedia: next };
      });
      showFlash('Đã chọn ảnh từ Album', 'success');
    }
    setAlbumPickerIndex(null);
  }

  async function handleInsertImageViaUpload() {
    const file = await pickImageFile();
    if (!file) return;
    try {
      const uploaded = await uploadMutation.mutateAsync({ file, folder: 'blog/inline' });
      const position = cursorParagraph;
      setFormState(prev => ({
        ...prev,
        galleryMedia: [
          ...prev.galleryMedia,
          createMediaItem({ url: uploaded.url, type: 'inline', position }, DEFAULT_IMAGE_TYPE)
        ]
      }));
      showFlash(`Đã upload và chèn ảnh sau đoạn ${position}`, 'success');
    } catch (err) {
      showFlash(toErrorMessage(err), 'error');
    }
  }

  function handleInsertImageViaUrl() {
    const url = window.prompt('Nhập URL ảnh:');
    if (!url || !url.trim()) return;
    const position = cursorParagraph;
    setFormState(prev => ({
      ...prev,
      galleryMedia: [
        ...prev.galleryMedia,
        createMediaItem({ url: url.trim(), type: 'inline', position }, DEFAULT_IMAGE_TYPE)
      ]
    }));
    showFlash(`Đã chèn ảnh sau đoạn ${position}`, 'success');
  }

  function handleInsertImageFromAlbum() {
    setIsInlineInsertMode(true);
    // The AlbumPickerModal will be shown and handleAlbumImageSelected will handle it
  }

  async function handleInlineUpload(file: File) {
    const uploaded = await uploadMutation.mutateAsync({ file, folder: 'blog/inline' });
    showFlash('Đã upload ảnh và chèn URL', 'success');
    return uploaded.url;
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
              type: 'inline',
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

  function handleSourceDialogSubmit(payload: { label: string; url: string }) {
    setFormState(prev => ({
      ...prev,
      sourceLinks: [
        ...prev.sourceLinks,
        {
          id: createClientId(),
          label: payload.label,
          url: payload.url
        }
      ]
    }));
    setSourceDialogOpen(false);
    showFlash('Đã thêm nguồn tham khảo', 'success');
  }

  function confirmDiscardChanges() {
    if (!showEditor || !isDirty) {
      return true;
    }
    return window.confirm('Bạn có thay đổi chưa lưu. Tiếp tục và bỏ qua các thay đổi?');
  }

  function handleSelectPost(post: BlogPostDetail) {
    if (!confirmDiscardChanges()) {
      return;
    }
    setSelectedPost(post);
  }

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

  useEffect(() => {
    if (!selectedPost) {
      setFormState(() => ({ ...emptyForm }));
      setFormSnapshot(JSON.stringify(emptyForm));
      setCursorParagraph(0);
      return;
    }
    const tagsText = formatDelimitedList(selectedPost.tags);
    const keywordsText = formatDelimitedList(selectedPost.keywords);
    const nextState: BlogFormState = {
      title: selectedPost.title,
      subtitle: selectedPost.subtitle ?? '',
      slug: selectedPost.slug,
      category: selectedPost.category ?? '',
      excerpt: selectedPost.excerpt,
      content: selectedPost.content,
      tagsText: tagsText,
      keywordsText,
      imageUrl: selectedPost.heroImage ?? selectedPost.imageUrl ?? '',
      status: (selectedPost.status as BlogStatus) || 'draft',
      publishedAt: toDateInputValue(selectedPost.publishedAt),
      isFeatured: selectedPost.isFeatured ?? false,
      authorName: selectedPost.authorName ?? selectedPost.author ?? '',
      authorRole: selectedPost.authorRole ?? '',
      galleryMedia: ensureMediaFormItems(selectedPost.galleryMedia, DEFAULT_IMAGE_TYPE),
      videoItems: ensureMediaFormItems(selectedPost.videoItems, DEFAULT_VIDEO_TYPE),
      sourceLinks: ensureSourceLinkItems(selectedPost.sourceLinks)
    };
    setFormState(nextState);
    setFormSnapshot(JSON.stringify(nextState));
    setCursorParagraph(estimateParagraphCount(nextState.content));
    setShowEditor(true);
  }, [selectedPost]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tags = parseDelimitedList(formState.tagsText);
    const keywords = parseDelimitedList(formState.keywordsText);
    const galleryMediaPayload = serializeMediaForSave(formState.galleryMedia);
    const videoItemsPayload = serializeMediaForSave(formState.videoItems);
    const sourceLinksPayload = serializeSourceLinks(formState.sourceLinks);
    const payload = {
      id: selectedPost?.id,
      title: formState.title,
      subtitle: formState.subtitle || undefined,
      slug: formState.slug || undefined,
      category: formState.category || undefined,
      excerpt: formState.excerpt,
      content: formState.content,
      tags,
      keywords,
      imageUrl: formState.imageUrl || null,
      status: formState.status,
      publishedAt: formState.publishedAt ? new Date(formState.publishedAt).toISOString() : null,
      isFeatured: formState.isFeatured,
      authorName: formState.authorName || undefined,
      authorRole: formState.authorRole || undefined,
      galleryMedia: galleryMediaPayload.length ? galleryMediaPayload : undefined,
      videoItems: videoItemsPayload.length ? videoItemsPayload : undefined,
      sourceLinks: sourceLinksPayload.length ? sourceLinksPayload : undefined
    };

    try {
      await saveMutation.mutateAsync(payload);
      showFlash(selectedPost ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết mới', 'success');
      setSelectedPost(null);
      setFormState(() => ({ ...emptyForm }));
      setFormSnapshot(JSON.stringify(emptyForm));
      setShowEditor(false);
    } catch (error) {
      showFlash((error as Error)?.message || 'Không thể lưu bài viết', 'error');
    }
  }

  async function handleDelete(post: BlogPostDetail) {
    if (!window.confirm(`Xoá bài viết "${post.title}"?`)) {
      return;
    }
    if (!post.id) {
      alert('Không thể xác định ID bài viết để xoá.');
      return;
    }
    try {
      await deleteMutation.mutateAsync(post.id);
      showFlash('Đã xoá bài viết', 'success');
      const isCurrentSelection = selectedPost
        ? selectedPost.id && post.id
          ? selectedPost.id === post.id
          : selectedPost.code === post.code
        : false;
      if (isCurrentSelection) {
        setSelectedPost(null);
        setFormState(() => ({ ...emptyForm }));
        setFormSnapshot(JSON.stringify(emptyForm));
        setShowEditor(false);
      }
    } catch (error) {
      showFlash((error as Error)?.message || 'Không thể xoá bài viết', 'error');
    }
  }

  function handleNewPost() {
    if (!confirmDiscardChanges()) {
      return;
    }
    setSelectedPost(null);
    setFormState(() => ({ ...emptyForm }));
    setFormSnapshot(JSON.stringify(emptyForm));
    setShowEditor(true);
  }

  function handleCancelEdit() {
    if (!confirmDiscardChanges()) {
      return;
    }
    setSelectedPost(null);
    setFormState(() => ({ ...emptyForm }));
    setFormSnapshot(JSON.stringify(emptyForm));
    setShowEditor(false);
  }

  // Full-screen Editor View
  if (showEditor) {
    const flashTone =
      flash?.type === 'success'
        ? 'bg-emerald-600'
        : flash?.type === 'error'
        ? 'bg-red-600'
        : 'bg-slate-900';

    return (
      <>
        <div className="grid h-[calc(100vh-200px)] min-h-[600px] grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        {/* Left: Editor Input */}
        <div className="flex flex-col overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}>
            <h2 className="text-lg font-semibold">{selectedPost ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}</h2>
            <div className="flex items-center gap-2">
              <div className="relative" ref={imageMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsImageMenuOpen(open => !open)}
                  className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                >
                  <i className="fas fa-image"></i>
                  <span>Chèn ảnh</span>
                  <i className="fas fa-caret-down ml-1"></i>
                </button>
                {isImageMenuOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        handleInsertImageViaUrl();
                        setIsImageMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <i className="fas fa-link w-4"></i>
                      <span>Nhập URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleInsertImageViaUpload();
                        setIsImageMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <i className="fas fa-upload w-4"></i>
                      <span>Tải ảnh lên</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInsertImageFromAlbum();
                        setIsImageMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <i className="fas fa-images w-4"></i>
                      <span>Chọn từ thư viện</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                onClick={() => setMediaDialog({ type: 'video' })}
              >
                <i className="fas fa-video"></i>
                <span>Chèn video</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/30"
                onClick={() => setSourceDialogOpen(true)}
              >
                <i className="fas fa-link"></i>
                <span>Thêm nguồn</span>
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
                  value={formState.subtitle}
                  onChange={e => setFormState(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Mở rộng tiêu đề, nằm dưới heading chính"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Slug URL</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.slug}
                    onChange={e => {
                      const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                      const normalized = raw.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                      setFormState(prev => ({ ...prev, slug: normalized }));
                    }}
                    placeholder="xu-huong-ai-2025"
                  />
                  <p className="text-xs text-slate-500">Hệ thống tự thêm hậu tố <code className="font-mono">-blogYYYYMMDDHHmmss</code>.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Danh mục</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.category}
                    onChange={e => setFormState(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="VD: Chuyển đổi số"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">URL ảnh bìa</label>
                  <ImageSelector
                    value={formState.imageUrl}
                    onChange={url => setFormState(prev => ({ ...prev, imageUrl: url }))}
                    placeholder="https://..."
                    folder="blog/hero"
                  />
                  <p className="text-xs text-slate-500">Có thể dán URL, tải ảnh lên hoặc chọn từ Album.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Ngày/Giờ xuất bản</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.publishedAt}
                    onChange={e => setFormState(prev => ({ ...prev, publishedAt: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500">Nếu để trống, hệ thống sẽ dùng thời gian hiện tại khi xuất bản.</p>
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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-sm font-semibold text-[#0f172a]">Keywords (SEO)</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={formState.keywordsText}
                    onChange={e => setFormState(prev => ({ ...prev, keywordsText: e.target.value }))}
                    placeholder="Xu hướng AI 2025, chuyển đổi số"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                ref={contentInputRef}
                value={formState.content}
                onChange={e => {
                  const value = e.target.value;
                  setFormState(prev => ({ ...prev, content: value }));
                  updateCursorInfo();
                }}
                onClick={updateCursorInfo}
                onKeyUp={updateCursorInfo}
                onMouseUp={updateCursorInfo}
                onSelect={updateCursorInfo}
                placeholder="Viết nội dung bài viết tại đây...

Mỗi đoạn văn cách nhau bởi 1 dòng trống.

Đặt con trỏ vào giữa các đoạn để chèn ảnh/video."
                required
              />
            </div>

            <div className="space-y-6 border-t border-slate-200 pt-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MediaListEditor
                  title="Hình ảnh & thư viện"
                  description="Điền vị trí để chèn trực tiếp giữa các đoạn. Để trống = hiển thị trong thư viện cuối bài."
                  items={formState.galleryMedia}
                  onChange={items => setFormState(prev => ({ ...prev, galleryMedia: items }))}
                  addLabel="Thêm ảnh"
                  typeOptions={IMAGE_TYPE_OPTIONS}
                  nextPositionHint={inlinePositionHint}
                  onUploadClick={handleUploadGalleryItem}
                  onSelectFromAlbum={handleSelectFromAlbum}
                />
                <MediaListEditor
                  title="Video minh hoạ"
                  description="Hỗ trợ link YouTube, Vimeo hoặc file mp4. Điền vị trí để chèn inline."
                  items={formState.videoItems}
                  onChange={items => setFormState(prev => ({ ...prev, videoItems: items }))}
                  addLabel="Thêm video"
                  typeOptions={VIDEO_TYPE_OPTIONS}
                  nextPositionHint={inlinePositionHint}
                />
              </div>
              <SourceLinksEditor
                items={formState.sourceLinks}
                onChange={items => setFormState(prev => ({ ...prev, sourceLinks: items }))}
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
            {hasPreviewSeed && previewHtml ? (
              <div
                className="legacy-preview space-y-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <i className="fas fa-file-alt mb-4 text-4xl"></i>
                <p className="text-lg font-medium">Bắt đầu nhập nội dung để xem preview</p>
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
          onUploadFile={mediaDialog?.type === 'image' ? handleInlineUpload : undefined}
          isUploading={uploadMutation.isPending}
        />
        <QuickSourceDialog
          open={sourceDialogOpen}
          onClose={() => setSourceDialogOpen(false)}
          onSubmit={handleSourceDialogSubmit}
        />
        {(albumPickerIndex !== null || isInlineInsertMode) && (
          <AlbumPickerModal
            onClose={() => {
              setAlbumPickerIndex(null);
              setIsInlineInsertMode(false);
            }}
            onSelect={handleAlbumImageSelected}
          />
        )}
        {flash && (
          <div className={`fixed right-10 top-10 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${flashTone}`}>
            {flash.message}
          </div>
        )}
      </>
    );
  }

  // Blog List View
  const flashOverlay = flash ? (
    <div className={`fixed right-10 top-10 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${
      flash.type === 'success' ? 'bg-emerald-600' : flash.type === 'error' ? 'bg-red-600' : 'bg-slate-900'
    }`}>
      {flash.message}
    </div>
  ) : null;

  return (
    <>
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
                    Chưa có bài viết nào. Nhấn &quot;Soạn bài viết&quot; để bắt đầu.
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
                          onClick={() => handleSelectPost(post)}
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
      {flashOverlay}
    </>
  );
}
