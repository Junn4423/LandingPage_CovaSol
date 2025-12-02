import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | COVASOL Admin',
    default: 'COVASOL Admin'
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
