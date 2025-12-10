"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import clsx from "clsx";

export interface QuickMediaDialogProps {
  open: boolean;
  type: "image" | "video";
  title?: string;
  description?: string;
  positionHint?: number;
  onClose: () => void;
  onSubmit: (payload: { url: string; caption: string }) => void;
  onUploadFile?: (file: File) => Promise<string>;
  isUploading?: boolean;
}

const LABELS = {
  image: {
    title: "Chèn ảnh",
    urlLabel: "URL ảnh",
    placeholder: "https://...",
    icon: "fas fa-image"
  },
  video: {
    title: "Chèn video",
    urlLabel: "URL video (YouTube, Vimeo hoặc mp4)",
    placeholder: "https://...",
    icon: "fas fa-video"
  }
} as const;

export function QuickMediaDialog({
  open,
  type,
  title,
  description,
  positionHint,
  onClose,
  onSubmit,
  onUploadFile,
  isUploading
}: QuickMediaDialogProps) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [localUploading, setLocalUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const meta = LABELS[type];

  useEffect(() => {
    if (!open) return;
    setUrl("");
    setCaption("");
    setLocalUploading(false);
  }, [open, type]);

  function handleSubmit() {
    if (!url.trim()) {
      return;
    }
    onSubmit({ url: url.trim(), caption: caption.trim() });
    setUrl("");
    setCaption("");
  }

  async function handlePickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUploadFile) return;

    try {
      setLocalUploading(true);
      const uploadedUrl = await onUploadFile(file);
      if (uploadedUrl) {
        setUrl(uploadedUrl);
      }
    } catch (error) {
      console.error("Upload ảnh thất bại", error);
      alert("Không thể upload ảnh. Vui lòng thử lại hoặc kiểm tra kết nối.");
    } finally {
      setLocalUploading(false);
    }
  }

  const uploadBusy = localUploading || Boolean(isUploading);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <i className={meta.icon} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title ?? meta.title}</h3>
              {description ? <p className="text-sm text-slate-500">{description}</p> : null}
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
            <label className="text-sm font-medium text-slate-700">{meta.urlLabel}</label>
            <input
              type="url"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/30"
              placeholder={meta.placeholder}
              value={url}
              onChange={event => setUrl(event.target.value)}
              autoFocus
            />
            {type === "image" && onUploadFile ? (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePickFile}
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#1c6e8c] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadBusy}
                >
                  <i className="fas fa-upload" aria-hidden="true" />
                  {uploadBusy ? "Đang tải..." : "Tải ảnh từ máy"}
                </button>
                <p className="text-[11px] text-slate-500">
                  Ảnh sẽ được upload lên Cloudinary và tự chèn URL.
                </p>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Chú thích (tuỳ chọn)</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/30"
              placeholder="Mô tả ngắn"
              value={caption}
              onChange={event => setCaption(event.target.value)}
            />
          </div>
          {typeof positionHint === "number" && positionHint >= 0 ? (
            <p className="text-xs text-slate-500">
              Ảnh/video sẽ được chèn sau đoạn <strong>{positionHint}</strong> (vị trí con trỏ hiện tại).
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-500">Dán URL từ CDN, thư viện ảnh nội bộ hoặc YouTube.</p>
          <div className="flex items-center gap-2">
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
                url.trim() && !uploadBusy ? "bg-[#1c6e8c] hover:bg-[#15506a]" : "bg-slate-300 cursor-not-allowed"
              )}
              onClick={handleSubmit}
              disabled={!url.trim() || uploadBusy}
            >
              {uploadBusy ? "Đang tải" : "Chèn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
