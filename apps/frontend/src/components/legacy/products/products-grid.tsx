"use client";

import { useEffect, useMemo, useState } from 'react';
import { ProductCard, type LegacyProductCard } from './product-card';

const ITEMS_PER_PAGE = 6;

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
  const [page, setPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return items;
    return items.filter(item => {
      const haystack = [item.name, item.description, item.category, ...(item.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [items, normalizedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredItems]);

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch, items]);

  const hasItems = paginatedItems.length > 0;

  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2 data-key={titleKey}>{title}</h2>
          <p data-key={subtitleKey}>{subtitle}</p>
        </div>

        <div className="products-filter" data-aos="fade-up">
          <input
            type="search"
            className="products-search"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            aria-label="Tìm kiếm sản phẩm"
          />
        </div>

        {hasItems ? (
          <div className="products-grid">
            {paginatedItems.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="posts-empty" role="status">
            <i className="fas fa-box-open" aria-hidden="true" />
            <p>{emptyMessage}</p>
          </div>
        )}

        {filteredItems.length > ITEMS_PER_PAGE ? (
          <div className="products-pagination" data-aos="fade-up">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trang trước
            </button>
            <span className="pagination-status">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Trang tiếp
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
