"use client";

import { useState } from 'react';

interface FeaturedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = '/assets/logo_whvxwb/logo_whvxwb_c_scale,w_438.png';

export function FeaturedImage({ src, alt, className, fallbackSrc }: FeaturedImageProps) {
  const safeFallback = fallbackSrc || DEFAULT_FALLBACK;
  const [currentSrc, setCurrentSrc] = useState(src || safeFallback);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== safeFallback) {
          setCurrentSrc(safeFallback);
        }
      }}
    />
  );
}
