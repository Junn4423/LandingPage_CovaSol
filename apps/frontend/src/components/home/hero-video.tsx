'use client';

import { useEffect, useRef } from 'react';

interface HeroVideoProps {
  src: string;
  className?: string;
}

export function HeroVideo({ src, className = '' }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays on mount
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay failed, likely due to browser policy
        console.log('Video autoplay prevented by browser');
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/assets/img/hero-poster.jpg"
    >
      <source src={src} type="video/webm" />
      Trình duyệt của bạn không hỗ trợ video.
    </video>
  );
}
