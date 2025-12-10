'use client';

import { useState } from 'react';
import { useAlbumImages } from '@/hooks/admin';

interface AlbumPickerModalProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}

const FOLDER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'blog/hero', label: 'Blog - Ảnh bìa' },
  { value: 'blog/gallery', label: 'Blog - Thư viện' },
  { value: 'blog/inline', label: 'Blog - Trong bài' },
  { value: 'products/hero', label: 'Sản phẩm - Ảnh đại diện' },
  { value: 'products/gallery', label: 'Sản phẩm - Thư viện' },
  { value: 'products/inline', label: 'Sản phẩm - Trong bài' },
  { value: 'users/avatars', label: 'Người dùng - Avatar' }
];

export function AlbumPickerModal({ onClose, onSelect }: AlbumPickerModalProps) {
  const [selectedFolder, setSelectedFolder] = useState('');
  const { data, isLoading, error } = useAlbumImages({ folder: selectedFolder || undefined });
  const images = data?.images ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#0d1b2a]">Chọn ảnh từ Album</h3>
            <p className="text-sm text-slate-500">Nhấp vào ảnh để chọn</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        {/* Filter */}
        <div className="border-b border-slate-100 px-6 py-3">
          <select
            value={selectedFolder}
            onChange={e => setSelectedFolder(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
          >
            {FOLDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1c6e8c] border-t-transparent"></div>
                <p className="text-sm text-slate-500">Đang tải...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <i className="fas fa-exclamation-triangle mb-3 text-3xl text-amber-500" aria-hidden="true" />
              <p className="text-sm text-slate-600">Không thể tải danh sách ảnh</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <i className="fas fa-images mb-3 text-4xl text-slate-300" aria-hidden="true" />
              <p className="text-sm text-slate-600">Chưa có ảnh nào trong thư mục này</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {images.map(image => (
                <button
                  key={image.publicId}
                  type="button"
                  onClick={() => onSelect(image.secureUrl)}
                  className="group aspect-square overflow-hidden rounded-xl border-2 border-transparent bg-slate-100 transition-all hover:border-[#1c6e8c] hover:ring-2 hover:ring-[#1c6e8c]/20"
                >
                  <img
                    src={image.secureUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlbumPickerModal;
