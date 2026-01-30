import 'server-only';

import { apiRequest } from '@/lib/api-client';
import { mockBlogPostDetails, mockBlogPosts } from '@/lib/sample-data';
import type { ApiSuccessResponse } from '@/types/api';
import type { BlogPostDetail, BlogPostSummary } from '@/types/content';

const BLOG_LIST_REVALIDATE = 30;
const BLOG_DETAIL_REVALIDATE = 60;

export async function fetchBlogSummaries(): Promise<BlogPostSummary[]> {
  try {
    const response = await apiRequest<ApiSuccessResponse<BlogPostSummary[]>>({
      path: '/v1/blog',
      nextOptions: {
        next: { revalidate: BLOG_LIST_REVALIDATE }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể tải danh sách blog từ API', error);
    return mockBlogPosts;
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const response = await apiRequest<ApiSuccessResponse<BlogPostDetail>>({
      path: `/v1/blog/${slug}`,
      nextOptions: {
        next: { revalidate: BLOG_DETAIL_REVALIDATE }
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Không thể tải blog slug ${slug}`, error);
    return mockBlogPostDetails.find(post => post.slug === slug) ?? null;
  }
}

export async function searchBlogPosts(query: string): Promise<BlogPostSummary[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const response = await apiRequest<ApiSuccessResponse<BlogPostSummary[]>>({
      path: `/v1/blog/search?q=${encodeURIComponent(query)}`,
      nextOptions: {
        next: { revalidate: 0 } // Don't cache search results
      }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể tìm kiếm blog', error);
    // Fallback to client-side filtering
    const allPosts = await fetchBlogSummaries();
    const lowerQuery = query.toLowerCase();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt?.toLowerCase().includes(lowerQuery) ||
      post.category?.toLowerCase().includes(lowerQuery)
    );
  }
}
