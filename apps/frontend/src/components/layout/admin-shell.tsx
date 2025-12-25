'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { AdminLoginPanel } from '@/components/admin/admin-login-panel';
import { ApiError } from '@/lib/api-client';
import { normalizeImageUrl } from '@/lib/image-url';
import { useAdminSession, useLogoutMutation, useAdminOverview, useMyPostsEditRequests } from '@/hooks/admin';

const adminNav: { href: string; label: string; icon: string }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'fas fa-gauge' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
  { href: '/admin/system-logs', label: 'Nhật ký hệ thống', icon: 'fas fa-shield-alt' },
  { href: '/admin/seasonal-themes', label: 'Giao diện Mùa', icon: 'fas fa-snowflake' },
  { href: '/admin/blog', label: 'Blog', icon: 'fas fa-newspaper' },
  { href: '/admin/edit-requests', label: 'Duyệt chỉnh sửa', icon: 'fas fa-clipboard-check' },
  { href: '/admin/products', label: 'Sản phẩm', icon: 'fas fa-cubes' },
  { href: '/admin/album', label: 'Album ảnh', icon: 'fas fa-images' },
  { href: '/admin/reviews', label: 'Đánh giá', icon: 'fas fa-star' },
  { href: '/admin/users', label: 'Người dùng', icon: 'fas fa-users' }
];

const ADMIN_LOGO = normalizeImageUrl('/assets/img/logo.png', { fallback: '/assets/img/logo.png' });

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useAdminSession();
  const logoutMutation = useLogoutMutation();
  const { refetch, isFetching } = useAdminOverview();
  const { data: editRequests = [] } = useMyPostsEditRequests();
  
  // Count pending edit requests
  const pendingEditCount = editRequests.filter(r => r.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(232, 240, 247, 0.65), rgba(255, 255, 255, 0.9))' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent"></div>
          <p className="text-sm text-slate-500">Đang tải thông tin admin...</p>
        </div>
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 401) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, rgba(232, 240, 247, 0.65), rgba(255, 255, 255, 0.9))' }}>
        <AdminLoginPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ background: 'linear-gradient(180deg, rgba(232, 240, 247, 0.65), rgba(255, 255, 255, 0.9))' }}>
        <p className="text-sm font-semibold text-red-600">Không thể tải thông tin admin.</p>
        <p className="mt-2 text-xs text-slate-500">{(error as Error).message}</p>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <div className="grid h-screen grid-cols-[280px_1fr] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex h-full min-h-0 flex-col gap-8 overflow-y-auto p-6 text-white/90" style={{ background: 'linear-gradient(160deg, #0d1b2a, #124e66)' }}>
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image
            src={ADMIN_LOGO}
            alt="COVASOL Logo"
            width={44}
            height={44}
            className="rounded-xl bg-white/10 p-1.5"
          />
          <div>
            <span className="block text-xs uppercase tracking-widest opacity-70">COVASOL</span>
            <strong className="text-base font-semibold">Quản trị</strong>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href as any}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-white/20 -translate-y-0.5'
                  : 'bg-white/[0.08] hover:bg-white/[0.18] hover:-translate-y-0.5'
              }`}
            >
              <i className={`${item.icon} w-5 text-center`}></i>
              <span className="flex-1">{item.label}</span>
              {item.href === '/admin/edit-requests' && pendingEditCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                  {pendingEditCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Meta Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-semibold transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <i className={`fas fa-sync-alt w-5 text-center ${isFetching ? 'animate-spin' : ''}`}></i>
            <span>{isFetching ? 'Đang đồng bộ...' : 'Làm mới dữ liệu'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex h-full min-h-0 flex-col gap-8 overflow-hidden p-8" style={{ background: 'linear-gradient(180deg, rgba(232, 240, 247, 0.65), rgba(255, 255, 255, 0.9))' }}>
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#1c6e8c]">Bảng điều khiển</p>
            <h1 className="text-2xl font-bold text-[#0d1b2a]">Quản trị nội bộ</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-600">{user?.displayName || user?.username || 'Admin'}</span>
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>{logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
