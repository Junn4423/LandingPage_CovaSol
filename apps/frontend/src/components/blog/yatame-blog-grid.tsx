"use client";

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { BlogPostSummary } from '@/types/content';
import { normalizeImageUrl } from '@/lib/image-url';

const DEFAULT_POST_IMAGE = '/assets/img/anh1.jpeg';
const PLACEHOLDER_LOGO = '/assets/logo_whvxwb/logo_whvxwb_c_scale,w_438.png';

function slugifyCategory(category?: string | null) {
  if (!category) return 'other';
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function getDisplayImage(post: BlogPostSummary) {
  return normalizeImageUrl(post.heroImage, { fallback: DEFAULT_POST_IMAGE });
}

function formatDate(timestamp?: string | null) {
  if (!timestamp) return 'Chưa xuất bản';
  try {
    return new Date(timestamp).toLocaleDateString('vi-VN');
  } catch {
    return timestamp;
  }
}

const POSTS_PER_PAGE = 9;

export interface YatameBlogGridProps {
  posts: BlogPostSummary[];
}

export function YatameBlogGrid({ posts }: YatameBlogGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];

  const filters = useMemo(() => {
    const categoryMap = new Map<string, string>();
    
    safePosts.forEach(post => {
      const key = slugifyCategory(post.category);
      const label = post.category || 'Khác';
      if (key && !categoryMap.has(key)) {
        categoryMap.set(key, label);
      }
    });

    const categories = [
      { key: 'all', label: 'Tất cả bài viết' },
      ...Array.from(categoryMap.entries()).map(([key, label]) => ({ key, label }))
    ];

    return categories;
  }, [safePosts]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const byCategory = activeCategory === 'all'
      ? safePosts
      : safePosts.filter(post => {
          const key = slugifyCategory(post.category);
          return key === activeCategory;
        });

    const filtered = !term
      ? byCategory
      : byCategory.filter(post => {
          const haystack = [post.title, post.excerpt, post.category, post.author, post.subtitle]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(term);
        });

    // Sort: featured posts first, then by publishedAt descending
    return [...filtered].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      // Secondary sort by publishedAt
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [activeCategory, safePosts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visiblePosts = useMemo(() => {
    const start = (safeCurrentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [safeCurrentPage, filteredPosts]);

  const isEmpty = filteredPosts.length === 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, safePosts, searchTerm]);

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
      {/* Filter Bar */}
      <section className="yatame-filter-bar">
        <div className="container">
          <div className="filter-search">
            <input
              type="search"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              aria-label="Tìm kiếm bài viết"
            />
          </div>
          <div className="filter-category">
            <label className="sr-only" htmlFor="yatameCategorySelect">
              Chọn chuyên mục
            </label>
            <select
              id="yatameCategorySelect"
              value={activeCategory}
              onChange={event => setActiveCategory(event.target.value)}
              aria-label="Lọc chuyên mục"
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

      {/* Posts Grid */}
      <section className="yatame-posts-section">
        <div className="container">
          {isEmpty ? (
            <div className="yatame-empty-state" data-aos="fade-up">
              <i className="fas fa-newspaper" aria-hidden="true" />
              <p>Chưa có bài viết trong chuyên mục này.</p>
            </div>
          ) : (
            <>
              <div className="yatame-posts-grid">
                {visiblePosts.map((post) => (
                  <article
                    key={post.id}
                    className={`yatame-post-card${post.isFeatured ? ' is-featured' : ''}`}
                    data-aos="fade-up"
                  >
                    <Link href={`/blog/${post.slug}`} className="card-thumbnail">
                      <img
                        src={getDisplayImage(post)}
                        alt={post.title}
                        loading="lazy"
                        onError={event => {
                          if (event.currentTarget.src !== PLACEHOLDER_LOGO) {
                            event.currentTarget.src = PLACEHOLDER_LOGO;
                          }
                        }}
                      />
                      {post.isFeatured && (
                        <span className="featured-badge">Bài viết nổi bật</span>
                      )}
                    </Link>
                    <div className="card-body">
                      <h3 className="card-title">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="card-excerpt">{post.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
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
