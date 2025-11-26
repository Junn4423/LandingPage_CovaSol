import Link from 'next/link';

const navItems = [
  { href: '/products', label: 'Sản phẩm' },
  { href: '/blog', label: 'Blog' },
  { href: '/#solutions', label: 'Giải pháp' },
  { href: '/#contact', label: 'Liên hệ' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-brand-primary">
          COVASOL
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="hover:text-brand-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
