import type { MetadataRoute } from 'next';
import { fetchBlogSummaries } from '@/lib/api/blog';
import { fetchProductSummaries } from '@/lib/api/products';
import { getSiteUrl } from '@/lib/site-metadata';

export const revalidate = 3600; // Refresh sitemap every hour

function resolveDate(value: string | null | undefined, fallback: Date) {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [blogs, products] = await Promise.all([fetchBlogSummaries(), fetchProductSummaries()]);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];

  blogs.forEach(post => {
    if (!post.slug) {
      return;
    }
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: resolveDate(post.updatedAt ?? post.publishedAt ?? null, now),
      changeFrequency: 'weekly',
      priority: post.isFeatured ? 0.95 : 0.8
    });
  });

  products.forEach(product => {
    const slug = product.slug || product.code;
    if (!slug) {
      return;
    }
    entries.push({
      url: `${baseUrl}/products/${slug}`,
      lastModified: resolveDate(product.updatedAt, now),
      changeFrequency: 'weekly',
      priority: 0.85
    });
  });

  return entries;
}
