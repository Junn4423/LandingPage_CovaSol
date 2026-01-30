'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { SeasonalTheme, SeasonalDecoration } from '@covasol/types';

interface SeasonalDecorationsProps {
  theme: SeasonalTheme | null;
}

// Hook to detect if user has scrolled past hero section
function useScrollPastHero({ forceVisible = false }: { forceVisible?: boolean }) {
  const [isPastHero, setIsPastHero] = useState(forceVisible);

  useEffect(() => {
    if (forceVisible) {
      setIsPastHero(true);
      return;
    }

    const handleScroll = () => {
      // Hero section is typically 100vh, so we check if scrolled past ~80% of viewport height
      const heroThreshold = window.innerHeight * 0.8;
      setIsPastHero(window.scrollY > heroThreshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceVisible]);

  return isPastHero;
}

// DecorationItem component for corner and floating decorations
function DecorationItem({ decoration }: { decoration: SeasonalDecoration }) {
  const positionClasses = useMemo(() => {
    switch (decoration.position) {
      case 'top-left':
        return 'top-16 left-0';
      case 'top-right':
        return 'top-16 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      default:
        return '';
    }
  }, [decoration.position]);

  const sizeClasses = useMemo(() => {
    switch (decoration.size) {
      case 'small':
        return 'w-16 h-16 md:w-20 md:h-20';
      case 'large':
        return 'w-32 h-32 md:w-40 md:h-40';
      default:
        return 'w-24 h-24 md:w-28 md:h-28';
    }
  }, [decoration.size]);

  const animationClasses = useMemo(() => {
    switch (decoration.animation) {
      case 'swing':
        return 'animate-swing';
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      case 'shake':
        return 'animate-shake';
      default:
        return '';
    }
  }, [decoration.animation]);

  if (decoration.type !== 'corner' && decoration.type !== 'floating') {
    return null;
  }

  const content = (
    <img
      src={decoration.imageUrl}
      alt={decoration.altText || ''}
      className={`object-contain ${sizeClasses} ${animationClasses}`}
      loading="lazy"
    />
  );

  return (
    <div
      className={`pointer-events-auto fixed z-[9997] ${positionClasses}`}
      style={{ isolation: 'isolate' }}
    >
      {decoration.link ? (
        <a href={decoration.link} className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export function SeasonalDecorations({ theme }: SeasonalDecorationsProps) {
  const pathname = usePathname();
  // Blog & product pages: always show couplets (no hide-on-hero behavior)
  const isContentPage = pathname?.startsWith('/blog') || pathname?.startsWith('/products');
  const isPastHero = useScrollPastHero({ forceVisible: Boolean(isContentPage) });

  if (!theme || !theme.decorations || theme.decorations.length === 0) {
    return null;
  }

  const couplets = theme.decorations.filter(d => d.type === 'couplet');
  const otherDecorations = theme.decorations.filter(d => d.type !== 'couplet');

  // Group couplets by side (left/right)
  const leftCouplets = couplets.filter(d => d.position === 'side-left');
  const rightCouplets = couplets.filter(d => d.position === 'side-right');

  return (
    <>
      {/* Left side couplets - hidden until scroll past hero (except blog/product) */}
      {leftCouplets.map((decoration) => {
        const width = decoration.width || 180;
        const content = (
          <img
            src={decoration.imageUrl}
            alt={decoration.altText || ''}
            className="block w-full h-auto"
            loading="lazy"
          />
        );

        return (
          <div
            key={decoration.id}
            className={`homenest-tet-left ${isPastHero ? 'couplet-visible' : 'couplet-hidden-left'}`}
            style={{
              position: 'fixed',
              top: '100px',
              left: 0,
              width: `${width}px`,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {decoration.link ? (
              <a href={decoration.link} className="block pointer-events-auto">
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}

      {/* Right side couplets - hidden until scroll past hero, then slide in */}
      {rightCouplets.map((decoration) => {
        const width = decoration.width || 180;
        const content = (
          <img
            src={decoration.imageUrl}
            alt={decoration.altText || ''}
            className="block w-full h-auto"
            loading="lazy"
          />
        );

        return (
          <div
            key={decoration.id}
            className={`homenest-tet-right ${isPastHero ? 'couplet-visible' : 'couplet-hidden-right'}`}
            style={{
              position: 'fixed',
              top: '100px',
              right: 0,
              width: `${width}px`,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {decoration.link ? (
              <a href={decoration.link} className="block pointer-events-auto">
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}

      {/* Other decorations */}
      {otherDecorations.map((decoration) => (
        <DecorationItem key={decoration.id} decoration={decoration} />
      ))}

      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-swing {
          animation: swing 3s ease-in-out infinite;
          transform-origin: top center;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        
        /* Couplet slide-in animations */
        .homenest-tet-left,
        .homenest-tet-right {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }
        
        /* Hidden state - slide out of view */
        .couplet-hidden-left {
          transform: translateX(-110%);
          opacity: 0;
        }
        .couplet-hidden-right {
          transform: translateX(110%);
          opacity: 0;
        }
        
        /* Visible state - slide into view */
        .couplet-visible {
          transform: translateX(0);
          opacity: 1;
        }
        
        /* Hover effect - slide more inward to avoid blocking content */
        .homenest-tet-left.couplet-visible:hover {
          transform: translateX(-65%);
        }
        
        .homenest-tet-right.couplet-visible:hover {
          transform: translateX(65%);
        }
        
        /* Make couplets interactive for hover */
        .homenest-tet-left,
        .homenest-tet-right {
          pointer-events: auto !important;
        }
        
        /* Câu đối (Tết couplets) - hide on smaller screens */
        @media (max-width: 1524px) {
          .homenest-tet-left,
          .homenest-tet-right {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default SeasonalDecorations;
