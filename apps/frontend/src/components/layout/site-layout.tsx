import { PropsWithChildren, Suspense } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { LegacyNavbar } from './legacy-navbar';
import { LegacyFooter } from './legacy-footer';
import { SeasonalThemeProvider } from '@/components/providers/seasonal-theme-provider';

// Defer non-critical, client-only widgets to trim the initial JS payload
const FloatingPanels = dynamic(() => import('./floating-panels').then(mod => mod.FloatingPanels), {
  ssr: false,
  loading: () => null
});

const BackToTopButton = dynamic(() => import('./back-to-top').then(mod => mod.BackToTopButton), {
  ssr: false,
  loading: () => null
});

const GlobalImageLightbox = dynamic(
  () => import('@/components/common/global-image-lightbox').then(mod => mod.GlobalImageLightbox),
  { ssr: false, loading: () => null }
);

const VisitTracker = dynamic(() => import('@/components/common/visit-tracker').then(mod => mod.VisitTracker), {
  ssr: false,
  loading: () => null
});

const CookieConsentBanner = dynamic(
  () => import('@/components/common/cookie-consent').then(mod => mod.CookieConsentBanner),
  { ssr: false, loading: () => null }
);

const SeasonalWrapper = dynamic(
  () => import('@/components/common/seasonal-wrapper').then(mod => mod.SeasonalWrapper),
  { ssr: false, loading: () => null }
);

function FooterFallback() {
  return <div className="footer placeholder" aria-hidden="true" />;
}

export function SiteLayout({ children }: PropsWithChildren) {
  return (
    <SeasonalThemeProvider>
      <div className="legacy-shell" data-nav-current="home">
        <SeasonalWrapper showBanner={true} showEffects={true} showDecorations={true} />
        <LegacyNavbar />
        <main>{children}</main>
        <Suspense fallback={<FooterFallback />}>
          <LegacyFooter />
        </Suspense>
        <FloatingPanels />
        <BackToTopButton />
        <GlobalImageLightbox />
        <VisitTracker />
        <CookieConsentBanner />

        <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
        <Script src="/assets/js/translations.js" strategy="afterInteractive" />
        <Script src="/assets/js/config.js" strategy="afterInteractive" />
        <Script src="/assets/js/data-service.js" strategy="afterInteractive" />
        <Script src="/assets/js/script.js" strategy="afterInteractive" />
      </div>
    </SeasonalThemeProvider>
  );
}
