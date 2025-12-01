// Blog types
export interface BlogPostSummary {
  id: string;
  code: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  publishedAt?: string | null;
  author: string;
  status: string;
  heroImage?: string | null;
  category?: string;
  isFeatured?: boolean;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  tags: string[];
  keywords?: string[];
  authorRole?: string;
  galleryMedia?: any[];
  videoItems?: any[];
  sourceLinks?: any[];
}

// Product types
export interface ProductSummary {
  id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  imageUrl?: string;
  status: string;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  featureTags: string[];
  highlights: string[];
  ctaPrimaryLabel?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
  galleryMedia?: any[];
  videoItems?: any[];
  demoMedia?: any[];
}

// User types
export interface UserSummary {
  id: string;
  username: string;
  displayName?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
