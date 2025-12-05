'use client';

import { useCallback, useEffect, useState } from 'react';
import { ImageGalleryModal, type GalleryImage } from '@/components/common/image-gallery-modal';

interface ProductGalleryHandlerProps {
  demoMedia?: GalleryImage[];
  galleryMedia?: GalleryImage[];
}

export function ProductGalleryHandler({ demoMedia = [], galleryMedia = [] }: ProductGalleryHandlerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGallery, setActiveGallery] = useState<GalleryImage[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const openGallery = useCallback((images: GalleryImage[], startIndex = 0) => {
    setActiveGallery(images);
    setInitialIndex(startIndex);
    setIsModalOpen(true);
  }, []);

  const closeGallery = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Attach click handlers to demo stack and gallery images
  useEffect(() => {
    // Handle demo stack button
    const demoButton = document.querySelector('[data-demo-open]');
    if (demoButton && demoMedia.length > 0) {
      const handleDemoClick = () => {
        openGallery(demoMedia, 0);
      };
      demoButton.addEventListener('click', handleDemoClick);
      
      // Cleanup
      return () => {
        demoButton.removeEventListener('click', handleDemoClick);
      };
    }
  }, [demoMedia, openGallery]);

  // Handle gallery media cards
  useEffect(() => {
    const galleryCards = document.querySelectorAll('.preview-media-card');
    
    if (galleryCards.length > 0 && galleryMedia.length > 0) {
      const handlers: Array<{ el: Element; handler: () => void }> = [];
      
      galleryCards.forEach((card, index) => {
        const handler = () => {
          openGallery(galleryMedia, index);
        };
        card.addEventListener('click', handler);
        (card as HTMLElement).style.cursor = 'pointer';
        handlers.push({ el: card, handler });
      });

      return () => {
        handlers.forEach(({ el, handler }) => {
          el.removeEventListener('click', handler);
        });
      };
    }
  }, [galleryMedia, openGallery]);

  return (
    <ImageGalleryModal
      images={activeGallery}
      initialIndex={initialIndex}
      isOpen={isModalOpen}
      onClose={closeGallery}
    />
  );
}
