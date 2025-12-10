'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAlbumImages, useUploadMediaMutation } from '@/hooks/admin';
import { useQueryClient } from '@tanstack/react-query';

type InputMode = 'url' | 'upload' | 'album';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageSelector({
  value,
  onChange,
  placeholder = 'https://...',
  folder = 'album',
  disabled = false,
  className = ''
}: ImageSelectorProps) {
  const [mode, setMode] = useState<InputMode>('url');
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const uploadMutation = useUploadMediaMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadClick = useCallback(() => {
    setIsDropdownOpen(false);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Chỉ hỗ trợ file ảnh');
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({ file, folder });
      onChange(result.url);
      queryClient.invalidateQueries({ queryKey: ['admin', 'album'] });
    } catch (err: any) {
      alert(err?.message || 'Tải ảnh lên thất bại');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenAlbum = useCallback(() => {
    setIsDropdownOpen(false);
    setIsAlbumOpen(true);
  }, []);

  const handleSelectFromAlbum = useCallback((url: string) => {
    onChange(url);
    setIsAlbumOpen(false);
  }, [onChange]);

  const modeOptions = [
    { value: 'url' as const, label: 'Nhập URL', icon: 'fas fa-link' },
    { value: 'upload' as const, label: 'Tải lên', icon: 'fas fa-upload' },
    { value: 'album' as const, label: 'Chọn từ Album', icon: 'fas fa-images' }
  ];

  const currentMode = modeOptions.find(m => m.value === mode) || modeOptions[0];

  return (
    <>
      <div className={`relative flex gap-2 ${className}`} ref={dropdownRef}>
        {/* Mode selector dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled || uploadMutation.isPending}
            className="flex h-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <i className={currentMode.icon} aria-hidden="true" />
            <i className="fas fa-chevron-down text-[10px] text-slate-400" aria-hidden="true" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {modeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (option.value === 'upload') {
                      handleUploadClick();
                    } else if (option.value === 'album') {
                      handleOpenAlbum();
                    } else {
                      setMode(option.value);
                      setIsDropdownOpen(false);
                    }
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                    mode === option.value && option.value === 'url' ? 'bg-slate-100 text-[#1c6e8c]' : 'text-slate-600'
                  }`}
                >
                  <i className={option.icon} aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL input */}
        <input
          type="url"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20 disabled:opacity-50"
          placeholder={uploadMutation.isPending ? 'Đang tải lên...' : placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || uploadMutation.isPending}
        />

        {/* Loading indicator */}
        {uploadMutation.isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <i className="fas fa-spinner fa-spin text-[#1c6e8c]" aria-hidden="true" />
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Album Modal */}
      {isAlbumOpen && (
        <AlbumPickerModal
          onClose={() => setIsAlbumOpen(false)}
          onSelect={handleSelectFromAlbum}
        />
      )}
    </>
  );
}

// Album Picker Modal Component
interface AlbumPickerModalProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}

function AlbumPickerModal({ onClose, onSelect }: AlbumPickerModalProps) {
  const [selectedFolder, setSelectedFolder] = useState('');
  const { data, isLoading, error } = useAlbumImages({ folder: selectedFolder || undefined });
  const images = data?.images ?? [];

  const FOLDER_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'blog/hero', label: 'Blog - Ảnh bìa' },
    { value: 'blog/gallery', label: 'Blog - Thư viện' },
    { value: 'blog/inline', label: 'Blog - Trong bài' },
    { value: 'products/hero', label: 'Sản phẩm - Ảnh đại diện' },
    { value: 'products/gallery', label: 'Sản phẩm - Thư viện' },
    { value: 'products/inline', label: 'Sản phẩm - Trong bài' }
  ];

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

export default ImageSelector;
