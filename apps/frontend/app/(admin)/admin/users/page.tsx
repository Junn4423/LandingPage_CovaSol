'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PaginationControls } from '@/components/admin/pagination-controls';
import { ImageSelector } from '@/components/admin/image-selector';
import {
  useAdminSession,
  useAdminUsers,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation
} from '@/hooks/admin';
import { useClientPagination } from '@/hooks/use-pagination';
import type { UserSummary } from '@/types/content';

interface CreateUserFormState {
  username: string;
  password: string;
  displayName: string;
  role: string;
  avatar: string;
}

interface EditUserFormState {
  displayName: string;
  role: string;
  password: string;
  avatar: string;
}

const createFormDefault: CreateUserFormState = {
  username: '',
  password: '',
  displayName: '',
  role: 'ADMIN',
  avatar: ''
};

const editFormDefault: EditUserFormState = {
  displayName: '',
  role: 'ADMIN',
  password: '',
  avatar: ''
};

const USER_PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useAdminUsers();
  const { data: currentUser } = useAdminSession();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserFormState>(createFormDefault);
  const [editForm, setEditForm] = useState<EditUserFormState>(editFormDefault);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const pagination = useClientPagination(users ?? [], { pageSize: USER_PAGE_SIZE });
  const visibleUsers = pagination.items;

  useEffect(() => {
    if (!selectedUser) {
      setEditForm(editFormDefault);
      return;
    }
    setEditForm({
      displayName: selectedUser.displayName ?? '',
      role: selectedUser.role,
      password: '',
      avatar: selectedUser.avatar ?? ''
    });
  }, [selectedUser]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createMutation.mutateAsync({
      username: createForm.username,
      password: createForm.password,
      displayName: createForm.displayName || undefined,
      role: createForm.role || undefined,
      avatar: createForm.avatar || undefined
    });
    setCreateForm(createFormDefault);
    setShowCreateModal(false);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    const avatarValue = editForm.avatar?.trim() ? editForm.avatar.trim() : null;
    await updateMutation.mutateAsync({
      id: selectedUser.id,
      displayName: editForm.displayName || undefined,
      role: isSuperAdmin ? (editForm.role || undefined) : undefined,
      password: editForm.password || undefined,
      avatar: avatarValue
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
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Quản lý người dùng</h2>
          <p className="mt-1 text-slate-500">
            {isSuperAdmin 
              ? 'Phân quyền và quản lý tài khoản quản trị.' 
              : 'Chỉnh sửa thông tin cá nhân của bạn.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#124e66]/10 px-4 py-2 text-sm font-semibold text-[#1c6e8c]">
            {pagination.totalItems} người dùng
          </span>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}
            >
              <i className="fas fa-user-plus"></i>
              <span>Thêm người dùng</span>
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải danh sách người dùng.</p>
        </div>
      ) : null}

      {/* Table */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-lg" style={{ boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#124e66]/[0.08]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">ID</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Avatar</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Tên đăng nhập</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Tên hiển thị</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Vai trò</th>
                <th className="px-5 py-4 text-left text-sm font-bold text-[#0d1b2a]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1c6e8c] border-t-transparent"></div>
                      <span>Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : pagination.totalItems === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {isSuperAdmin 
                      ? 'Chưa có người dùng nào. Nhấn "Thêm người dùng" để bắt đầu.'
                      : 'Không có dữ liệu.'}
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user, index) => (
                  <tr key={user.id} className="border-t border-slate-100 transition-colors hover:bg-[#124e66]/[0.02]">
                    <td className="px-5 py-4 text-sm text-slate-600">{pagination.startIndex + index}</td>
                    <td className="px-5 py-4">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.displayName || user.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#124e66]/10 text-sm font-bold text-[#124e66]">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#0d1b2a]">{user.username}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.displayName || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                        >
                          <i className="fas fa-edit"></i>
                          Sửa
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deleteMutation.isPending || (currentUser ? currentUser.id === user.id : false)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <i className="fas fa-trash"></i>
                            Xoá
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          start={pagination.startIndex}
          end={pagination.endIndex}
          total={pagination.totalItems}
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPrev={pagination.goToPrev}
          onNext={pagination.goToNext}
          isLoading={isLoading}
          className="border-t border-slate-100 bg-white px-5 py-3"
        />
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b2a]/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#124e66]/[0.08] px-6 py-4">
              <h3 className="text-lg font-bold text-[#0d1b2a]">Cập nhật người dùng</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4 p-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Avatar</label>
                <div className="flex items-start gap-4">
                  {editForm.avatar ? (
                    <img
                      src={editForm.avatar}
                      alt="Avatar"
                      className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#124e66]/10 text-xl font-bold text-[#124e66]">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2">
                    <ImageSelector
                      value={editForm.avatar}
                      onChange={(url) => setEditForm(prev => ({ ...prev, avatar: url }))}
                      placeholder="Nhập URL avatar hoặc chọn ảnh..."
                      folder="users/avatars"
                    />
                    {editForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, avatar: '' }))}
                        className="self-start text-xs text-red-500 hover:underline"
                      >
                        Xoá avatar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Tên đăng nhập</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                  value={selectedUser.username}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Tên hiển thị</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={editForm.displayName}
                  onChange={e => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              {isSuperAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Vai trò</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                    value={editForm.role}
                    onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Đặt lại mật khẩu (tuỳ chọn)</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={editForm.password}
                  onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Bỏ trống nếu không đổi"
                />
              </div>
              {updateMutation.isError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Không thể cập nhật người dùng.</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b2a]/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#124e66]/[0.08] px-6 py-4">
              <h3 className="text-lg font-bold text-[#0d1b2a]">Tạo tài khoản mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Tên đăng nhập</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={createForm.username}
                  onChange={e => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Mật khẩu</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={createForm.password}
                  onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Tên hiển thị</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={createForm.displayName}
                  onChange={e => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Vai trò</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
                  value={createForm.role}
                  onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a]">Avatar</label>
                <div className="flex items-center gap-4">
                  {createForm.avatar && (
                    <div className="relative">
                      <img
                        src={createForm.avatar}
                        alt="Avatar preview"
                        className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setCreateForm(prev => ({ ...prev, avatar: '' }))}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <ImageSelector
                      value={createForm.avatar}
                      onChange={(url) => setCreateForm(prev => ({ ...prev, avatar: url }))}
                      placeholder="Nhập URL avatar hoặc chọn ảnh..."
                      folder="users/avatars"
                    />
                  </div>
                </div>
              </div>
              {createMutation.isError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Không thể tạo người dùng.</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>{createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
