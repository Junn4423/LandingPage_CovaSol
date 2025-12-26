'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminSeasonalThemes,
  createAdminSeasonalTheme,
  updateAdminSeasonalTheme,
  deleteAdminSeasonalTheme,
  activateSeasonalTheme,
  deactivateAllSeasonalThemes
} from '@/lib/admin-api';
import type { SeasonalTheme, SeasonalThemeInput, SeasonalEffectType } from '@covasol/types';

// Predefined Vietnamese events/seasons
const PRESET_THEMES: Partial<SeasonalThemeInput>[] = [
  {
    code: 'tet',
    name: 'Tết',
    description: 'Tết Dương Lịch & Tết Nguyên Đán - Hoa đào/mai, câu đối tết',
    primaryColor: '#DC2626',
    secondaryColor: '#FBBF24',
    accentColor: '#FEE2E2',
    effectType: 'petals',
    backgroundImageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Hoa-dao-ngay-tet-decor-website.png',
    decorations: [
      {
        id: 'tet-couplet-left',
        type: 'couplet',
        position: 'side-left',
        imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Cau-noi-cau-duoc-uoc-thay.png',
        altText: 'Câu đối Tết bên trái',
        width: 180,
      },
      {
        id: 'tet-couplet-right',
        type: 'couplet',
        position: 'side-right',
        imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Tan-tai-tan-loc-tan-binh-an.png',
        altText: 'Câu đối Tết bên phải',
        width: 180,
      },
    ],
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), 1, 15).toISOString(),
  },
  {
    code: 'valentine',
    name: 'Valentine 14/2',
    description: 'Trái tim, Cupid, chocolate',
    primaryColor: '#EC4899',
    secondaryColor: '#DC2626',
    accentColor: '#FDF2F8',
    effectType: 'hearts',
    startDate: new Date(new Date().getFullYear(), 1, 10).toISOString(),
    endDate: new Date(new Date().getFullYear(), 1, 15).toISOString(),
  },
  {
    code: 'women_day',
    name: 'Quốc tế Phụ nữ 8/3',
    description: 'Hoa hồng, ruy băng',
    primaryColor: '#A855F7',
    secondaryColor: '#FBCFE8',
    accentColor: '#F3E8FF',
    effectType: 'petals',
    startDate: new Date(new Date().getFullYear(), 2, 5).toISOString(),
    endDate: new Date(new Date().getFullYear(), 2, 10).toISOString(),
  },
  {
    code: 'liberation_day',
    name: 'Giải phóng & Quốc tế Lao động',
    description: 'Cờ đỏ sao vàng',
    primaryColor: '#DC2626',
    secondaryColor: '#FBBF24',
    effectType: 'confetti',
    startDate: new Date(new Date().getFullYear(), 3, 28).toISOString(),
    endDate: new Date(new Date().getFullYear(), 4, 3).toISOString(),
  },
  {
    code: 'summer',
    name: 'Chào Hè',
    description: 'Biển, nắng, nhiệt đới',
    primaryColor: '#3B82F6',
    secondaryColor: '#FDE047',
    accentColor: '#22C55E',
    effectType: 'bubbles',
    startDate: new Date(new Date().getFullYear(), 5, 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), 7, 31).toISOString(),
  },
  {
    code: 'national_day',
    name: 'Quốc Khánh 2/9',
    description: 'Cờ đỏ sao vàng, sách vở',
    primaryColor: '#EA580C',
    secondaryColor: '#1E3A5F',
    effectType: 'confetti',
    startDate: new Date(new Date().getFullYear(), 8, 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), 8, 5).toISOString(),
  },
  {
    code: 'mid_autumn',
    name: 'Trung Thu',
    description: 'Chị Hằng, Thỏ ngọc, Lồng đèn ông sao',
    primaryColor: '#F97316',
    secondaryColor: '#78350F',
    accentColor: '#1E3A8A',
    effectType: 'lanterns',
    startDate: new Date(new Date().getFullYear(), 8, 10).toISOString(),
    endDate: new Date(new Date().getFullYear(), 9, 5).toISOString(),
  },
  {
    code: 'halloween',
    name: 'Halloween 31/10',
    description: 'Bí ngô, dơi, màng nhện, ma cute',
    primaryColor: '#F97316',
    secondaryColor: '#7C3AED',
    accentColor: '#000000',
    effectType: 'bats',
    startDate: new Date(new Date().getFullYear(), 9, 25).toISOString(),
    endDate: new Date(new Date().getFullYear(), 10, 2).toISOString(),
  },
  {
    code: 'black_friday',
    name: 'Black Friday',
    description: 'Tag giảm giá, hộp quà, đồng hồ đếm ngược',
    primaryColor: '#000000',
    secondaryColor: '#EC4899',
    accentColor: '#FBBF24',
    effectType: 'confetti',
    startDate: new Date(new Date().getFullYear(), 10, 20).toISOString(),
    endDate: new Date(new Date().getFullYear(), 10, 30).toISOString(),
  },
  {
    code: 'christmas',
    name: 'Giáng Sinh',
    description: 'Ông già Noel, Tuần lộc, Tuyết rơi',
    primaryColor: '#DC2626',
    secondaryColor: '#16A34A',
    accentColor: '#FFFFFF',
    effectType: 'snow',
    startDate: new Date(new Date().getFullYear(), 11, 15).toISOString(),
    endDate: new Date(new Date().getFullYear(), 11, 31).toISOString(),
  },
];

