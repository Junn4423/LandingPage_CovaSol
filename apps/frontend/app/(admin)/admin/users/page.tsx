'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  useAdminSession,
  useAdminUsers,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation
} from '@/hooks/admin';
import type { UserSummary } from '@/types/content';

interface CreateUserFormState {
  username: string;
  password: string;
  displayName: string;
  role: string;
}

interface EditUserFormState {
  displayName: string;
  role: string;
  password: string;
}

const createFormDefault: CreateUserFormState = {
  username: '',
  password: '',
  displayName: '',
  role: 'ADMIN'
};

const editFormDefault: EditUserFormState = {
  displayName: '',
  role: 'ADMIN',
  password: ''
};

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useAdminUsers();
  const { data: currentUser } = useAdminSession();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserFormState>(createFormDefault);
  const [editForm, setEditForm] = useState<EditUserFormState>(editFormDefault);

  useEffect(() => {
    if (!selectedUser) {
      setEditForm(editFormDefault);
      return;
    }
    setEditForm({
      displayName: selectedUser.displayName ?? '',
      role: selectedUser.role,
      password: ''
    });
  }, [selectedUser]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createMutation.mutateAsync({
      username: createForm.username,
      password: createForm.password,
      displayName: createForm.displayName || undefined,
      role: createForm.role || undefined
    });
    setCreateForm(createFormDefault);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    await updateMutation.mutateAsync({
      id: selectedUser.id,
      displayName: editForm.displayName || undefined,
      role: editForm.role || undefined,
      password: editForm.password || undefined
    });
    setSelectedUser(null);
  }

  async function handleDelete(user: UserSummary) {
    if (currentUser && user.id === currentUser.id) {
      alert('Không thể xoá tài khoản đang đăng nhập.');
      return;
    }
    if (!window.confirm(`Xoá tài khoản ${user.username}?`)) {
      return;
    }
    await deleteMutation.mutateAsync(user.id);
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500">Đồng bộ danh sách admin và phân quyền.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Danh sách người dùng ({users?.length ?? 0})</p>
          {isLoading ? <p className="text-xs text-slate-500">Đang tải...</p> : null}
        </div>
        {error ? <p className="text-sm text-red-600">Không thể tải danh sách người dùng.</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Tên đăng nhập</th>
                <th className="px-3 py-2">Tên hiển thị</th>
                <th className="px-3 py-2">Vai trò</th>
                <th className="px-3 py-2">Cập nhật</th>
                <th className="px-3 py-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map(user => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-semibold text-slate-900">{user.username}</td>
                  <td className="px-3 py-2 text-sm text-slate-600">{user.displayName || '—'}</td>
                  <td className="px-3 py-2 text-sm text-slate-600">{user.role}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{new Date(user.updatedAt).toLocaleString('vi-VN')}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-white"
                        onClick={() => setSelectedUser(user)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleDelete(user)}
                        disabled={deleteMutation.isPending || (currentUser ? currentUser.id === user.id : false)}
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tạo tài khoản mới</h2>
          <p className="text-xs text-slate-500">API `/v1/users` với JWT session.</p>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Tên đăng nhập
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={createForm.username}
                onChange={event => setCreateForm(prev => ({ ...prev, username: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Mật khẩu
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={createForm.password}
                onChange={event => setCreateForm(prev => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Tên hiển thị
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={createForm.displayName}
                onChange={event => setCreateForm(prev => ({ ...prev, displayName: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Vai trò
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={createForm.role}
                onChange={event => setCreateForm(prev => ({ ...prev, role: event.target.value }))}
                placeholder="ADMIN"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
            {createMutation.isError ? <p className="text-sm text-red-600">Không thể tạo người dùng.</p> : null}
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Cập nhật thông tin</h2>
          <p className="text-xs text-slate-500">Chọn người dùng bên trái để chỉnh sửa.</p>
          <form onSubmit={handleUpdate} className="mt-4 space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Tên hiển thị
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={editForm.displayName}
                onChange={event => setEditForm(prev => ({ ...prev, displayName: event.target.value }))}
                disabled={!selectedUser}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Vai trò
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={editForm.role}
                onChange={event => setEditForm(prev => ({ ...prev, role: event.target.value }))}
                disabled={!selectedUser}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Đặt lại mật khẩu (tuỳ chọn)
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={editForm.password}
                onChange={event => setEditForm(prev => ({ ...prev, password: event.target.value }))}
                disabled={!selectedUser}
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!selectedUser || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              {selectedUser ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-primary"
                  onClick={() => setSelectedUser(null)}
                >
                  Huỷ chọn
                </button>
              ) : null}
            </div>
            {updateMutation.isError ? <p className="text-sm text-red-600">Không thể cập nhật người dùng.</p> : null}
          </form>
        </div>
      </section>
    </div>
  );
}
