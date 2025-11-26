'use client';

import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { AdminLoginPanel } from '@/components/admin/admin-login-panel';
import { ApiError } from '@/lib/api-client';
import { useAdminSession, useLogoutMutation } from '@/hooks/admin';

const adminNav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/blog', label: 'Blog Editor' },
  { href: '/admin/products', label: 'Product Editor' },
  { href: '/admin/users', label: 'User Management' }
];

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useAdminSession();
  const logoutMutation = useLogoutMutation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Đang tải thông tin admin...</p>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 401) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <AdminLoginPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <p className="text-sm font-semibold text-red-600">Không thể tải thông tin admin.</p>
        <p className="mt-2 text-xs text-slate-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <p className="text-lg font-semibold text-slate-900">COVASOL Admin</p>
        <nav className="mt-8 flex flex-col gap-2 text-sm font-medium text-slate-600">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 ${
                item.href === '/admin'
                  ? pathname === '/admin'
                    ? 'bg-slate-900 text-white'
                    : 'hover:bg-slate-100'
                  : pathname?.startsWith(item.href)
                    ? 'bg-slate-900 text-white'
                    : 'hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 px-4 py-6">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Đang đăng nhập</p>
            <p className="text-sm font-semibold text-slate-900">{user?.displayName || user?.username || 'Admin'}</p>
          </div>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
