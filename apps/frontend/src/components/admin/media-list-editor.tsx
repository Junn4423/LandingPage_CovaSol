'use client';

import { useMemo } from 'react';

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
}

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function MediaListEditor({
  title,
  description,
  items,
  onChange,
  addLabel = 'Thêm mục',
  typeOptions,
  nextPositionHint
}: MediaListEditorProps) {
  const defaultType = typeOptions[0]?.value ?? 'default';
  const suggestedPosition = useMemo(() => {
    if (typeof nextPositionHint === 'number' && Number.isFinite(nextPositionHint) && nextPositionHint >= 0) {
      return Math.trunc(nextPositionHint);
    }
    return 0;
  }, [nextPositionHint]);

  function updateItem(index: number, partial: Partial<MediaFormItem>) {
    onChange(items.map((item, idx) => (idx === index ? { ...item, ...partial } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, idx) => idx !== index));
  }

  function handleAdd() {
    onChange([
      ...items,
      {
        id: createId(),
        url: '',
        caption: '',
        type: defaultType,
        position: suggestedPosition
      }
    ]);
  }

  function parsePosition(value: string): number | '' {
    if (value === '') return '';
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return '';
    }
    return Math.trunc(parsed);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-[#0f172a]">{title}</label>
            {description ? <p className="text-xs text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <i className="fas fa-plus" aria-hidden="true" />
            <span>{addLabel}</span>
          </button>
        </div>
        <p className="text-xs italic text-slate-500">
          Để trống vị trí nếu muốn hiển thị trong thư viện cuối bài.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
          Chưa có nội dung. Nhấn "{addLabel}" để bắt đầu.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">URL</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="https://"
                  value={item.url}
                  onChange={event => updateItem(index, { url: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Chú thích</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Mô tả ngắn"
                  value={item.caption}
                  onChange={event => updateItem(index, { caption: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Loại hiển thị</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={item.type}
                  onChange={event => updateItem(index, { type: event.target.value })}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Vị trí chèn</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={item.position === '' ? '' : item.position}
                  onChange={event => updateItem(index, { position: parsePosition(event.target.value) })}
                />
                <p className="text-[11px] italic text-slate-500">0 = trước đoạn đầu. Trống = thư viện cuối.</p>
              </div>
              <button
                type="button"
                className="self-start rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-50"
                onClick={() => removeItem(index)}
                aria-label="Xóa mục"
              >
                <i className="fas fa-trash" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
