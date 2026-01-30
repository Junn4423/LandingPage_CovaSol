'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { BlogPostSummary } from '@/types/content';
import type { Route } from 'next';
import { normalizeImageUrl } from '@/lib/image-url';

interface HomeBlogGridProps {
  posts: BlogPostSummary[];
}

export function HomeBlogGrid({ posts }: HomeBlogGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="posts-empty">
        <i className="fas fa-newspaper" />
        <p data-key="home-blog-empty">Chưa có bài viết nào được xuất bản.</p>
      </div>
    );
  }

  return (
    <div className="posts-grid" id="homeBlogGrid">
      {posts.slice(0, 3).map((post, index) => (
        <BlogPostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

interface BlogPostCardProps {
  post: BlogPostSummary;
  index: number;
}

function formatLocalizedDate(value?: string | null): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return value;
  }
}

function BlogPostCard({ post, index }: BlogPostCardProps) {
  const detailUrl = `/blog/${post.slug}` as Route;
  const fallbackImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80';
  const imageSrc = normalizeImageUrl(post.heroImage, { fallback: fallbackImage });

  return (
    <article
      className="post-card"
      data-aos="fade-up"
      tabIndex={0}
    >
      <div className="post-image">
        <Link href={detailUrl} className="block w-full h-full relative">
          <Image
            src={imageSrc}
            alt={post.title || 'COVASOL Blog'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>
      </div>
      <div className="post-content">
        <div className="post-meta">
          <span className="post-category">{post.category || 'Tin tức'}</span>
          <span className="post-date">{formatLocalizedDate(post.publishedAt)}</span>
        </div>
        <h3>
          <Link href={detailUrl}>{post.title || 'COVASOL Insight'}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <Link href={detailUrl} className="read-more">
          <span data-key="read-more">Đọc thêm</span>
          <i className="fas fa-arrow-right" />
        </Link>
      </div>
    </article>
  );
}
