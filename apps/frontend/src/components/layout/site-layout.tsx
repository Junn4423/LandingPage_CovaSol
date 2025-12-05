import { PropsWithChildren } from 'react';
import Script from 'next/script';
import { LegacyNavbar } from './legacy-navbar';
import { LegacyFooter } from './legacy-footer';
import { FloatingContactFab } from './floating-contact';
import { BackToTopButton } from './back-to-top';
import { LoadingScreen } from './loading-screen';
import { GlobalImageLightbox } from '@/components/common/global-image-lightbox';

export function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="legacy-shell" data-nav-current="home">
      <LoadingScreen />
      <LegacyNavbar />
      <main>{children}</main>
      <LegacyFooter />
      <FloatingContactFab />
      <BackToTopButton />
      <GlobalImageLightbox />

      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="/assets/js/translations.js" strategy="afterInteractive" />
      <Script src="/assets/js/config.js" strategy="afterInteractive" />
      <Script src="/assets/js/data-service.js" strategy="afterInteractive" />
      <Script src="/assets/js/script.js" strategy="afterInteractive" />
    </div>
  );
}
