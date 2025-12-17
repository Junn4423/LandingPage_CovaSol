import { apiRequest } from '@/lib/api-client';
import type {
  ApiSuccessResponse,
  AdminOverviewStats,
  AdminConsentResponse,
  VisitLogResponse,
  TrafficStatus
} from '@/types/api';
import type {
  BlogPostDetail,
  ProductDetail,
  UserSummary,
  CustomerReviewDetail
} from '@/types/content';

export interface UploadMediaResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

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
  avatar?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: string;
  password?: string;
  avatar?: string | null;
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

export async function fetchAdminTrafficStatus() {
  const res = await apiRequest<ApiSuccessResponse<TrafficStatus>>({
    path: '/v1/admin/analytics/traffic'
  });
  return res.data;
}

export async function fetchAdminVisitLogs(limit?: number) {
  const query = typeof limit === 'number' ? `?limit=${limit}` : '';
  const res = await apiRequest<ApiSuccessResponse<VisitLogResponse>>({
    path: `/v1/admin/analytics/visits${query}`
  });
  return res.data;
}

export async function fetchAdminCookieConsents(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  const suffix = query.toString() ? `?${query.toString()}` : '';

  const res = await apiRequest<ApiSuccessResponse<AdminConsentResponse>>({
    path: `/v1/admin/analytics/consents${suffix}`
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

export async function uploadAdminMedia(file: File, folder?: string) {
  const form = new FormData();
  form.append('file', file);
  if (folder) {
    form.append('folder', folder);
  }

  const res = await apiRequest<UploadMediaResponse | ApiSuccessResponse<UploadMediaResponse>>({
    path: '/v1/admin/uploads/images',
    method: 'POST',
    body: form
  });
  // Backend returns the media payload directly (not wrapped). Support both shapes.
  return (res as ApiSuccessResponse<UploadMediaResponse>).data ?? (res as UploadMediaResponse);
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

// Album / Cloudinary Image Management
export interface CloudinaryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: string;
  folder: string;
}

export interface AlbumListResponse {
  images: CloudinaryImage[];
  nextCursor?: string;
  totalCount?: number;
}

export async function fetchAlbumImages(options?: {
  folder?: string;
  maxResults?: number;
  nextCursor?: string;
}) {
  const params = new URLSearchParams();
  if (options?.folder) params.append('folder', options.folder);
  if (options?.maxResults) params.append('maxResults', options.maxResults.toString());
  if (options?.nextCursor) params.append('nextCursor', options.nextCursor);
  
  const queryString = params.toString();
  const res = await apiRequest<ApiSuccessResponse<AlbumListResponse>>({
    path: `/v1/admin/uploads/album${queryString ? `?${queryString}` : ''}`
  });
  return res.data;
}

export async function deleteAlbumImage(publicId: string) {
  await apiRequest<void>({
    path: `/v1/admin/uploads/images/${encodeURIComponent(publicId)}`,
    method: 'DELETE'
  });
}

// =====================================================
// Blog Edit Request APIs
// =====================================================

export interface EditRequestSummary {
  id: number;
  blogPostId: number;
  blogPostTitle: string;
  requesterId: number;
  requesterName: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface EditRequestDetail extends EditRequestSummary {
  proposedData: Record<string, unknown>;
  reviewNote: string | null;
}

export async function fetchMyPostsEditRequests() {
  const res = await apiRequest<ApiSuccessResponse<EditRequestSummary[]>>({
    path: '/v1/admin/blog/edit-requests/my-posts'
  });
  return res.data;
}

export async function fetchMyEditRequests() {
  const res = await apiRequest<ApiSuccessResponse<EditRequestSummary[]>>({
    path: '/v1/admin/blog/edit-requests/my-requests'
  });
  return res.data;
}

export async function fetchEditRequestsForPost(postId: string | number) {
  const res = await apiRequest<ApiSuccessResponse<EditRequestSummary[]>>({
    path: `/v1/admin/blog/${postId}/edit-requests`
  });
  return res.data;
}

export async function fetchEditRequestDetail(requestId: number) {
  const res = await apiRequest<ApiSuccessResponse<EditRequestDetail>>({
    path: `/v1/admin/blog/edit-requests/${requestId}`
  });
  return res.data;
}

export async function approveEditRequest(requestId: number, reviewNote?: string) {
  const res = await apiRequest<ApiSuccessResponse<EditRequestDetail>>({
    path: `/v1/admin/blog/edit-requests/${requestId}/approve`,
    method: 'POST',
    body: { reviewNote }
  });
  return res.data;
}

export async function rejectEditRequest(requestId: number, reviewNote?: string) {
  const res = await apiRequest<ApiSuccessResponse<EditRequestDetail>>({
    path: `/v1/admin/blog/edit-requests/${requestId}/reject`,
    method: 'POST',
    body: { reviewNote }
  });
  return res.data;
}

export async function deleteEditRequest(requestId: number) {
  await apiRequest<void>({
    path: `/v1/admin/blog/edit-requests/${requestId}`,
    method: 'DELETE'
  });
}

// =====================================================
// System Logs APIs
// =====================================================

export interface SystemLogItem {
  id: number;
  action: string;
  resource: string;
  resourceId: string | null;
  description: string | null;
  ipAddress: string;
  userAgent: string | null;
  userId: number | null;
  username: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  duration: number | null;
  requestBody: unknown | null;
  responseSize: number | null;
  createdAt: string;
}

export interface SystemLogFilters {
  action?: string;
  resource?: string;
  ipAddress?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface SystemLogsResponse {
  items: SystemLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LogStatsResponse {
  totalLogs: number;
  logsLast24h: number;
  logsLastHour: number;
  uniqueIPs24h: number;
  actionBreakdown: { action: string; count: number }[];
  resourceBreakdown: { resource: string; count: number }[];
  recentErrors: SystemLogItem[];
  avgRequestsPerHour: number;
}

export interface ThreatIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
  description: string;
}

export interface IPThreatAnalysis {
  ipAddress: string;
  threatScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: ThreatIndicator[];
  stats: {
    totalRequests: number;
    requestsLastHour: number;
    requestsLast24h: number;
    uniquePaths: number;
    errorRate: number;
    avgRequestsPerMinute: number;
    userAgentCount: number;
    suspiciousPatterns: string[];
  };
  recommendation: string;
}

export interface BlockedIPItem {
  id: number;
  ipAddress: string;
  reason: string;
  threatScore: number;
  requestCount: number;
  blockedAt: string;
  blockedBy: number | null;
  blockedByName: string | null;
  expiresAt: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLogsDashboard {
  logStats: LogStatsResponse;
  blockedIPsCount: number;
  blockedIPs: BlockedIPItem[];
  topSuspiciousIPs: IPThreatAnalysis[];
  filterOptions: { actions: string[]; resources: string[] };
  highThreatCount: number;
  criticalThreatCount: number;
}

export async function fetchSystemLogsDashboard() {
  const res = await apiRequest<ApiSuccessResponse<SystemLogsDashboard>>({
    path: '/v1/admin/system-logs/dashboard'
  });
  return res.data;
}

export async function fetchSystemLogs(filters?: SystemLogFilters) {
  const params = new URLSearchParams();
  if (filters?.action) params.append('action', filters.action);
  if (filters?.resource) params.append('resource', filters.resource);
  if (filters?.ipAddress) params.append('ipAddress', filters.ipAddress);
  if (filters?.userId) params.append('userId', filters.userId.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

  const queryString = params.toString();
  const res = await apiRequest<ApiSuccessResponse<SystemLogsResponse>>({
    path: `/v1/admin/system-logs${queryString ? `?${queryString}` : ''}`
  });
  return res.data;
}

export async function fetchLogStats() {
  const res = await apiRequest<ApiSuccessResponse<LogStatsResponse>>({
    path: '/v1/admin/system-logs/stats'
  });
  return res.data;
}

export async function fetchIPThreatAnalysis(ip: string) {
  const res = await apiRequest<ApiSuccessResponse<IPThreatAnalysis>>({
    path: `/v1/admin/system-logs/ip-analysis/${encodeURIComponent(ip)}`
  });
  return res.data;
}

export async function fetchSuspiciousIPs(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';
  const res = await apiRequest<ApiSuccessResponse<IPThreatAnalysis[]>>({
    path: `/v1/admin/system-logs/suspicious-ips${query}`
  });
  return res.data;
}

export async function fetchBlockedIPs(includeInactive = false) {
  const query = includeInactive ? '?includeInactive=true' : '';
  const res = await apiRequest<ApiSuccessResponse<BlockedIPItem[]>>({
    path: `/v1/admin/system-logs/blocked-ips${query}`
  });
  return res.data;
}

export async function blockIPAddress(input: {
  ipAddress: string;
  reason: string;
  expiresAt?: string | null;
  notes?: string;
}) {
  const res = await apiRequest<ApiSuccessResponse<BlockedIPItem>>({
    path: '/v1/admin/system-logs/block-ip',
    method: 'POST',
    body: input
  });
  return res.data;
}

export async function unblockIPAddress(ipAddress: string) {
  const res = await apiRequest<ApiSuccessResponse<BlockedIPItem>>({
    path: '/v1/admin/system-logs/unblock-ip',
    method: 'POST',
    body: { ipAddress }
  });
  return res.data;
}
