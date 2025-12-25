/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

export const metadata: Metadata = {
  title: {
    template: '%s | COVA - Solutions',
    default: 'COVA - Solutions'
  },
  description: 'Đối tác công nghệ đáng tin cậy cho doanh nghiệp hiện đại. Chúng tôi phát triển phần mềm, thiết kế trải nghiệm người dùng và hỗ trợ chuyển đổi số toàn diện.',
  keywords: ['Công nghệ', 'Tech', 'Cova', 'Covasol', 'Giải pháp', 'Doanh Nghiệp', 'Thương mại'],
  authors: [{ name: 'COVASOL' }],
  robots: 'index, follow',
  metadataBase: new URL('https://covasol.com.vn'),
  alternates: {
    canonical: '/'
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: { url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180' }
  },
  manifest: '/assets/favicon/site.webmanifest',
  appleWebApp: {
    title: 'CovaSol'
  },
  openGraph: {
    title: 'COVA - Solutions',
    description: 'Đối tác công nghệ đáng tin cậy cho doanh nghiệp hiện đại. Chúng tôi phát triển phần mềm, thiết kế trải nghiệm người dùng và hỗ trợ chuyển đổi số toàn diện.',
    url: 'https://covasol.com.vn/',
    siteName: 'Covasol',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dky6wyvnm/image/upload/v1765512563/quality_restoration_20251212110748919_hvu4af.jpg',
        width: 1200,
        height: 630,
        alt: 'COVA - Solutions',
        type: 'image/jpeg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COVA - Solutions',
    description: 'Đối tác công nghệ đáng tin cậy cho doanh nghiệp hiện đại. Chúng tôi phát triển phần mềm, thiết kế trải nghiệm người dùng và hỗ trợ chuyển đổi số toàn diện.',
    images: ['https://res.cloudinary.com/dky6wyvnm/image/upload/v1765512563/quality_restoration_20251212110748919_hvu4af.jpg']
  },
  other: {
    'theme-color': '#0d500c'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* Explicit Open Graph and Facebook meta tags */}
        <meta property="og:url" content="https://covasol.com.vn/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="COVA - Solutions" />
        <meta property="og:description" content="Đối tác công nghệ đáng tin cậy cho doanh nghiệp hiện đại. Chúng tôi phát triển phần mềm, thiết kế trải nghiệm người dùng và hỗ trợ chuyển đổi số toàn diện." />
        <meta property="og:image" content="https://res.cloudinary.com/dky6wyvnm/image/upload/v1765512563/quality_restoration_20251212110748919_hvu4af.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:site_name" content="Covasol" />
        <meta property="og:locale" content="vi_VN" />
        <meta property="fb:app_id" content="1234567890" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        {/* Critical CSS - Load immediately */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Fonts - Can be deferred */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          media="print"
          // @ts-ignore
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          />
        </noscript>
        {/* AOS - Non-critical, can be deferred */}
        <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" media="print" 
          // @ts-ignore
          onLoad="this.media='all'" />
        <noscript>
          <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" />
        </noscript>
        {/* Legacy CSS from public assets */}
        <link rel="stylesheet" href="/assets/css/variables.css" />
        <link rel="stylesheet" href="/assets/css/base.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/landing/layout-shell.css" />
        <link rel="stylesheet" href="/assets/css/landing/hero.css" />
        <link rel="stylesheet" href="/assets/css/landing/home-sections.css" />
        <link rel="stylesheet" href="/assets/css/landing/blog.css" />
        <link rel="stylesheet" href="/assets/css/landing/blog-yatame.css" />
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
