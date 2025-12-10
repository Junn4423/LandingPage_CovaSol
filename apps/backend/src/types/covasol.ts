// Local copy of shared content/api types to keep backend build within rootDir

// Blog types
export type BlogStatus = 'draft' | 'published' | 'archived' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogPostSummary {
  id?: string;
  code: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  publishedAt?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  authorId?: number | null;
  author?: string;
  status: string;
  heroImage?: string | null;
  imageUrl?: string | null;
  category?: string;
  isFeatured?: boolean;
  updatedAt?: string;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  tags: string[];
  keywords?: string[];
  authorRole?: string;
  galleryMedia?: any[];
  videoItems?: any[];
  sourceLinks?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Product types
export type ProductStatus = 'draft' | 'active' | 'archived' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProductSummary {
  id?: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  shortDescription?: string;
  imageUrl?: string | null;
  status: string;
  updatedAt?: string;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  featureTags?: string[];
  highlights?: string[];
  ctaPrimary?: { label?: string; url?: string };
  ctaSecondary?: { label?: string; url?: string };
  galleryMedia?: any[];
  videoItems?: any[];
  demoMedia?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// User types
export interface UserSummary {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface AdminOverviewStats {
  blogs: number;
  products: number;
  users: number;
  reviews: number;
  uniqueVisitors: number;
  totalVisits: number;
  lastVisitAt: string | null;
  consentsTotal: number;
  consentsOptIn: number;
  consentsOptOut: number;
  consentRate: number;
  lastConsentAt: string | null;
  lastUpdated: string;
}
