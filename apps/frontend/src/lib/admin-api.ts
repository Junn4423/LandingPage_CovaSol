import { apiRequest } from '@/lib/api-client';
import type { ApiSuccessResponse, AdminOverviewStats } from '@/types/api';
import type {
  BlogPostDetail,
  ProductDetail,
  UserSummary,
  CustomerReviewDetail
} from '@/types/content';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface BlogMutationInput {
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  tags?: string[];
  keywords?: string[];
  imageUrl?: string | null;
  category?: string;
  authorName?: string;
  authorRole?: string;
  status?: string;
  publishedAt?: string | null;
  slug?: string;
  isFeatured?: boolean;
  galleryMedia?: any[];
  videoItems?: any[];
  sourceLinks?: any[];
}

export interface ProductMutationInput {
  name: string;
  category?: string;
  shortDescription?: string;
  description: string;
  imageUrl?: string | null;
  featureTags?: string[];
  highlights?: string[];
  ctaPrimary?: { label?: string; url?: string };
  ctaSecondary?: { label?: string; url?: string };
  status?: string;
  galleryMedia?: any[];
  videoItems?: any[];
  demoMedia?: any[];
  slug?: string;
}

export interface ReviewMutationInput {
  name: string;
  role: string;
  company?: string;
  rating?: number;
  quote: string;
  bgColor?: string;
  status?: string;
  isFeatured?: boolean;
}

export interface ReviewStatsResponse {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: { label: string; count: number; percent: number }[];
}

export interface CreateUserInput {
  username: string;
  password: string;
  displayName?: string;
  role?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: string;
  password?: string;
}

export async function login(payload: LoginPayload) {
  const res = await apiRequest<ApiSuccessResponse<UserSummary>>({
    path: '/v1/auth/login',
    method: 'POST',
    body: payload
  });
  return res.data;
}

export async function logout() {
  await apiRequest<void>({
    path: '/v1/auth/logout',
    method: 'POST'
  });
}

export async function fetchCurrentUser() {
  const res = await apiRequest<ApiSuccessResponse<UserSummary>>({
    path: '/v1/auth/me'
  });
  return res.data;
}

export async function fetchAdminOverview() {
  const res = await apiRequest<ApiSuccessResponse<AdminOverviewStats>>({
    path: '/v1/admin/analytics/overview'
  });
  return res.data;
}

export async function fetchAdminBlogPosts() {
  const res = await apiRequest<{ data: BlogPostDetail[]; pagination: any }>({
    path: '/v1/admin/blog'
  });
  return res.data;
}

export async function createAdminBlogPost(payload: BlogMutationInput) {
  const res = await apiRequest<ApiSuccessResponse<BlogPostDetail>>({
    path: '/v1/admin/blog',
    method: 'POST',
    body: payload
  });
  return res.data;
}

export async function updateAdminBlogPost(id: string, payload: Partial<BlogMutationInput>) {
  const res = await apiRequest<ApiSuccessResponse<BlogPostDetail>>({
    path: `/v1/admin/blog/${id}`,
    method: 'PUT',
    body: payload
  });
  return res.data;
}

export async function deleteAdminBlogPost(id: string) {
  await apiRequest<void>({
    path: `/v1/admin/blog/${id}`,
    method: 'DELETE'
  });
}

export async function fetchAdminProducts() {
  const res = await apiRequest<{ data: ProductDetail[]; pagination: any }>({
    path: '/v1/admin/products'
  });
  return res.data;
}

export async function createAdminProduct(payload: ProductMutationInput) {
  const res = await apiRequest<ApiSuccessResponse<ProductDetail>>({
    path: '/v1/admin/products',
    method: 'POST',
    body: payload
  });
  return res.data;
}

export async function updateAdminProduct(id: string, payload: Partial<ProductMutationInput>) {
  const res = await apiRequest<ApiSuccessResponse<ProductDetail>>({
    path: `/v1/admin/products/${id}`,
    method: 'PUT',
    body: payload
  });
  return res.data;
}

export async function deleteAdminProduct(id: string) {
  await apiRequest<void>({
    path: `/v1/admin/products/${id}`,
    method: 'DELETE'
  });
}

export async function fetchAdminUsers() {
  const res = await apiRequest<ApiSuccessResponse<UserSummary[]>>({
    path: '/v1/users'
  });
  return res.data;
}

export async function createAdminUser(input: CreateUserInput) {
  const res = await apiRequest<ApiSuccessResponse<UserSummary>>({
    path: '/v1/users',
    method: 'POST',
    body: input
  });
  return res.data;
}

export async function updateAdminUser(id: string, input: UpdateUserInput) {
  const res = await apiRequest<ApiSuccessResponse<UserSummary>>({
    path: `/v1/users/${id}`,
    method: 'PUT',
    body: input
  });
  return res.data;
}

export async function deleteAdminUser(id: string) {
  await apiRequest<void>({
    path: `/v1/users/${id}`,
    method: 'DELETE'
  });
}

export async function fetchAdminReviews() {
  const res = await apiRequest<ApiSuccessResponse<CustomerReviewDetail[]>>({
    path: '/v1/admin/reviews'
  });
  return res.data;
}

export async function fetchAdminReviewStats() {
  const res = await apiRequest<ApiSuccessResponse<ReviewStatsResponse>>({
    path: '/v1/admin/reviews/stats'
  });
  return res.data;
}

export async function createAdminReview(input: ReviewMutationInput) {
  const res = await apiRequest<ApiSuccessResponse<CustomerReviewDetail>>({
    path: '/v1/admin/reviews',
    method: 'POST',
    body: input
  });
  return res.data;
}

export async function updateAdminReview(id: string, input: Partial<ReviewMutationInput>) {
  const res = await apiRequest<ApiSuccessResponse<CustomerReviewDetail>>({
    path: `/v1/admin/reviews/${id}`,
    method: 'PUT',
    body: input
  });
  return res.data;
}

export async function deleteAdminReview(id: string) {
  await apiRequest<void>({
    path: `/v1/admin/reviews/${id}`,
    method: 'DELETE'
  });
}
