/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

export const metadata: Metadata = {
  title: {
    template: '%s | COVASOL Technology Solutions',
    default: 'COVASOL Technology Solutions'
  },
  description: 'Core Value. Smart Solutions. Dịch vụ tư vấn và triển khai giải pháp chuyển đổi số toàn diện.',
  metadataBase: new URL('https://covasol.com.vn'),
  icons: {
    icon: [
      { url: '/assets/favicon/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    shortcut: '/assets/favicon/favicon.ico',
    apple: { url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180' }
  },
  manifest: '/assets/favicon/site.webmanifest',
  appleWebApp: {
    title: 'CovaSol'
  }
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
        {/* Full favicon set */}
        <link rel="icon" type="image/png" href="/assets/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/assets/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="CovaSol" />
        <link rel="manifest" href="/assets/favicon/site.webmanifest" />
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
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
