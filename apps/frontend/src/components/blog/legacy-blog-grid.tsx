"use client";

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { BlogPostSummary } from '@/types/content';
import { normalizeImageUrl } from '@/lib/image-url';

const DEFAULT_POST_IMAGE = '/assets/img/anh1.jpeg';

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

const DEFAULT_VISIBLE_COUNT = 6;
const LOAD_STEP = 6;

export interface LegacyBlogGridProps {
  posts: BlogPostSummary[];
}

export function LegacyBlogGrid({ posts }: LegacyBlogGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);

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
    return [...presetFilters, ...extraFilters, { key: 'other', label: 'Chuyên mục khác', dataKey: 'other', isPreset: true }];
  }, [derivedFilters]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return posts;
    return posts.filter(post => {
      const key = slugifyCategory(post.category);
      if (!key) return activeCategory === 'other';
      return key === activeCategory || (!CATEGORY_PRESETS.some(preset => preset.key === key) && activeCategory === 'other');
    });
  }, [activeCategory, posts]);

  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);
  const canLoadMore = filteredPosts.length > visibleCount;
  const isEmpty = filteredPosts.length === 0;

  useEffect(() => {
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }, [activeCategory, posts]);

  return (
    <>
      <section className="blog-categories">
        <div className="container">
          <div className="categories-filter" data-aos="fade-up">
            {filters.map(filter => (
              <button
                key={filter.key}
                type="button"
                className={`category-btn ${activeCategory === filter.key ? 'active' : ''}`}
                data-category={filter.key}
                data-key={filter.dataKey}
                onClick={() => setActiveCategory(filter.key)}
              >
                {filter.label}
              </button>
            ))}
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
                    data-aos-delay={100 * (index % 3)}
                  >
                    <div className="post-image">
                      <img src={getDisplayImage(post)} alt={post.title} loading="lazy" />
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
                {canLoadMore ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-large"
                    data-key="load-more"
                    onClick={() => setVisibleCount(count => count + LOAD_STEP)}
                  >
                    Tải thêm bài viết
                  </button>
                ) : (
                  <p className="load-more-end" role="status">
                    Bạn đã xem hết danh sách bài viết.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
