import { BlogPostDetail, BlogPostSummary, ProductDetail, ProductSummary } from '@/types/content';

export const heroHighlights = [
  {
    title: 'Tăng tốc chuyển đổi số',
    description: 'Tư vấn chiến lược, thiết kế trải nghiệm và triển khai giải pháp theo nhu cầu doanh nghiệp.'
  },
  {
    title: 'Giải pháp tuỳ chỉnh 100%',
    description: 'Đội ngũ chuyên gia AI/Cloud/IoT đảm bảo sản phẩm phù hợp quy trình nội bộ của bạn.'
  },
  {
    title: 'Đồng hành dài hạn',
    description: 'Lộ trình bảo trì & tối ưu sau triển khai giúp sản phẩm luôn cập nhật.'
  }
];

const productDetails: ProductDetail[] = [
  {
    id: 'virtual-assistant',
    code: 'virtual-assistant',
    slug: 'virtual-assistant',
    name: 'Virtual Assistant Platform',
    shortDescription: 'Trả lời khách hàng tự động qua web, Zalo OA và Facebook Messenger.',
    category: 'AI',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    description:
      'Nền tảng trợ lý ảo được thiết kế chuyên biệt cho doanh nghiệp Việt với khả năng hiểu ngôn ngữ tự nhiên và tích hợp hệ thống sẵn có. Bộ workflow builder trực quan giúp đội CSKH tự điều chỉnh kịch bản chỉ trong vài phút.',
    featureTags: ['AI Chatbot', 'Multi-channel', 'Analytics'],
    highlights: [
      'Kết nối đa kênh (Web Widget, Facebook, Zalo OA, Hotline)',
      'Hệ thống đào tạo tri thức từ tài liệu nội bộ',
      'Dashboard realtime phân tích hội thoại'
    ]
  },
  {
    id: 'manufacturing-mes',
    code: 'manufacturing-mes',
    slug: 'manufacturing-mes',
    name: 'Manufacturing MES',
    shortDescription: 'Tối ưu dây chuyền với dashboard thời gian thực và cảnh báo bất thường.',
    category: 'MES',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    description:
      'Hệ thống MES tập trung giúp giám sát hiệu suất từng chuyền và đồng bộ dữ liệu với ERP hiện hữu. Giải pháp hỗ trợ cả mô hình on-premise lẫn cloud để phù hợp yêu cầu bảo mật.',
    featureTags: ['Real-time', 'OEE Tracking', 'Mobile App'],
    highlights: [
      'Giám sát OEE và downtime realtime',
      'Quản lý lệnh sản xuất và truy xuất nguồn gốc',
      'Ứng dụng di động cho tổ trưởng'
    ]
  },
  {
    id: 'ecommerce-platform',
    code: 'ecommerce-platform',
    slug: 'ecommerce-platform',
    name: 'E-Commerce Platform',
    shortDescription: 'Giải pháp thương mại điện tử hoàn chỉnh cho doanh nghiệp.',
    category: 'E-Commerce',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    description:
      'Nền tảng thương mại điện tử được tối ưu hoá cho thị trường Việt Nam, tích hợp sẵn các cổng thanh toán phổ biến và hệ thống vận chuyển.',
    featureTags: ['Payment Gateway', 'Inventory', 'Analytics'],
    highlights: [
      'Tích hợp VNPay, Momo, ZaloPay',
      'Quản lý kho hàng đa kênh',
      'Dashboard phân tích doanh thu'
    ]
  }
];

const blogPostDetails: BlogPostDetail[] = [
  {
    id: 'ai-trend-2025',
    code: 'ai-trend-2025',
    slug: 'xu-huong-ai-2025',
    title: '5 xu hướng AI doanh nghiệp cần chuẩn bị cho 2025',
    excerpt: 'Cập nhật nhanh những ứng dụng AI giúp doanh nghiệp tăng trưởng bền vững.',
    publishedAt: '2025-10-02',
    author: 'COVASOL Team',
    heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    category: 'AI & Technology',
    tags: ['AI', 'Automation'],
    status: 'published',
    content:
      'AI đang dịch chuyển từ các thử nghiệm rời rạc sang chiến lược vận hành lõi. Doanh nghiệp cần chuẩn bị nền tảng dữ liệu, kiến trúc tích hợp và văn hoá thử nghiệm để tận dụng làn sóng mới. COVASOL đề xuất mô hình đánh giá mức độ sẵn sàng trong 4 tuần giúp doanh nghiệp xác định điểm khởi đầu rõ ràng.\n\nCác ca triển khai thực tế cho thấy việc kết hợp AI với workflow nội bộ mang lại hiệu quả cao hơn so với giải pháp đóng gói.'
  },
  {
    id: 'product-design',
    code: 'product-design',
    slug: 'toan-canh-product-design',
    title: 'Product Design: Từ ý tưởng đến MVP trong 6 tuần',
    excerpt: 'Quy trình tinh gọn giúp bạn kiểm chứng giả thuyết nhanh chóng và hiệu quả.',
    publishedAt: '2025-09-12',
    author: 'Lan Huong',
    heroImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80',
    category: 'Product Design',
    tags: ['Product', 'Design Sprint'],
    status: 'published',
    content:
      'Để rút ngắn thời gian ra mắt sản phẩm, đội ngũ product cần một khung làm việc thống nhất với business và tech. COVASOL sử dụng phương pháp 6 tuần bao gồm Discovery, Experience Design, Prototyping và Validation.'
  },
  {
    id: 'digital-transformation',
    code: 'digital-transformation',
    slug: 'chuyen-doi-so-doanh-nghiep',
    title: 'Chuyển đổi số: Bắt đầu từ đâu cho doanh nghiệp SME?',
    excerpt: 'Hướng dẫn chi tiết các bước chuyển đổi số cho doanh nghiệp vừa và nhỏ.',
    publishedAt: '2025-08-28',
    author: 'COVASOL Team',
    heroImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    category: 'Digital Transformation',
    tags: ['Digital', 'SME', 'Strategy'],
    status: 'published',
    content:
      'Chuyển đổi số không chỉ là áp dụng công nghệ mà là thay đổi cách vận hành doanh nghiệp. Bài viết này sẽ hướng dẫn bạn từng bước cụ thể để bắt đầu hành trình chuyển đổi số.'
  }
];

export const mockProductDetails = productDetails;
export const mockProducts: ProductSummary[] = productDetails.map(({ description, featureTags, highlights, ...summary }) => summary);

export const mockBlogPostDetails = blogPostDetails;
export const mockBlogPosts: BlogPostSummary[] = blogPostDetails.map(({ content, tags, ...summary }) => summary);
