export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProductMetric {
  label: string;
  value: string;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  headline: string;
  summary: string;
  category: string;
  thumbnail?: string;
  status: ProductStatus;
  publishedAt?: string | null;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt?: string | null;
  author: string;
  status: BlogStatus;
  heroImage?: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  tags: string[];
}

export interface ProductDetail extends ProductSummary {
  description: string;
  features: string[];
  metrics?: ProductMetric[];
}

export interface UserSummary {
  id: string;
  username: string;
  displayName?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
