import 'server-only';

import { apiRequest } from '@/lib/api-client';
import type { ApiSuccessResponse } from '@/types/api';

export interface VisitOverview {
  uniqueVisitors: number;
  totalVisits: number;
  lastVisitedAt: string | null;
}

const VISIT_OVERVIEW_REVALIDATE = 120;

export async function fetchVisitOverview(): Promise<VisitOverview | null> {
  try {
    const response = await apiRequest<ApiSuccessResponse<VisitOverview>>({
      path: '/v1/analytics/overview',
      nextOptions: {
        next: { revalidate: VISIT_OVERVIEW_REVALIDATE }
      }
    });

    return response.data;
  } catch (error) {
    console.error('Không thể tải thống kê lượt truy cập', error);
    return null;
  }
}
