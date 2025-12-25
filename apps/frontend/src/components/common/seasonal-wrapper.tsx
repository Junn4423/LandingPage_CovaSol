'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSeasonalTheme } from '@/components/providers/seasonal-theme-provider';

// Lazy load seasonal components to avoid impacting initial page load
const SeasonalEffects = dynamic(
  () => import('@/components/common/seasonal-effects').then((mod) => mod.SeasonalEffects),
  { ssr: false, loading: () => null }
);

const SeasonalDecorations = dynamic(
  () => import('@/components/common/seasonal-decorations').then((mod) => mod.SeasonalDecorations),
  { ssr: false, loading: () => null }
);

const SeasonalBanner = dynamic(
  () => import('@/components/common/seasonal-banner').then((mod) => mod.SeasonalBanner),
  { ssr: false, loading: () => null }
);

interface SeasonalWrapperProps {
  showBanner?: boolean;
  showEffects?: boolean;
  showDecorations?: boolean;
}

export function SeasonalWrapper({
  showBanner = true,
  showEffects = true,
  showDecorations = true,
}: SeasonalWrapperProps) {
  const { theme, isLoading } = useSeasonalTheme();
  const [bannerHeight, setBannerHeight] = useState(0);

  // Measure banner height for navbar offset
  useEffect(() => {
    if (!theme || isLoading) {
      setBannerHeight(0);
      document.documentElement.style.setProperty('--seasonal-banner-height', '0px');
      return;
    }
    
    const hasBanner = theme.bannerText || theme.bannerImageUrl;
    if (hasBanner && showBanner) {
      // Wait for banner to render
      const timeout = setTimeout(() => {
        const banner = document.querySelector('.seasonal-banner');
        if (banner) {
          const height = banner.getBoundingClientRect().height;
          setBannerHeight(height);
          document.documentElement.style.setProperty('--seasonal-banner-height', `${height}px`);
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setBannerHeight(0);
      document.documentElement.style.setProperty('--seasonal-banner-height', '0px');
    }
  }, [theme, isLoading, showBanner]);

  // Don't render anything while loading to avoid flash
  if (isLoading) return null;

  // No active theme
  if (!theme) return null;

  return (
    <>
      {/* Banner at the top - positioned in document flow */}
      {showBanner && <SeasonalBanner theme={theme} />}

      {/* Particle effects */}
      {showEffects && <SeasonalEffects theme={theme} />}

      {/* Corner decorations */}
      {showDecorations && <SeasonalDecorations theme={theme} />}

      {/* Inject CSS variables for theme colors */}
      <style jsx global>{`
        :root {
          --seasonal-primary: ${theme.primaryColor};
          --seasonal-secondary: ${theme.secondaryColor};
          --seasonal-accent: ${theme.accentColor || theme.primaryColor};
        }
      `}</style>
    </>
  );
}

export default SeasonalWrapper;
