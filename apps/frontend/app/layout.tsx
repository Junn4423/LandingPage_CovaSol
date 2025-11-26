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
      <body>
        <AppProviders>
          <SiteLayout>{children}</SiteLayout>
        </AppProviders>
      </body>
    </html>
  );
}
