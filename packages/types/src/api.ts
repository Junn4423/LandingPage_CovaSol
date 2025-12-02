export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export interface AdminOverviewStats {
  blogs: number;
  products: number;
  users: number;
  reviews: number;
  lastUpdated: string;
}
