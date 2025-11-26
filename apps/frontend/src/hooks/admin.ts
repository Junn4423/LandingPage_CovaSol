'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminBlogPost,
  createAdminProduct,
  createAdminUser,
  deleteAdminBlogPost,
  deleteAdminProduct,
  deleteAdminUser,
  fetchAdminBlogPosts,
  fetchAdminOverview,
  fetchAdminProducts,
  fetchAdminUsers,
  fetchCurrentUser,
  login,
  logout,
  updateAdminBlogPost,
  updateAdminProduct,
  updateAdminUser,
  type BlogMutationInput,
  type CreateUserInput,
  type ProductMutationInput,
  type UpdateUserInput
} from '@/lib/admin-api';
import type { BlogPostDetail, ProductDetail, UserSummary } from '@/types/content';

const ADMIN_QUERY_KEYS = {
  session: ['admin', 'session'] as const,
  overview: ['admin', 'overview'] as const,
  blogList: ['admin', 'blog', 'list'] as const,
  productList: ['admin', 'products', 'list'] as const,
  userList: ['admin', 'users', 'list'] as const
};

export function useAdminSession() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.session,
    queryFn: fetchCurrentUser,
    retry: false
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.session });
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.session });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.blogList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.productList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.userList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.overview,
    queryFn: fetchAdminOverview,
    staleTime: 30_000
  });
}

export function useAdminBlogPosts() {
  return useQuery<BlogPostDetail[]>({
    queryKey: ADMIN_QUERY_KEYS.blogList,
    queryFn: fetchAdminBlogPosts
  });
}

export interface SaveBlogPostInput extends BlogMutationInput {
  id?: string;
}

export function useSaveBlogPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaveBlogPostInput) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return updateAdminBlogPost(id, rest);
      }
      return createAdminBlogPost(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.blogList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export function useDeleteBlogPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.blogList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export function useAdminProducts() {
  return useQuery<ProductDetail[]>({
    queryKey: ADMIN_QUERY_KEYS.productList,
    queryFn: fetchAdminProducts
  });
}

export interface SaveProductInput extends ProductMutationInput {
  id?: string;
}

export function useSaveProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaveProductInput) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return updateAdminProduct(id, rest);
      }
      return createAdminProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.productList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.productList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export function useAdminUsers() {
  return useQuery<UserSummary[]>({
    queryKey: ADMIN_QUERY_KEYS.userList,
    queryFn: fetchAdminUsers
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.userList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export interface UpdateUserPayload extends UpdateUserInput {
  id: string;
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateUserPayload) => updateAdminUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.userList });
    }
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.userList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}
