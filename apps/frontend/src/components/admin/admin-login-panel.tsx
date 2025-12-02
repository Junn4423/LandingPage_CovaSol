'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useLoginMutation } from '@/hooks/admin';
import { ApiError } from '@/lib/api-client';

export function AdminLoginPanel() {
  const { mutateAsync, isPending } = useLoginMutation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await mutateAsync({ username, password });
      setPassword('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Không thể đăng nhập. Vui lòng thử lại.');
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl" style={{ boxShadow: '0 24px 48px rgba(15, 23, 42, 0.16)' }}>
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/assets/img/logo.png"
          alt="COVASOL Logo"
          width={72}
          height={72}
          className="mb-4 rounded-2xl bg-slate-50 p-2"
        />
        <h1 className="text-2xl font-bold text-[#0d1b2a]">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-slate-500">Khu vực dành cho đội ngũ COVASOL.</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f172a]">Tên đăng nhập</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
            value={username}
            onChange={event => setUsername(event.target.value)}
            required
            autoComplete="username"
            placeholder="Nhập tên đăng nhập"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f172a]">Mật khẩu</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
          />
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}
          disabled={isPending}
        >
          <i className="fas fa-shield-alt"></i>
          <span>{isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        Liên hệ CTO để được cấp tài khoản admin mới.
      </p>
    </div>
  );
}
