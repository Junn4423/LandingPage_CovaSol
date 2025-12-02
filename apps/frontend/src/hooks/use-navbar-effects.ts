'use client';

import { useCallback, useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 100;
const SECTION_OFFSET = 100;

export function useNavbarEffects() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      
      // Active nav link highlighting based on scroll position (like original JS)
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + SECTION_OFFSET;
      
      let foundActive: string | null = null;
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          foundActive = sectionId;
        }
      });
      
      setActiveSection(foundActive);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.toggle('nav-open', isMenuOpen);
    return () => document.body.classList.remove('nav-open');
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return {
    isMenuOpen,
    isScrolled,
    activeSection,
    toggleMenu,
    closeMenu
  } as const;
}
