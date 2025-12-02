import 'server-only';

import { apiRequest } from '@/lib/api-client';
import { mockProductDetails, mockProducts } from '@/lib/sample-data';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProductDetail, ProductSummary } from '@/types/content';

const PRODUCT_LIST_REVALIDATE = 45;
const PRODUCT_DETAIL_REVALIDATE = 60;

export async function fetchProductSummaries(): Promise<ProductSummary[]> {
  try {
    const response = await apiRequest<ApiSuccessResponse<ProductSummary[]>>({
      path: '/v1/products',
      nextOptions: {
        next: { revalidate: PRODUCT_LIST_REVALIDATE }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể tải danh sách sản phẩm từ API', error);
    return mockProducts;
  }
}

export async function fetchProductDetail(identifier: string): Promise<ProductDetail | null> {
  try {
    const response = await apiRequest<ApiSuccessResponse<ProductDetail>>({
      path: `/v1/products/${identifier}`,
      nextOptions: {
        next: { revalidate: PRODUCT_DETAIL_REVALIDATE }
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Không thể tải sản phẩm ${identifier}`, error);
    return mockProductDetails.find(product => product.id === identifier || product.slug === identifier) ?? null;
  }
}
