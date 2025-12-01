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
