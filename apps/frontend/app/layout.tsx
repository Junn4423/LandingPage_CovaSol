/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import { SiteLayout } from '@/components/layout/site-layout';
import { AppProviders } from '@/components/providers/app-providers';

export const metadata: Metadata = {
  title: {
    template: '%s | COVASOL Technology Solutions',
    default: 'COVASOL Technology Solutions'
  },
  description: 'Core Value. Smart Solutions. Dịch vụ tư vấn và triển khai giải pháp chuyển đổi số toàn diện.',
  metadataBase: new URL('https://covasol.top')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" />
        {/* Legacy CSS from public assets */}
        <link rel="stylesheet" href="/assets/css/variables.css" />
        <link rel="stylesheet" href="/assets/css/base.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/landing/layout-shell.css" />
        <link rel="stylesheet" href="/assets/css/landing/hero.css" />
        <link rel="stylesheet" href="/assets/css/landing/home-sections.css" />
        <link rel="stylesheet" href="/assets/css/landing/blog.css" />
        <link rel="stylesheet" href="/assets/css/landing/products.css" />
        <link rel="stylesheet" href="/assets/css/landing/detail-pages.css" />
        <link rel="stylesheet" href="/assets/css/landing/responsive.css" />
        <link rel="stylesheet" href="/assets/css/detail-preview.css" />
      </head>
      <body>
        <AppProviders>
          <SiteLayout>{children}</SiteLayout>
        </AppProviders>
      </body>
    </html>
  );
}
