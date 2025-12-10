'use client';

export interface SourceLinkItem {
  id: string;
  label: string;
  url: string;
}

interface SourceLinksEditorProps {
  items: SourceLinkItem[];
  onChange: (items: SourceLinkItem[]) => void;
}

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function SourceLinksEditor({ items, onChange }: SourceLinksEditorProps) {
  function addLink() {
    onChange([
      ...items,
      {
        id: createId(),
        label: '',
        url: ''
      }
    ]);
  }

  function updateLink(index: number, partial: Partial<SourceLinkItem>) {
    onChange(items.map((item, idx) => (idx === index ? { ...item, ...partial } : item)));
  }

  function removeLink(index: number) {
    onChange(items.filter((_, idx) => idx !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-[#0f172a]">Nguồn tham khảo</label>
          <p className="text-xs text-slate-500">Giúp bài viết tăng độ tin cậy và SEO tốt hơn.</p>
        </div>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
        >
          <i className="fas fa-plus" aria-hidden="true" />
          <span>Thêm nguồn</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
          Chưa có nguồn tham khảo. Nhấn &quot;Thêm nguồn&quot; để bổ sung.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Tên nguồn</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="VD: Báo Công Thương"
                  value={item.label}
                  onChange={event => updateLink(index, { label: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">URL</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="https://"
                  value={item.url}
                  onChange={event => updateLink(index, { url: event.target.value })}
                />
              </div>
              <button
                type="button"
                className="self-start rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-50"
                onClick={() => removeLink(index)}
                aria-label="Xóa nguồn"
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
