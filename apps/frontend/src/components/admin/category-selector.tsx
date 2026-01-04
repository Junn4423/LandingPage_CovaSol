'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CategoryItem } from '@/lib/admin-api';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categories: CategoryItem[];
  isLoading?: boolean;
  onCreateNew?: (name: string) => Promise<CategoryItem | void>;
  placeholder?: string;
  className?: string;
}

export function CategorySelector({
  value,
  onChange,
  categories,
  isLoading = false,
  onCreateNew,
  placeholder = 'Chọn hoặc nhập danh mục mới...',
  className = ''
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal input with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories based on input
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(inputValue.toLowerCase()) ||
    cat.code.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input is a new category (not existing)
  const isNewCategory = inputValue.trim() !== '' && 
    !categories.some(cat => 
      cat.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // Check if it matches an existing category
    const matchingCategory = categories.find(
      cat => cat.name.toLowerCase() === newValue.toLowerCase()
    );
    
    if (matchingCategory) {
      onChange(matchingCategory.name);
    } else {
      onChange(newValue);
    }
  };

  const handleSelectCategory = (category: CategoryItem) => {
    setInputValue(category.name);
    onChange(category.name);
    setIsOpen(false);
  };

  const handleCreateNew = useCallback(async () => {
    if (!inputValue.trim() || !onCreateNew) return;
    
    setIsCreating(true);
    try {
      const newCategory = await onCreateNew(inputValue.trim());
      if (newCategory) {
        setInputValue(newCategory.name);
        onChange(newCategory.name);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsCreating(false);
    }
  }, [inputValue, onCreateNew, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isNewCategory && onCreateNew) {
        handleCreateNew();
      } else if (filteredCategories.length === 1) {
        handleSelectCategory(filteredCategories[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // Open dropdown on arrow keys
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 transition-all focus:border-[#1c6e8c] focus:outline-none focus:ring-2 focus:ring-[#1c6e8c]/20"
          disabled={isLoading || isCreating}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-slate-500">Đang tải...</div>
          ) : (
            <>
              {/* Existing categories */}
              {filteredCategories.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">
                    Danh mục có sẵn
                  </div>
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                        value === cat.name ? 'bg-[#1c6e8c]/5 text-[#1c6e8c]' : 'text-slate-700'
                      }`}
                    >
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Mã: {cat.code}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Create new option */}
              {isNewCategory && onCreateNew && (
                <div className="border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={isCreating}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors text-emerald-600 flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tạo danh mục mới: <strong>"{inputValue.trim()}"</strong></span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* No results */}
              {filteredCategories.length === 0 && !isNewCategory && (
                <div className="px-4 py-3 text-sm text-slate-500">
                  Không tìm thấy danh mục phù hợp
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-1.5 text-xs text-slate-500">
        {isNewCategory 
          ? '💡 Nhấn Enter hoặc bấm "Tạo danh mục mới" để thêm danh mục mới'
          : 'Chọn từ danh sách hoặc nhập tên mới để tạo danh mục'
        }
      </p>
    </div>
  );
}
