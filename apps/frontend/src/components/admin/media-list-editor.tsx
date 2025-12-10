'use client';

import { useMemo, useState } from 'react';

export interface MediaFormItem {
  id: string;
  url: string;
  caption: string;
  type: string;
  position: number | '';
}

export interface MediaListEditorProps {
  title: string;
  description?: string;
  items: MediaFormItem[];
  onChange: (items: MediaFormItem[]) => void;
  addLabel?: string;
  typeOptions: { value: string; label: string }[];
  nextPositionHint?: number;
  onUploadClick?: (index: number) => void;
  onSelectFromAlbum?: (index: number) => void;
}

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function MediaListEditor({
  title,
  description,
  items,
  onChange,
  addLabel = 'Thêm mục',
  typeOptions,
  nextPositionHint,
  onUploadClick,
  onSelectFromAlbum
}: MediaListEditorProps) {
  const defaultType = typeOptions[0]?.value ?? 'default';
  const suggestedPosition = useMemo(() => {
    if (typeof nextPositionHint === 'number' && Number.isFinite(nextPositionHint) && nextPositionHint >= 0) {
      return Math.trunc(nextPositionHint);
    }
    return 0;
  }, [nextPositionHint]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateItem(index: number, partial: Partial<MediaFormItem>) {
    onChange(items.map((item, idx) => (idx === index ? { ...item, ...partial } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, idx) => idx !== index));
  }

  function handleAdd() {
    const newId = createId();
    onChange([
      ...items,
      {
        id: newId,
        url: '',
        caption: '',
        type: defaultType,
        position: suggestedPosition
      }
    ]);
    // Auto-expand newly added item
    setExpandedItems(prev => new Set(prev).add(newId));
  }

  function parsePosition(value: string): number | '' {
    if (value === '') return '';
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return '';
    }
    return Math.trunc(parsed);
  }

  const isVideo = title.toLowerCase().includes('video');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
            <i className={`${isVideo ? 'fas fa-video' : 'fas fa-images'} text-[#1c6e8c]`} aria-hidden="true" />
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1c6e8c] bg-[#1c6e8c]/5 px-3 py-1.5 text-xs font-semibold text-[#1c6e8c] transition-all hover:bg-[#1c6e8c] hover:text-white"
        >
          <i className="fas fa-plus text-[10px]" aria-hidden="true" />
          <span>{addLabel}</span>
        </button>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-6 text-center">
          <i className={`${isVideo ? 'fas fa-film' : 'fas fa-image'} mb-2 text-2xl text-slate-300`} aria-hidden="true" />
          <p className="text-sm text-slate-500">Chưa có nội dung</p>
          <p className="text-xs text-slate-400">Nhấn &quot;{addLabel}&quot; để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const hasUrl = Boolean(item.url);
            
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-xl border transition-all ${
                  isExpanded ? 'border-[#1c6e8c]/30 bg-slate-50' : 'border-slate-200 bg-white'
                }`}
              >
                {/* Collapsed View - Preview Row */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-50"
                  onClick={() => toggleExpand(item.id)}
                >
                  {/* Thumbnail */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {hasUrl ? (
                      isVideo ? (
                        <i className="fas fa-play-circle text-xl text-[#1c6e8c]" aria-hidden="true" />
                      ) : (
                        <img
                          src={item.url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      )
                    ) : (
                      <i className={`${isVideo ? 'fas fa-video' : 'fas fa-image'} text-lg text-slate-300`} aria-hidden="true" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {item.caption || (hasUrl ? item.url.split('/').pop() : `${isVideo ? 'Video' : 'Ảnh'} ${index + 1}`)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5">
                        {typeOptions.find(o => o.value === item.type)?.label || item.type}
                      </span>
                      {item.position !== '' && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-map-marker-alt text-[10px]" aria-hidden="true" />
                          Vị trí: {item.position}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className={`rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                    >
                      <i className="fas fa-chevron-down text-xs" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      onClick={e => {
                        e.stopPropagation();
                        removeItem(index);
                      }}
                      aria-label="Xóa mục"
                    >
                      <i className="fas fa-trash text-xs" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Expanded View - Edit Form */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-white p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* URL Input */}
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          URL {isVideo ? 'Video' : 'Ảnh'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                            placeholder={isVideo ? 'https://youtube.com/... hoặc link video' : 'https://...'}
                            value={item.url}
                            onChange={e => updateItem(index, { url: e.target.value })}
                            onClick={e => e.stopPropagation()}
                          />
                          {onUploadClick && !isVideo && (
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                              onClick={e => {
                                e.stopPropagation();
                                onUploadClick(index);
                              }}
                              title="Tải ảnh từ máy"
                            >
                              <i className="fas fa-upload" aria-hidden="true" />
                              <span className="hidden sm:inline">Tải lên</span>
                            </button>
                          )}
                          {onSelectFromAlbum && !isVideo && (
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                              onClick={e => {
                                e.stopPropagation();
                                onSelectFromAlbum(index);
                              }}
                              title="Chọn từ Album"
                            >
                              <i className="fas fa-images" aria-hidden="true" />
                              <span className="hidden sm:inline">Album</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Chú thích
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                          placeholder="Mô tả ngắn (tuỳ chọn)"
                          value={item.caption}
                          onChange={e => updateItem(index, { caption: e.target.value })}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>

                      {/* Type Select */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Loại hiển thị
                          </label>
                          <select
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                            value={item.type}
                            onChange={e => updateItem(index, { type: e.target.value })}
                            onClick={e => e.stopPropagation()}
                          >
                            {typeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Position */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                            Vị trí chèn
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                            placeholder="Để trống"
                            value={item.position === '' ? '' : item.position}
                            onChange={e => updateItem(index, { position: parsePosition(e.target.value) })}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] italic text-slate-400">
                      Vị trí: 0 = trước đoạn đầu. Để trống = thư viện cuối bài.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
