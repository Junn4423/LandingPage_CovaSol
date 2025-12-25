'use client';

import { useMemo } from 'react';
import type { SeasonalTheme, SeasonalDecoration } from '@covasol/types';

interface SeasonalDecorationsProps {
  theme: SeasonalTheme | null;
}

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
  if (!theme || !theme.decorations || theme.decorations.length === 0) {
    return null;
  }

  return (
    <>
      {theme.decorations.map((decoration) => (
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
      `}</style>
    </>
  );
}

export default SeasonalDecorations;
