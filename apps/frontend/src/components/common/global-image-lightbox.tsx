'use client';

import { useCallback, useEffect, useState } from 'react';

interface LightboxState {
  isOpen: boolean;
  src: string;
  alt: string;
}

export function GlobalImageLightbox() {
  const [state, setState] = useState<LightboxState>({
    isOpen: false,
    src: '',
    alt: ''
  });

  const closeLightbox = useCallback(() => {
    setState({ isOpen: false, src: '', alt: '' });
  }, []);

  // Global click handler for images
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is an image
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        
        // Skip small images (icons, logos, avatars)
        if (img.naturalWidth < 100 || img.naturalHeight < 100) return;
        
        // Skip images with data-no-lightbox attribute
        if (img.hasAttribute('data-no-lightbox')) return;
        
        // Skip images inside buttons or nav
        if (img.closest('button, nav, .nav-logo, .loading-screen, .gallery-modal-overlay')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        setState({
          isOpen: true,
          src: img.src,
          alt: img.alt || 'Ảnh phóng to'
        });
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleImageClick, true);

    return () => {
      document.removeEventListener('click', handleImageClick, true);
    };
  }, []);

  // Keyboard handler
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [state.isOpen, closeLightbox]);

  if (!state.isOpen) return null;

  return (
    <div className="global-lightbox-overlay" onClick={closeLightbox}>
      <button
        type="button"
        className="global-lightbox-close"
        onClick={closeLightbox}
        aria-label="Đóng"
      >
        <i className="fas fa-times" />
      </button>
      
      <div className="global-lightbox-content" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={state.src}
          alt={state.alt}
          className="global-lightbox-image"
        />
        {state.alt && state.alt !== 'Ảnh phóng to' && (
          <p className="global-lightbox-caption">{state.alt}</p>
        )}
      </div>
      
      <p className="global-lightbox-hint">Nhấn ESC hoặc click để đóng</p>
    </div>
  );
}
