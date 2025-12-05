"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export interface QuickSourceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { label: string; url: string }) => void;
}

export function QuickSourceDialog({ open, onClose, onSubmit }: QuickSourceDialogProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setLabel("");
    setUrl("");
  }, [open]);

  function handleSubmit() {
    if (!label.trim() || !url.trim()) {
      return;
    }
    onSubmit({ label: label.trim(), url: url.trim() });
    setLabel("");
    setUrl("");
  }

  if (!open) {
    return null;
  }

  const disabled = !label.trim() || !url.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <i className="fas fa-link" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Thêm nguồn tham khảo</h3>
              <p className="text-sm text-slate-500">Tên nguồn sẽ hiển thị trong danh sách liên kết cuối bài.</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            aria-label="Đóng"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên nguồn</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/30"
              placeholder="VD: Báo Công Thương"
              value={label}
              onChange={event => setLabel(event.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">URL nguồn</label>
            <input
              type="url"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/30"
              placeholder="https://..."
              value={url}
              onChange={event => setUrl(event.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className={clsx(
              "rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg transition",
              disabled ? "bg-slate-300 cursor-not-allowed" : "bg-[#1c6e8c] hover:bg-[#15506a]"
            )}
            onClick={handleSubmit}
            disabled={disabled}
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
