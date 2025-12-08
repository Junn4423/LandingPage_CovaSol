"use client";

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { BlogPostSummary } from '@/types/content';
import { normalizeImageUrl } from '@/lib/image-url';

const DEFAULT_POST_IMAGE = '/assets/img/anh1.jpeg';
const PLACEHOLDER_LOGO = '/assets/logo_whvxwb/logo_whvxwb_c_scale,w_438.png';

const CATEGORY_PRESETS = [
  { key: 'all', label: 'Tất cả bài viết', dataKey: 'all-posts' },
  { key: 'development', label: 'Phát triển', dataKey: 'development' },
  { key: 'ai', label: 'AI & Tech', dataKey: 'ai-tech' },
  { key: 'design', label: 'Thiết kế', dataKey: 'design' },
  { key: 'business', label: 'Kinh doanh', dataKey: 'business' },
  { key: 'tutorials', label: 'Hướng dẫn', dataKey: 'tutorials' }
];

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

const LOAD_STEP = 6;

export interface LegacyBlogGridProps {
  posts: BlogPostSummary[];
}

export function LegacyBlogGrid({ posts }: LegacyBlogGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const derivedFilters = useMemo(() => {
    const extras = new Map<string, string>();
    posts.forEach(post => {
      const key = slugifyCategory(post.category);
      const original = post.category || 'Khác';
      if (key !== 'other' && !CATEGORY_PRESETS.some(preset => preset.key === key)) {
        extras.set(key, original);
      }
    });
    return Array.from(extras.entries()).map(([key, label]) => ({ key, label }));
  }, [posts]);

  const filters = useMemo(() => {
    const presetFilters = CATEGORY_PRESETS.map(item => ({ ...item, isPreset: true }));
    const extraFilters = derivedFilters.map(item => ({ key: item.key, label: item.label, dataKey: 'custom', isPreset: false }));
    const merged = [...presetFilters, ...extraFilters, { key: 'other', label: 'Chuyên mục khác', dataKey: 'other', isPreset: true }];
    const seen = new Set<string>();
    return merged.filter(filter => {
      if (seen.has(filter.key)) return false;
      seen.add(filter.key);
      return true;
    });
  }, [derivedFilters]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const byCategory = activeCategory === 'all'
      ? posts
      : posts.filter(post => {
          const key = slugifyCategory(post.category);
          if (!key) return activeCategory === 'other';
          return key === activeCategory || (!CATEGORY_PRESETS.some(preset => preset.key === key) && activeCategory === 'other');
        });

    if (!term) return byCategory;

    return byCategory.filter(post => {
      const haystack = [post.title, post.excerpt, post.category, post.author, post.subtitle]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [activeCategory, posts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / LOAD_STEP));
  const currentPage = Math.min(page, totalPages);

  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * LOAD_STEP;
    return filteredPosts.slice(start, start + LOAD_STEP);
  }, [currentPage, filteredPosts]);

  const isEmpty = filteredPosts.length === 0;

  useEffect(() => {
    setPage(1);
  }, [activeCategory, posts, searchTerm]);

  return (
    <>
      <section className="blog-categories">
        <div className="container">
          <div className="blog-filter-bar" data-aos="fade-up">
            <div className="blog-search">
              <input
                type="search"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                aria-label="Tìm kiếm bài viết"
              />
            </div>
            <div className="blog-category-select">
              <label className="sr-only" htmlFor="blogCategorySelect">
                Chọn chuyên mục
              </label>
              <select
                id="blogCategorySelect"
                value={activeCategory}
                onChange={event => setActiveCategory(event.target.value)}
                aria-label="Lọc chuyên mục"
              >
                {filters.map(filter => (
                  <option key={filter.key} value={filter.key} data-key={filter.dataKey}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-posts">
        <div className="container">
          {isEmpty ? (
            <div className="posts-empty" data-aos="fade-up">
              <i className="fas fa-newspaper" aria-hidden="true" />
              <p>Chưa có bài viết trong chuyên mục này.</p>
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {visiblePosts.map((post, index) => (
                  <article
                    key={post.id}
                    className="post-card"
                    data-category={slugifyCategory(post.category)}
                    data-aos="fade-up"
                  >
                    <div className="post-image">
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
                    </div>
                    <div className="post-content">
                      <div className="post-meta">
                        <span className="post-category">{post.category || 'Chuyên mục khác'}</span>
                        <span className="post-date">{formatDate(post.publishedAt)}</span>
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <div className="post-tags">
                        <span className="tag">{post.author}</span>
                        {post.subtitle ? <span className="tag">{post.subtitle}</span> : null}
                      </div>
                      <Link href={`/blog/${post.slug}`} className="read-more" data-key="read-more">
                        Đọc thêm <i className="fas fa-arrow-right" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="load-more-section" data-aos="fade-up">
                {filteredPosts.length > LOAD_STEP ? (
                  <div className="pagination">
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
            </>
          )}
        </div>
      </section>
    </>
  );
}