const EFFECT_TYPES: { value: SeasonalEffectType; label: string; icon: string }[] = [
  { value: 'none', label: 'Không hiệu ứng', icon: 'fa-ban' },
  { value: 'snow', label: 'Tuyết rơi', icon: 'fa-snowflake' },
  { value: 'firework', label: 'Pháo hoa', icon: 'fa-burst' },
  { value: 'petals', label: 'Cánh hoa rơi', icon: 'fa-leaf' },
  { value: 'hearts', label: 'Trái tim', icon: 'fa-heart' },
  { value: 'confetti', label: 'Hoa giấy', icon: 'fa-star' },
  { value: 'leaves', label: 'Lá rơi', icon: 'fa-canadian-maple-leaf' },
  { value: 'lanterns', label: 'Đèn lồng', icon: 'fa-lantern' },
  { value: 'bats', label: 'Dơi bay', icon: 'fa-bat' },
  { value: 'bubbles', label: 'Bong bóng', icon: 'fa-circle' },
  { value: 'stars', label: 'Ngôi sao', icon: 'fa-star' },
  { value: 'lixi', label: 'Bao lì xì', icon: 'fa-envelope' },
];

export default function SeasonalThemesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<SeasonalTheme | null>(null);
  const [formData, setFormData] = useState<Partial<SeasonalThemeInput>>({});

  const { data: themes, isLoading, error } = useQuery({
    queryKey: ['admin-seasonal-themes'],
    queryFn: fetchAdminSeasonalThemes,
  });

  const createMutation = useMutation({
    mutationFn: createAdminSeasonalTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasonal-themes'] });
      setShowForm(false);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SeasonalThemeInput> }) =>
      updateAdminSeasonalTheme(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasonal-themes'] });
      setShowForm(false);
      setEditingTheme(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminSeasonalTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasonal-themes'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateSeasonalTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasonal-themes'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAllSeasonalThemes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasonal-themes'] });
    },
  });

  const handleEdit = (theme: SeasonalTheme) => {
    setEditingTheme(theme);
    setFormData({
      code: theme.code,
      name: theme.name,
      description: theme.description,
      startDate: theme.startDate.split('T')[0],
      endDate: theme.endDate.split('T')[0],
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      effectType: theme.effectType,
      effectEnabled: theme.effectEnabled,
      disableOnMobile: theme.disableOnMobile,
      bannerText: theme.bannerText,
      bannerLink: theme.bannerLink,
      bannerImageUrl: theme.bannerImageUrl,
      backgroundImageUrl: theme.backgroundImageUrl,
      decorations: theme.decorations,
      priority: theme.priority,
      status: theme.status,
    });
    setShowForm(true);
  };

  const handleUsePreset = (preset: Partial<SeasonalThemeInput>) => {
    setFormData({
      ...preset,
      startDate: preset.startDate?.split('T')[0],
      endDate: preset.endDate?.split('T')[0],
      effectEnabled: true,
      disableOnMobile: true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input: SeasonalThemeInput = {
      code: formData.code || '',
      name: formData.name || '',
      description: formData.description,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
      primaryColor: formData.primaryColor || '#000000',
      secondaryColor: formData.secondaryColor || '#FFFFFF',
      accentColor: formData.accentColor,
      effectType: formData.effectType,
      effectEnabled: formData.effectEnabled ?? true,
      disableOnMobile: formData.disableOnMobile ?? true,
      bannerText: formData.bannerText,
      bannerLink: formData.bannerLink,
      bannerImageUrl: formData.bannerImageUrl,
      backgroundImageUrl: formData.backgroundImageUrl,
      decorations: formData.decorations,
      priority: formData.priority ?? 0,
      status: formData.status ?? 'active',
    };

    if (editingTheme) {
      updateMutation.mutate({ id: editingTheme.id, input });
    } else {
      createMutation.mutate(input);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isThemeActive = (theme: SeasonalTheme) => {
    if (theme.isActive) return true;
    const now = new Date();
    const start = new Date(theme.startDate);
    const end = new Date(theme.endDate);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1b2a]">Giao diện theo Mùa</h2>
          <p className="mt-1 text-slate-500">
            Quản lý hiệu ứng và giao diện website theo các sự kiện trong năm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => deactivateMutation.mutate()}
            disabled={deactivateMutation.isPending}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <i className="fas fa-rotate-left"></i>
            <span>Chế độ tự động</span>
          </button>
          <button
            onClick={() => {
              setEditingTheme(null);
              setFormData({});
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#124e66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0d3d52]"
          >
            <i className="fas fa-plus"></i>
            <span>Tạo theme mới</span>
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#0d1b2a]">
          <i className="fas fa-calendar-alt mr-2 text-[#124e66]"></i>
          Sự kiện Việt Nam (Templates)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.code}
              onClick={() => handleUsePreset(preset)}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 transition-all hover:border-[#124e66] hover:bg-slate-50"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: preset.primaryColor }}
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: preset.secondaryColor }}
                />
              </div>
              <span className="text-center text-xs font-medium text-slate-700">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0d1b2a]">
                {editingTheme ? 'Chỉnh sửa Theme' : 'Tạo Theme Mới'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTheme(null);
                  setFormData({});
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mã (code)</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]"
                    placeholder="christmas, tet_nguyen_dan..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tên hiển thị</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]"
                    placeholder="Giáng Sinh, Tết Nguyên Đán..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]"
                  rows={2}
                  placeholder="Mô tả ngắn về theme..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Màu chính</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor || '#000000'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#000000'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Màu phụ</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Màu nhấn</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor || '#888888'}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      value={formData.accentColor || ''}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                      placeholder="Không bắt buộc"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Loại hiệu ứng</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {EFFECT_TYPES.map((effect) => (
                    <button
                      key={effect.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, effectType: effect.value })}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                        formData.effectType === effect.value
                          ? 'border-[#124e66] bg-[#124e66]/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <i className={`fas ${effect.icon} text-lg ${formData.effectType === effect.value ? 'text-[#124e66]' : 'text-slate-400'}`}></i>
                      <span className="text-xs text-slate-600">{effect.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.effectEnabled ?? true}
                    onChange={(e) => setFormData({ ...formData, effectEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#124e66] focus:ring-[#124e66]"
                  />
                  <span className="text-sm text-slate-700">Bật hiệu ứng</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.disableOnMobile ?? true}
                    onChange={(e) => setFormData({ ...formData, disableOnMobile: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#124e66] focus:ring-[#124e66]"
                  />
                  <span className="text-sm text-slate-700">Tắt trên Mobile (khuyên dùng)</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Banner text</label>
                  <input
                    type="text"
                    value={formData.bannerText || ''}
                    onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                    placeholder="Chúc mừng năm mới 2025!"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Banner link</label>
                  <input
                    type="text"
                    value={formData.bannerLink || ''}
                    onChange={(e) => setFormData({ ...formData, bannerLink: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                    placeholder="/khuyen-mai"
                  />
                </div>
              </div>

              {/* Background Image URL */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  <i className="fas fa-image mr-1 text-slate-400"></i>
                  URL ảnh nền (Background)
                </label>
                <input
                  type="url"
                  value={formData.backgroundImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, backgroundImageUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                  placeholder="https://example.com/background.png"
                />
                {formData.backgroundImageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={formData.backgroundImageUrl} 
                      alt="Preview background" 
                      className="h-16 w-24 object-cover rounded border"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="text-xs text-slate-500">Preview</span>
                  </div>
                )}
              </div>

              {/* Couplet Images */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  <i className="fas fa-scroll mr-1 text-red-500"></i>
                  Câu đối (Couplets) - Hiển thị 2 bên màn hình
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">URL ảnh bên trái</label>
                    <input
                      type="url"
                      value={
                        formData.decorations?.find(d => d.position === 'side-left')?.imageUrl || ''
                      }
                      onChange={(e) => {
                        const leftDecoration = {
                          id: 'couplet-left',
                          type: 'couplet' as const,
                          position: 'side-left' as const,
                          imageUrl: e.target.value,
                          altText: 'Câu đối bên trái',
                          width: 180,
                        };
                        const rightDecoration = formData.decorations?.find(d => d.position === 'side-right') || {
                          id: 'couplet-right',
                          type: 'couplet' as const,
                          position: 'side-right' as const,
                          imageUrl: '',
                          altText: 'Câu đối bên phải',
                          width: 180,
                        };
                        setFormData({ 
                          ...formData, 
                          decorations: e.target.value ? [leftDecoration, rightDecoration].filter(d => d.imageUrl) : 
                            rightDecoration.imageUrl ? [rightDecoration] : undefined
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#124e66] focus:outline-none"
                      placeholder="https://example.com/couplet-left.png"
                    />
                    {formData.decorations?.find(d => d.position === 'side-left')?.imageUrl && (
                      <img 
                        src={formData.decorations.find(d => d.position === 'side-left')?.imageUrl} 
                        alt="Preview left couplet" 
                        className="mt-2 h-24 w-auto rounded border"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">URL ảnh bên phải</label>
                    <input
                      type="url"
                      value={
                        formData.decorations?.find(d => d.position === 'side-right')?.imageUrl || ''
                      }
                      onChange={(e) => {
                        const leftDecoration = formData.decorations?.find(d => d.position === 'side-left') || {
                          id: 'couplet-left',
                          type: 'couplet' as const,
                          position: 'side-left' as const,
                          imageUrl: '',
                          altText: 'Câu đối bên trái',
                          width: 180,
                        };
                        const rightDecoration = {
                          id: 'couplet-right',
                          type: 'couplet' as const,
                          position: 'side-right' as const,
                          imageUrl: e.target.value,
                          altText: 'Câu đối bên phải',
                          width: 180,
                        };
                        setFormData({ 
                          ...formData, 
                          decorations: e.target.value ? [leftDecoration, rightDecoration].filter(d => d.imageUrl) : 
                            leftDecoration.imageUrl ? [leftDecoration] : undefined
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#124e66] focus:outline-none"
                      placeholder="https://example.com/couplet-right.png"
                    />
                    {formData.decorations?.find(d => d.position === 'side-right')?.imageUrl && (
                      <img 
                        src={formData.decorations.find(d => d.position === 'side-right')?.imageUrl} 
                        alt="Preview right couplet" 
                        className="mt-2 h-24 w-auto rounded border"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  Câu đối sẽ được hiển thị ở 2 bên màn hình (chỉ desktop, ẩn khi &lt; 1524px)
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Độ ưu tiên</label>
                  <input
                    type="number"
                    value={formData.priority ?? 0}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
                  <select
                    value={formData.status ?? 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#124e66] focus:outline-none"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTheme(null);
                    setFormData({});
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-xl bg-[#124e66] px-6 py-2 text-sm font-semibold text-white hover:bg-[#0d3d52] disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : editingTheme ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Themes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-[#124e66]"></i>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải dữ liệu. Thử lại sau.</p>
        </div>
      ) : themes && themes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                isThemeActive(theme) ? 'border-[#124e66] ring-2 ring-[#124e66]/20' : 'border-slate-200'
              }`}
            >
              {/* Color bar */}
              <div
                className="absolute left-0 right-0 top-0 h-2"
                style={{
                  background: `linear-gradient(90deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
                }}
              />

              {/* Status badges */}
              <div className="mb-3 mt-1 flex flex-wrap gap-2">
                {theme.isActive && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <i className="fas fa-check mr-1"></i>Đang kích hoạt
                  </span>
                )}
                {isThemeActive(theme) && !theme.isActive && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <i className="fas fa-clock mr-1"></i>Đang trong thời gian
                  </span>
                )}
                {theme.status === 'inactive' && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Tạm dừng
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-[#0d1b2a]">{theme.name}</h4>
              <p className="text-xs text-slate-500">{theme.code}</p>
              {theme.description && (
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{theme.description}</p>
              )}

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <i className="fas fa-calendar-days"></i>
                <span>{formatDate(theme.startDate)} - {formatDate(theme.endDate)}</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full border border-slate-200"
                  style={{ backgroundColor: theme.primaryColor }}
                  title="Màu chính"
                />
                <div
                  className="h-5 w-5 rounded-full border border-slate-200"
                  style={{ backgroundColor: theme.secondaryColor }}
                  title="Màu phụ"
                />
                {theme.accentColor && (
                  <div
                    className="h-5 w-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: theme.accentColor }}
                    title="Màu nhấn"
                  />
                )}
                {theme.effectType && theme.effectType !== 'none' && (
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    <i className={`fas ${EFFECT_TYPES.find(e => e.value === theme.effectType)?.icon || 'fa-magic'} mr-1`}></i>
                    {EFFECT_TYPES.find(e => e.value === theme.effectType)?.label || theme.effectType}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => activateMutation.mutate(theme.id)}
                  disabled={activateMutation.isPending || theme.isActive}
                  className="flex-1 rounded-lg bg-[#124e66] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d3d52] disabled:opacity-50"
                >
                  <i className="fas fa-play mr-1"></i>
                  {theme.isActive ? 'Đang active' : 'Kích hoạt'}
                </button>
                <button
                  onClick={() => handleEdit(theme)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <i className="fas fa-pen"></i>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa theme "${theme.name}"?`)) {
                      deleteMutation.mutate(theme.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <i className="fas fa-calendar-plus mb-4 text-4xl text-slate-400"></i>
          <p className="text-slate-600">Chưa có theme nào. Hãy tạo theme mới hoặc sử dụng templates ở trên.</p>
        </div>
      )}

      {/* Info Box */}
      {/* <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h4 className="mb-2 font-semibold text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Lưu ý quan trọng
        </h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Chỉ trang trí ở Header, Footer và 2 bên lề. Không che nội dung bài viết.</li>
          <li>• Hiệu ứng tự động tắt trên Mobile để tránh làm chậm máy.</li>
          <li>• Dùng ảnh SVG/WebP để đảm bảo web không bị load chậm.</li>
          <li>• <strong>Chế độ tự động:</strong> Theme sẽ tự kích hoạt theo ngày.</li>
          <li>• <strong>Kích hoạt thủ công:</strong> Bấm "Kích hoạt" để bật ngay, bỏ qua ngày.</li>
        </ul>
      </div> */}
    </div>
  );
}
