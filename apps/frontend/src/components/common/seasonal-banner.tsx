'use client';

import type { SeasonalTheme } from '@covasol/types';

interface SeasonalBannerProps {
  theme: SeasonalTheme | null;
}

export function SeasonalBanner({ theme }: SeasonalBannerProps) {
  if (!theme) return null;
  if (!theme.bannerText && !theme.bannerImageUrl) return null;

  const content = (
    <div className="flex items-center justify-center gap-2 px-4 py-1.5">
      {theme.bannerImageUrl && (
        <img
          src={theme.bannerImageUrl}
          alt=""
          className="h-4 w-4 object-contain"
          loading="lazy"
        />
      )}
      {theme.bannerText && (
        <span className="text-xs font-medium tracking-wide text-white/95 sm:text-sm">
          {theme.bannerText}
        </span>
      )}
      {theme.bannerLink && (
        <svg className="h-3 w-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  return (
    <div
      className="seasonal-banner fixed left-0 right-0 top-0 z-[1001] w-full overflow-hidden text-center"
      style={{
        background: `linear-gradient(90deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
      }}
    >
      {theme.bannerLink ? (
        <a
          href={theme.bannerLink}
          className="block transition-opacity hover:opacity-90"
        >
          {content}
        </a>
      ) : (
        content
      )}

      {/* Subtle shimmer effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="shimmer-effect" />
      </div>

      <style jsx>{`
        .shimmer-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
}

export default SeasonalBanner;
