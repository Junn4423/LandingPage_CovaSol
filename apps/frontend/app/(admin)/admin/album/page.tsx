'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useAlbumImages, useDeleteAlbumImageMutation, useUploadMediaMutation } from '@/hooks/admin';
import { ApiError } from '@/lib/api-client';
import { compressImageFile, DEFAULT_MAX_UPLOAD_BYTES } from '@/lib/image-optimizer';
import { useQueryClient } from '@tanstack/react-query';

type FlashMessage = { type: 'success' | 'error' | 'info'; message: string };

const FOLDER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'blog/hero', label: 'Blog - Ảnh bìa' },
  { value: 'blog/gallery', label: 'Blog - Thư viện' },
  { value: 'blog/inline', label: 'Blog - Trong bài' },
  { value: 'products/hero', label: 'Sản phẩm - Ảnh đại diện' },
  { value: 'products/gallery', label: 'Sản phẩm - Thư viện' },
  { value: 'products/inline', label: 'Sản phẩm - Trong bài' }
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AdminAlbumPage() {
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useAlbumImages({ folder: selectedFolder || undefined });
  const deleteMutation = useDeleteAlbumImageMutation();
  const uploadMutation = useUploadMediaMutation();

  const images = useMemo(() => data?.images ?? [], [data?.images]);

  function showFlash(message: string, type: FlashMessage['type'] = 'info') {
    setFlash({ message, type });
    setTimeout(() => setFlash(null), 4000);
  }

  const handleToggleSelect = useCallback((publicId: string) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(publicId)) {
        next.delete(publicId);
      } else {
        next.add(publicId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.publicId)));
    }
  }, [images, selectedImages.size]);

  const handleDelete = useCallback(async (publicId: string) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn tác.')) return;
    
    try {
      await deleteMutation.mutateAsync(publicId);
      setSelectedImages(prev => {
        const next = new Set(prev);
        next.delete(publicId);
        return next;
      });
      showFlash('Đã xóa ảnh thành công', 'success');
    } catch (err: any) {
      showFlash(err?.message || 'Xóa ảnh thất bại', 'error');
    }
  }, [deleteMutation]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedImages.size} ảnh đã chọn? Hành động này không thể hoàn tác.`)) return;
    
    try {
      const publicIds = Array.from(selectedImages);
      await Promise.all(publicIds.map(id => deleteMutation.mutateAsync(id)));
      setSelectedImages(new Set());
      showFlash(`Đã xóa ${publicIds.length} ảnh thành công`, 'success');
    } catch (err: any) {
      showFlash(err?.message || 'Có lỗi khi xóa một số ảnh', 'error');
    }
  }, [selectedImages, deleteMutation]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      showFlash('Chỉ hỗ trợ tải lên file ảnh', 'error');
      return;
    }

    try {
      showFlash(`Đang xử lý và tải lên ${validFiles.length} ảnh...`, 'info');

      const optimizedFiles = await Promise.all(
        validFiles.map(async file => {
          const result = await compressImageFile(file, {
            maxBytes: DEFAULT_MAX_UPLOAD_BYTES,
            maxDimension: 1920
          });
          return result;
        })
      );

      const compressedCount = optimizedFiles.filter(item => item.wasCompressed).length;

      await Promise.all(
        optimizedFiles.map(({ file }) => 
          uploadMutation.mutateAsync({ 
            file, 
            folder: uploadFolder || 'album' 
          })
        )
      );
      
      // Refresh album list
      queryClient.invalidateQueries({ queryKey: ['admin', 'album'] });
      if (compressedCount > 0) {
        showFlash(`Đã nén ${compressedCount}/${optimizedFiles.length} ảnh trước khi tải lên`, 'info');
      }
      showFlash(`Đã tải lên ${optimizedFiles.length} ảnh thành công`, 'success');
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 413) {
        showFlash('Ảnh vẫn vượt quá giới hạn kích thước. Vui lòng chọn ảnh nhỏ hơn hoặc giảm độ phân giải.', 'error');
      } else {
        showFlash(err?.message || 'Tải ảnh lên thất bại', 'error');
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showFlash('Đã sao chép URL vào clipboard', 'success');
  };

  const flashTone = flash?.type === 'success' ? 'bg-emerald-500' : flash?.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0d1b2a]">Album ảnh</h2>
            <p className="text-sm text-slate-500">Quản lý tất cả ảnh đã tải lên Cloudinary</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Folder filter */}
            <select
              value={selectedFolder}
              onChange={e => {
                setSelectedFolder(e.target.value);
                setSelectedImages(new Set());
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
            >
              {FOLDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Upload folder select */}
            <select
              value={uploadFolder}
              onChange={e => setUploadFolder(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
            >
              <option value="">Thư mục upload: Mặc định</option>
              {FOLDER_OPTIONS.slice(1).map(opt => (
                <option key={opt.value} value={opt.value}>Upload: {opt.label}</option>
              ))}
            </select>

            {/* Upload button */}
            <button
              onClick={handleUploadClick}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#124e66] to-[#1c6e8c] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
            >
              <i className={`fas ${uploadMutation.isPending ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'}`}></i>
              <span>{uploadMutation.isPending ? 'Đang tải...' : 'Tải ảnh lên'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Delete selected */}
            {selectedImages.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 disabled:opacity-50"
              >
                <i className={`fas ${deleteMutation.isPending ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                <span>Xóa ({selectedImages.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 rounded-xl bg-slate-100 px-4 py-3">
          <span className="text-sm text-slate-600">
            <strong className="text-[#1c6e8c]">{images.length}</strong> ảnh
            {data?.totalCount && data.totalCount > images.length && (
              <span className="text-slate-400"> / {data.totalCount} tổng</span>
            )}
          </span>
          {images.length > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleSelectAll}
                className="text-sm font-medium text-[#1c6e8c] transition hover:text-[#124e66]"
              >
                {selectedImages.size === images.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1c6e8c] border-t-transparent"></div>
                <p className="text-sm text-slate-500">Đang tải danh sách ảnh...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <i className="fas fa-exclamation-triangle mb-4 text-4xl text-amber-500"></i>
              <p className="text-sm font-semibold text-slate-700">Không thể tải danh sách ảnh</p>
              <p className="mt-1 text-xs text-slate-500">{(error as Error).message}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <i className="fas fa-images mb-4 text-5xl text-slate-300"></i>
              <p className="text-sm font-semibold text-slate-700">Chưa có ảnh nào</p>
              <p className="mt-1 text-xs text-slate-500">Nhấn &quot;Tải ảnh lên&quot; để bắt đầu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {images.map(image => {
                const isSelected = selectedImages.has(image.publicId);
                return (
                  <div
                    key={image.publicId}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-[#1c6e8c] ring-2 ring-[#1c6e8c]/20' 
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(image.publicId)}
                      className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                        isSelected
                          ? 'border-[#1c6e8c] bg-[#1c6e8c] text-white'
                          : 'border-white/80 bg-white/50 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSelected && <i className="fas fa-check text-xs"></i>}
                    </button>

                    {/* Image */}
                    <div
                      className="aspect-square cursor-pointer overflow-hidden bg-slate-100"
                      onClick={() => setPreviewImage(image.secureUrl)}
                    >
                      <img
                        src={image.secureUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Info overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs font-medium text-white">
                        {image.publicId.split('/').pop()}
                      </p>
                      <p className="text-[10px] text-white/70">
                        {image.width}×{image.height} • {formatBytes(image.bytes)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleCopyUrl(image.secureUrl)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-slate-600 shadow-sm transition hover:bg-white hover:text-[#1c6e8c]"
                        title="Sao chép URL"
                      >
                        <i className="fas fa-link text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(image.publicId)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                        title="Xóa ảnh"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setPreviewImage(null)}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          <img
            src={previewImage}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Flash message */}
      {flash && (
        <div className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${flashTone}`}>
          {flash.message}
        </div>
      )}
    </>
  );
}
