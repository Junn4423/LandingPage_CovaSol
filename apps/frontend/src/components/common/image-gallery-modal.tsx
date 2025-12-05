/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';

export interface GalleryImage {
  url: string;
  caption?: string | null;
}

interface ImageGalleryModalProps {
  images: GalleryImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGalleryModal({ images, initialIndex = 0, isOpen, onClose }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          type="button"
          className="gallery-modal-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <i className="fas fa-times" />
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-modal-nav gallery-modal-prev"
              onClick={handlePrev}
              aria-label="Ảnh trước"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button
              type="button"
              className="gallery-modal-nav gallery-modal-next"
              onClick={handleNext}
              aria-label="Ảnh tiếp"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </>
        )}

        {/* Main image */}
        <div className="gallery-modal-image-wrapper">
          <img
            src={currentImage.url}
            alt={currentImage.caption || `Ảnh ${currentIndex + 1}`}
            className="gallery-modal-image"
          />
        </div>

        {/* Caption & Counter */}
        <div className="gallery-modal-footer">
          {currentImage.caption && (
            <p className="gallery-modal-caption">{currentImage.caption}</p>
          )}
          <div className="gallery-modal-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="gallery-modal-thumbnails">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`gallery-thumbnail ${idx === currentIndex ? 'is-active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
              >
                <img src={img.url} alt={img.caption || `Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
