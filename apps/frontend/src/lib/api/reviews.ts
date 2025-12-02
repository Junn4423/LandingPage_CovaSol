import 'server-only';

import { apiRequest } from '@/lib/api-client';
import type { ApiSuccessResponse } from '@/types/api';

export interface ReviewSummary {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  quote: string;
  bgColor: string;
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: { label: string; count: number; percent: number }[];
}

const REVIEW_LIST_REVALIDATE = 60;
const REVIEW_STATS_REVALIDATE = 120;

// Fallback data nếu API không available
const fallbackReviews: ReviewSummary[] = [
  {
    id: '1',
    name: 'Nguyễn Minh Tuấn',
    role: 'CEO - TechStart JSC',
    rating: 5,
    quote: 'COVASOL đã giúp chúng tôi xây dựng hệ thống ERP hoàn chỉnh. Đội ngũ rất chuyên nghiệp, giao hàng đúng hẹn và hỗ trợ tận tình sau bàn giao.',
    bgColor: '#3F51B5',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Trần Thị Lan',
    role: 'Giám đốc Marketing - BeautyShop',
    rating: 5,
    quote: 'Website và app mobile do COVASOL phát triển đã giúp doanh thu online tăng 300%. UI/UX rất đẹp và dễ sử dụng.',
    bgColor: '#E91E63',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Lê Văn Hùng',
    role: 'CTO - FinanceCore',
    rating: 4.5,
    quote: 'Hệ thống API và microservice rất ổn định. COVASOL hiểu rõ yêu cầu kỹ thuật và đưa ra giải pháp phù hợp.',
    bgColor: '#009688',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Phạm Thị Mai',
    role: 'Founder - EduTech Vietnam',
    rating: 5,
    quote: 'Nền tảng học trực tuyến được xây dựng rất chuyên nghiệp. Học sinh và giáo viên đều phản hồi tích cực về giao diện và tính năng.',
    bgColor: '#FF5722',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Hoàng Đức Thánh',
    role: 'Giám đốc - Logistics Plus',
    rating: 4,
    quote: 'Hệ thống quản lý vận chuyển giúp tối ưu tuyến đường và giảm 25% chi phí nhiên liệu. Tính năng tracking real-time rất hữu ích.',
    bgColor: '#673AB7',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Nguyễn Thị Hương',
    role: 'HR Manager - GreenTech Co.',
    rating: 4.5,
    quote: 'App HR quản lý nhân sự rất tiện lợi. Nhân viên có thể chấm công, xin phép và theo dõi lương dễ dàng.',
    bgColor: '#4CAF50',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Võ Minh Khôi',
    role: 'CEO - SmartHome Solutions',
    rating: 5,
    quote: 'Hệ thống IoT và dashboard monitoring hoạt động cực kỳ ổn định. COVASOL có kiến thức sâu về công nghệ mới nhất.',
    bgColor: '#2196F3',
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Đặng Thị Ngọc',
    role: 'Marketing Director - FoodieHub',
    rating: 3.5,
    quote: 'App giao đồ ăn ra mắt đúng tiến độ. Một số tính năng cần tiếp tục hoàn thiện nhưng nhìn chung đã đáp ứng yêu cầu cốt lõi.',
    bgColor: '#FF9800',
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Trịnh Vân Nam',
    role: 'Owner - RetailChain VN',
    rating: 5,
    quote: 'Hệ thống POS và quản lý chuỗi cửa hàng hoạt động mượt mà. Báo cáo thống kê chi tiết giúp ra quyết định chính xác.',
    bgColor: '#795548',
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Lữ Thị Đinh',
    role: 'CFO - InvestSmart',
    rating: 4,
    quote: 'Nền tảng fintech được phát triển với tính bảo mật cao. API tích hợp ngân hàng hoạt động ổn định và tuân thủ quy định.',
    bgColor: '#607D8B',
    createdAt: new Date().toISOString()
  },
  {
    id: '11',
    name: 'Bùi Hoàng Long',
    role: 'CTO - HealthCare Tech',
    rating: 4.5,
    quote: 'Hệ thống quản lý bệnh viện giúp số hoá quy trình khám chữa bệnh. Bác sĩ và bệnh nhân đều hài lòng.',
    bgColor: '#00BCD4',
    createdAt: new Date().toISOString()
  },
  {
    id: '12',
    name: 'Cao Thị Minh',
    role: 'Operations Manager - LogiFlow',
    rating: 4,
    quote: 'Automation workflow tiết kiệm 40% thời gian xử lý đơn hàng. Tích hợp với các hệ thống có sẵn rất mượt.',
    bgColor: '#9C27B0',
    createdAt: new Date().toISOString()
  },
  {
    id: '13',
    name: 'Đinh Văn Tài',
    role: 'Founder - AgriTech Vietnam',
    rating: 5,
    quote: 'Nền tảng nông nghiệp thông minh kết nối nông dân với người tiêu dùng rất hiệu quả. Giao diện dễ dùng cho mọi lứa tuổi.',
    bgColor: '#8BC34A',
    createdAt: new Date().toISOString()
  },
  {
    id: '14',
    name: 'Võ Thị Thu',
    role: 'Brand Manager - FashionHub',
    rating: 3.5,
    quote: 'Website thương mại điện tử có thiết kế đẹp mắt. Một số chức năng checkout cần tối ưu thêm để tăng conversion rate.',
    bgColor: '#F44336',
    createdAt: new Date().toISOString()
  },
  {
    id: '15',
    name: 'Phan Minh Đức',
    role: 'IT Manager - AutoService',
    rating: 4.5,
    quote: 'Hệ thống quản lý garage ô tô với booking online rất tiện lợi. Khách hàng có thể đặt lịch và theo dõi tiến độ sửa chữa.',
    bgColor: '#03A9F4',
    createdAt: new Date().toISOString()
  },
  {
    id: '16',
    name: 'Đỗ Thị Linh',
    role: 'Director - RealEstate Pro',
    rating: 4,
    quote: 'Nền tảng bất động sản có tính năng tìm kiếm thông minh và bản đồ tương tác. Giúp tăng 50% leads chất lượng.',
    bgColor: '#673AB7',
    createdAt: new Date().toISOString()
  },
  {
    id: '17',
    name: 'Hà Quang Minh',
    role: 'CEO - TravelSmart',
    rating: 5,
    quote: 'App du lịch với AI recommendation rất ấn tượng. Khách hàng có thể lên kế hoạch và đặt trọn bộ chuyến đi chỉ trong vài click.',
    bgColor: '#009688',
    createdAt: new Date().toISOString()
  },
  {
    id: '18',
    name: 'Ngô Thị Vân',
    role: 'Product Manager - SportsTech',
    rating: 3.5,
    quote: 'App thể thao với tracking workout khá tốt. Performance tracking chính xác nhưng UI cần cải thiện để thân thiện hơn.',
    bgColor: '#E91E63',
    createdAt: new Date().toISOString()
  },
  {
    id: '19',
    name: 'Lương Văn Khang',
    role: 'Technical Lead - CloudFirst',
    rating: 4.5,
    quote: 'Migration từ on-premise lên cloud do COVASOL thực hiện rất chuyên nghiệp. Zero downtime và hiệu năng tăng đáng kể.',
    bgColor: '#FF5722',
    createdAt: new Date().toISOString()
  },
  {
    id: '20',
    name: 'Trương Thị Hạnh',
    role: 'COO - MediaStreaming',
    rating: 4,
    quote: 'Nền tảng streaming video có khả năng scale tốt. Xử lý hàng nghìn user cùng lúc mà không bị lag hay buffering.',
    bgColor: '#4CAF50',
    createdAt: new Date().toISOString()
  }
];

const fallbackStats: ReviewStats = {
  totalReviews: 20,
  averageRating: 4.4,
  ratingBreakdown: [
    { label: '5 sao', count: 12, percent: 60 },
    { label: '4 sao', count: 8, percent: 40 },
    { label: '3 sao', count: 0, percent: 0 }
  ]
};

export async function fetchReviews(): Promise<ReviewSummary[]> {
  try {
    const response = await apiRequest<ApiSuccessResponse<ReviewSummary[]>>({
      path: '/v1/reviews',
      nextOptions: {
        next: { revalidate: REVIEW_LIST_REVALIDATE }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể tải danh sách đánh giá từ API', error);
    return fallbackReviews;
  }
}

export async function fetchReviewStats(): Promise<ReviewStats> {
  try {
    const response = await apiRequest<ApiSuccessResponse<ReviewStats>>({
      path: '/v1/reviews/stats',
      nextOptions: {
        next: { revalidate: REVIEW_STATS_REVALIDATE }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể tải thống kê đánh giá từ API', error);
    return fallbackStats;
  }
}
