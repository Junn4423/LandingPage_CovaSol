"use client";

import { useEffect, useMemo, useState } from 'react';
import { ProductCard, type LegacyProductCard } from './product-card';

const ITEMS_PER_PAGE = 9;

interface ProductsGridProps {
  title: string;
  subtitle: string;
  titleKey: string;
  subtitleKey: string;
  items: LegacyProductCard[];
  emptyMessage: string;
}

export function ProductsGrid({ title, subtitle, titleKey, subtitleKey, items, emptyMessage }: ProductsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Build category filters
  const filters = useMemo(() => {
    const categoryMap = new Map<string, string>();
    items.forEach(item => {
      if (item.category) {
        const key = item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!categoryMap.has(key)) {
          categoryMap.set(key, item.category);
        }
      }
    });
    return [
      { key: 'all', label: 'Tất cả sản phẩm' },
      ...Array.from(categoryMap.entries()).map(([key, label]) => ({ key, label }))
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    
    // Filter by category
    const byCategory = activeCategory === 'all'
      ? items
      : items.filter(item => {
          const key = item.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';
          return key === activeCategory;
        });

    // Filter by search term
    const filtered = !term
      ? byCategory
      : byCategory.filter(item => {
          const haystack = [item.name, item.description, item.category, ...(item.tags ?? [])]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(term);
        });

    return filtered;
  }, [items, searchTerm, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [safeCurrentPage, filteredItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, items]);

  const isEmpty = filteredItems.length === 0;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      {/* Filter Bar - matching yatame blog style */}
      <section className="yatame-filter-bar">
        <div className="container">
          <div className="filter-search">
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              aria-label="Tìm kiếm sản phẩm"
            />
          </div>
          <div className="filter-category">
            <label className="sr-only" htmlFor="productCategorySelect">
              Chọn danh mục
            </label>
            <select
              id="productCategorySelect"
              value={activeCategory}
              onChange={event => setActiveCategory(event.target.value)}
              aria-label="Lọc danh mục"
            >
              {filters.map(filter => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid - matching yatame blog style */}
      <section className="yatame-posts-section">
        <div className="container">
          {isEmpty ? (
            <div className="yatame-empty-state" data-aos="fade-up">
              <i className="fas fa-box-open" aria-hidden="true" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <>
              <div className="yatame-posts-grid">
                {visibleItems.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Pagination - matching yatame blog style */}
              {totalPages > 1 && (
                <nav className="yatame-pagination" aria-label="Phân trang">
                  {safeCurrentPage > 1 && (
                    <button
                      type="button"
                      className="page-numbers prev"
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      « Trước
                    </button>
                  )}
                  
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={page}
                        type="button"
                        className={`page-numbers ${page === safeCurrentPage ? 'current' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === safeCurrentPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="page-numbers ellipsis">
                        {page}
                      </span>
                    )
                  ))}
                  
                  {safeCurrentPage < totalPages && (
                    <button
                      type="button"
                      className="page-numbers next"
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Sau »
                    </button>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
