import { apiRequest } from '@/lib/api-client';
import type { ApiSuccessResponse, AdminOverviewStats } from '@/types/api';
import type {
  BlogPostDetail,
  BlogStatus,
  ProductDetail,
  ProductMetric,
  ProductStatus,
  UserSummary
} from '@/types/content';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface BlogMutationInput {
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
  heroImage?: string | null;
  status?: BlogStatus;
  publishedAt?: string | null;
  slug?: string;
}

export interface ProductMutationInput {
  name: string;
  headline: string;
  summary: string;
  description: string;
  category: string;
  thumbnail?: string | null;
  features?: string[];
  metrics?: ProductMetric[];
  status?: ProductStatus;
  publishedAt?: string | null;
  slug?: string;
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
  const res = await apiRequest<ApiSuccessResponse<BlogPostDetail[]>>({
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
  const res = await apiRequest<ApiSuccessResponse<ProductDetail[]>>({
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
