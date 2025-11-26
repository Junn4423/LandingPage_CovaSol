'use client';

import { FormEvent, useState } from 'react';
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
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">COVASOL Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Nhập thông tin tài khoản admin để tiếp tục.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            value={username}
            onChange={event => setUsername(event.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-400">Liên hệ CTO để cấp tài khoản admin mới.</p>
    </div>
  );
}
