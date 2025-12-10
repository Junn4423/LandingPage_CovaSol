'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminBlogPost,
  createAdminProduct,
  createAdminReview,
  createAdminUser,
  deleteAdminBlogPost,
  deleteAdminProduct,
  deleteAdminReview,
  deleteAdminUser,
  deleteAlbumImage,
  fetchAdminBlogPosts,
  fetchAdminCookieConsents,
  fetchAdminOverview,
  fetchAdminProducts,
  fetchAdminReviewStats,
  fetchAdminReviews,
  fetchAdminUsers,
  fetchAdminVisitLogs,
  fetchAlbumImages,
  fetchCurrentUser,
  login,
  logout,
  uploadAdminMedia,
  updateAdminBlogPost,
  updateAdminProduct,
  updateAdminReview,
  updateAdminUser,
  fetchMyPostsEditRequests,
  fetchMyEditRequests,
  fetchEditRequestDetail,
  approveEditRequest as approveEditRequestApi,
  rejectEditRequest as rejectEditRequestApi,
  deleteEditRequest as deleteEditRequestApi,
  type BlogMutationInput,
  type CreateUserInput,
  type ProductMutationInput,
  type ReviewMutationInput,
  type ReviewStatsResponse,
  type UploadMediaResponse,
  type UpdateUserInput,
  type EditRequestSummary,
  type EditRequestDetail
} from '@/lib/admin-api';
import type { AdminConsentResponse, AdminOverviewStats, VisitLogResponse } from '@/types/api';
import type { BlogPostDetail, CustomerReviewDetail, ProductDetail, UserSummary } from '@/types/content';

const ADMIN_QUERY_KEYS = {
  session: ['admin', 'session'] as const,
  overview: ['admin', 'overview'] as const,
  visits: ['admin', 'visits'] as const,
  consents: ['admin', 'consents'] as const,
  blogList: ['admin', 'blog', 'list'] as const,
  productList: ['admin', 'products', 'list'] as const,
  userList: ['admin', 'users', 'list'] as const,
  reviewList: ['admin', 'reviews', 'list'] as const,
  reviewStats: ['admin', 'reviews', 'stats'] as const
};

export function useUploadMediaMutation() {
  return useMutation<UploadMediaResponse, unknown, { file: File; folder?: string }>({
    mutationFn: ({ file, folder }) => uploadAdminMedia(file, folder)
  });
}

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
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reviewList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reviewStats });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.visits });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.consents });
    }
  });
}

export function useAdminOverview() {
  return useQuery<AdminOverviewStats>({
    queryKey: ADMIN_QUERY_KEYS.overview,
    queryFn: fetchAdminOverview,
    staleTime: 30_000
  });
}

export function useAdminVisitLogs(limit?: number) {
  return useQuery<VisitLogResponse>({
    queryKey: [...ADMIN_QUERY_KEYS.visits, limit],
    queryFn: () => fetchAdminVisitLogs(limit),
    staleTime: 30_000
  });
}

export function useAdminCookieConsents(params?: { page?: number; pageSize?: number }) {
  return useQuery<AdminConsentResponse>({
    queryKey: [...ADMIN_QUERY_KEYS.consents, params?.page ?? 1, params?.pageSize ?? 20],
    queryFn: () => fetchAdminCookieConsents(params),
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
      const { id, ...rest } = payload;
      if (id) {
        return updateAdminBlogPost(id, rest);
      }
      return createAdminBlogPost(rest);
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
      const { id, ...rest } = payload;
      if (id) {
        return updateAdminProduct(id, rest);
      }
      return createAdminProduct(rest);
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

export function useAdminReviews() {
  return useQuery<CustomerReviewDetail[]>({
    queryKey: ADMIN_QUERY_KEYS.reviewList,
    queryFn: fetchAdminReviews
  });
}

export function useAdminReviewStats() {
  return useQuery<ReviewStatsResponse>({
    queryKey: ADMIN_QUERY_KEYS.reviewStats,
    queryFn: fetchAdminReviewStats,
    staleTime: 60_000
  });
}

export interface SaveReviewInput extends ReviewMutationInput {
  id?: string;
}

export function useSaveReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: SaveReviewInput) => {
      if (id) {
        return updateAdminReview(id, input);
      }
      return createAdminReview(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reviewList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reviewStats });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reviewList });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.reviewStats });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.overview });
    }
  });
}

// Album / Cloudinary Image Management
export function useAlbumImages(options?: { folder?: string; maxResults?: number }) {
  return useQuery({
    queryKey: ['admin', 'album', options?.folder ?? 'all', options?.maxResults ?? 100] as const,
    queryFn: () => fetchAlbumImages(options),
    staleTime: 30_000
  });
}

export function useDeleteAlbumImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlbumImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'album'] });
    }
  });
}

// =====================================================
// Blog Edit Request Hooks
// =====================================================

const EDIT_REQUEST_QUERY_KEYS = {
  myPostsRequests: ['admin', 'edit-requests', 'my-posts'] as const,
  myRequests: ['admin', 'edit-requests', 'my-requests'] as const,
  detail: (id: number) => ['admin', 'edit-requests', id] as const
};

export function useMyPostsEditRequests() {
  return useQuery<EditRequestSummary[]>({
    queryKey: EDIT_REQUEST_QUERY_KEYS.myPostsRequests,
    queryFn: fetchMyPostsEditRequests,
    staleTime: 30_000
  });
}

export function useMyEditRequests() {
  return useQuery<EditRequestSummary[]>({
    queryKey: EDIT_REQUEST_QUERY_KEYS.myRequests,
    queryFn: fetchMyEditRequests,
    staleTime: 30_000
  });
}

export function useEditRequestDetail(requestId: number) {
  return useQuery<EditRequestDetail>({
    queryKey: EDIT_REQUEST_QUERY_KEYS.detail(requestId),
    queryFn: () => fetchEditRequestDetail(requestId),
    enabled: requestId > 0
  });
}

export function useApproveEditRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reviewNote }: { requestId: number; reviewNote?: string }) => 
      approveEditRequestApi(requestId, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDIT_REQUEST_QUERY_KEYS.myPostsRequests });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.blogList });
    }
  });
}

export function useRejectEditRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reviewNote }: { requestId: number; reviewNote?: string }) => 
      rejectEditRequestApi(requestId, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDIT_REQUEST_QUERY_KEYS.myPostsRequests });
    }
  });
}

export function useDeleteEditRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEditRequestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDIT_REQUEST_QUERY_KEYS.myRequests });
    }
  });
}
