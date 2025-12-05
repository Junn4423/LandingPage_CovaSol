'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Hiện nút khi scroll xuống 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      type="button" 
      className={clsx('scroll-top-fab', { visible: isVisible })}
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
    >
      <i className="fas fa-chevron-up" aria-hidden="true" />
    </button>
  );
}
