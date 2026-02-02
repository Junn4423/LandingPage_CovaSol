'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PropsWithChildren, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminLoginPanel } from '@/components/admin/admin-login-panel';
import { ApiError } from '@/lib/api-client';
import { normalizeImageUrl } from '@/lib/image-url';
import { useAdminSession, useLogoutMutation, useAdminOverview, useMyPostsEditRequests, usePendingComments } from '@/hooks/admin';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: 'fas fa-home',
    items: [
      { href: '/admin', label: 'Dashboard', icon: 'fas fa-gauge' },
      { href: '/admin/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
      { href: '/admin/system-logs', label: 'Nhật ký hệ thống', icon: 'fas fa-shield-alt' }
    ]
  },
  {
    id: 'content',
    label: 'Nội dung',
    icon: 'fas fa-file-alt',
    items: [
      { href: '/admin/blog', label: 'Blog', icon: 'fas fa-newspaper' },
      { href: '/admin/comments', label: 'Bình luận', icon: 'fas fa-comments' },
      { href: '/admin/edit-requests', label: 'Duyệt chỉnh sửa', icon: 'fas fa-clipboard-check' }
    ]
  },
  {
    id: 'store',
    label: 'Cửa hàng',
    icon: 'fas fa-store',
    items: [
      { href: '/admin/products', label: 'Sản phẩm', icon: 'fas fa-cubes' },
      { href: '/admin/reviews', label: 'Đánh giá', icon: 'fas fa-star' }
    ]
  },
  {
    id: 'media',
    label: 'Media & Giao diện',
    icon: 'fas fa-palette',
    items: [
      { href: '/admin/album', label: 'Album ảnh', icon: 'fas fa-images' },
      { href: '/admin/seasonal-themes', label: 'Giao diện Mùa', icon: 'fas fa-snowflake' }
    ]
  },
  {
    id: 'users',
    label: 'Người dùng',
    icon: 'fas fa-users-cog',
    items: [
      { href: '/admin/users', label: 'Quản lý Users', icon: 'fas fa-users' },
      { href: '/admin/newsletter', label: 'Newsletter', icon: 'fas fa-envelope-open-text' }
    ]
  }
];

const ADMIN_LOGO = normalizeImageUrl('/assets/img/logo.png', { fallback: '/assets/img/logo.png' });

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useAdminSession();
  const logoutMutation = useLogoutMutation();
  const { refetch, isFetching } = useAdminOverview();
  const { data: editRequests = [] } = useMyPostsEditRequests();
  const { data: pendingComments = [] } = usePendingComments();
  
  // Track expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Auto-expand groups based on current path
    const initial = new Set<string>();
    adminNavGroups.forEach(group => {
      if (group.items.some(item => isActivePath(pathname, item.href))) {
        initial.add(group.id);
      }
    });
    // Always expand dashboard by default
    initial.add('dashboard');
    return initial;
  });
  
  // Count pending edit requests and comments
  const pendingEditCount = editRequests.filter(r => r.status === 'pending').length;
  const pendingCommentCount = pendingComments.length;

  function isActivePath(currentPath: string | null, href: string) {
    if (!currentPath) return false;
    if (href === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(href);
  }

  function toggleGroup(groupId: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  function getBadgeCount(href: string): number {
    if (href === '/admin/edit-requests') return pendingEditCount;
    if (href === '/admin/comments') return pendingCommentCount;
    return 0;
  }

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

  return (
    <div className="grid h-screen grid-cols-[280px_1fr] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex h-full min-h-0 flex-col gap-6 overflow-hidden p-6 text-white/90" style={{ background: 'linear-gradient(160deg, #0d1b2a, #124e66)' }}>
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
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

        {/* Scrollable Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {adminNavGroups.map(group => {
            const isExpanded = expandedGroups.has(group.id);
            const hasActiveItem = group.items.some(item => isActivePath(pathname, item.href));
            const groupBadgeTotal = group.items.reduce((acc, item) => acc + getBadgeCount(item.href), 0);
            
            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 font-semibold transition-all duration-200 ${
                    hasActiveItem ? 'bg-white/15' : 'bg-white/[0.05] hover:bg-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${group.icon} w-5 text-center text-sm opacity-80`}></i>
                    <span className="text-sm">{group.label}</span>
                    {groupBadgeTotal > 0 && !isExpanded && (
                      <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {groupBadgeTotal}
                      </span>
                    )}
                  </div>
                  <i className={`fas fa-chevron-down text-[10px] opacity-60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Group Items */}
                <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="ml-3 space-y-1 border-l border-white/10 pl-3 pt-1">
                    {group.items.map(item => {
                      const isActive = isActivePath(pathname, item.href);
                      const badgeCount = getBadgeCount(item.href);
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'text-white/70 hover:bg-white/[0.1] hover:text-white'
                          }`}
                        >
                          <i className={`${item.icon} w-4 text-center text-xs`}></i>
                          <span className="flex-1">{item.label}</span>
                          {badgeCount > 0 && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              item.href === '/admin/comments' ? 'bg-red-500' : 'bg-amber-500'
                            } text-white`}>
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Meta Actions */}
        <div className="flex-shrink-0 flex flex-col gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-white/20 disabled:opacity-50"
          >
            <i className={`fas fa-sync-alt w-4 text-center ${isFetching ? 'animate-spin' : ''}`}></i>
            <span>{isFetching ? 'Đang đồng bộ...' : 'Làm mới dữ liệu'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex h-full min-h-0 flex-col gap-8 overflow-hidden p-8" style={{ background: 'linear-gradient(180deg, rgba(232, 240, 247, 0.65), rgba(255, 255, 255, 0.9))' }}>
        {/* Header */}
        <header className="flex items-center justify-between flex-shrink-0">
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
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
