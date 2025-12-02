import { SiteLayout } from '@/components/layout/site-layout';

export default function SiteGroupLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
