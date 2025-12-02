import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed database...');

  const adminPassword = process.env.ADMIN_SEED_PASSWORD || '04042003Cova*';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Tạo admin user mặc định
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      displayName: 'COVASOL Admin',
      role: 'admin'
    }
  });
  console.log('✅ Admin user đã được tạo:', admin.username);

  // Tạo bài viết blog mẫu
  const blogPosts = [
    {
      code: 'BLOG-001',
      slug: 'xu-huong-ai-2025',
      title: '5 xu hướng AI doanh nghiệp cần chuẩn bị cho 2025',
      excerpt: 'Cập nhật nhanh những ứng dụng AI giúp doanh nghiệp tăng trưởng.',
      content: 'AI đang dịch chuyển từ các thử nghiệm rời rạc sang chiến lược vận hành lõi. Doanh nghiệp cần chuẩn bị nền tảng dữ liệu, kiến trúc tích hợp và văn hoá thử nghiệm để tận dụng làn sóng mới.\n\nCOVASOL đề xuất mô hình đánh giá mức độ sẵn sàng trong 4 tuần giúp doanh nghiệp xác định điểm khởi đầu rõ ràng.',
      tags: JSON.stringify(['AI', 'Automation', 'Digital Transformation']),
      category: 'Technology',
      authorName: 'COVASOL Team',
      authorRole: 'Tech Lead',
      status: 'published',
      publishedAt: new Date('2025-10-02'),
      authorId: admin.id,
      isFeatured: 1
    },
    {
      code: 'BLOG-002',
      slug: 'toan-canh-product-design',
      title: 'Product Design: Từ ý tưởng đến MVP trong 6 tuần',
      excerpt: 'Quy trình tinh gọn giúp bạn kiểm chứng giả thuyết nhanh chóng.',
      content: 'Để rút ngắn thời gian ra mắt sản phẩm, đội ngũ product cần một khung làm việc thống nhất với business và tech.\n\nCOVASOL sử dụng phương pháp 6 tuần bao gồm Discovery, Experience Design, Prototyping và Validation.',
      tags: JSON.stringify(['Product', 'Design Sprint', 'UX']),
      category: 'Design',
      authorName: 'Lan Hương',
      authorRole: 'Product Designer',
      status: 'published',
      publishedAt: new Date('2025-09-12'),
      authorId: admin.id,
      isFeatured: 0
    }
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post
    });
  }
  console.log('✅ Đã tạo', blogPosts.length, 'bài viết mẫu');

  // Tạo sản phẩm mẫu
  const products = [
    {
      code: 'PROD-001',
      slug: 'virtual-assistant',
      name: 'Virtual Assistant Platform',
      category: 'AI',
      shortDescription: 'Trợ lý AI đa kênh - Trả lời khách hàng tự động qua web, Zalo OA và Facebook Messenger.',
      description: 'Nền tảng trợ lý ảo được thiết kế chuyên biệt cho doanh nghiệp Việt với khả năng hiểu ngôn ngữ tự nhiên và tích hợp hệ thống sẵn có. Bộ workflow builder trực quan giúp đội CSKH tự điều chỉnh kịch bản chỉ trong vài phút.',
      imageUrl: '/images/products/virtual-assistant.png',
      featureTags: JSON.stringify(['AI', 'Chatbot', 'Multi-channel']),
      highlights: JSON.stringify([
        'Kết nối đa kênh (Web Widget, Facebook, Zalo OA, Hotline)',
        'Hệ thống đào tạo tri thức từ tài liệu nội bộ',
        'Dashboard realtime phân tích hội thoại'
      ]),
      ctaPrimaryLabel: 'Dùng thử miễn phí',
      ctaPrimaryUrl: '/contact',
      status: 'active'
    },
    {
      code: 'PROD-002',
      slug: 'manufacturing-mes',
      name: 'Manufacturing MES',
      category: 'MES',
      shortDescription: 'Giải pháp điều hành sản xuất - Tối ưu dây chuyền với dashboard thời gian thực.',
      description: 'Hệ thống MES tập trung giúp giám sát hiệu suất từng chuyền và đồng bộ dữ liệu với ERP hiện hữu. Giải pháp hỗ trợ cả mô hình on-premise lẫn cloud để phù hợp yêu cầu bảo mật.',
      imageUrl: '/images/products/mes.png',
      featureTags: JSON.stringify(['MES', 'Manufacturing', 'IoT']),
      highlights: JSON.stringify([
        'Giám sát OEE và downtime realtime',
        'Quản lý lệnh sản xuất và truy xuất nguồn gốc',
        'Ứng dụng di động cho tổ trưởng'
      ]),
      ctaPrimaryLabel: 'Đặt lịch demo',
      ctaPrimaryUrl: '/contact',
      status: 'active'
    },
    {
      code: 'PROD-003',
      slug: 'iot-monitoring',
      name: 'IoT Monitoring System',
      category: 'IoT',
      shortDescription: 'Hệ thống giám sát IoT - Theo dõi thiết bị và cảm biến với dashboard realtime.',
      description: 'Nền tảng IoT cho phép thu thập dữ liệu từ hàng nghìn thiết bị, xử lý realtime và đưa ra cảnh báo thông minh. Tích hợp AI để dự đoán bảo trì và tối ưu vận hành.',
      imageUrl: '/images/products/iot.png',
      featureTags: JSON.stringify(['IoT', 'Monitoring', 'Predictive']),
      highlights: JSON.stringify([
        'Thu thập dữ liệu từ nhiều loại cảm biến',
        'Dashboard realtime và báo cáo tự động',
        'AI dự đoán bảo trì preventive'
      ]),
      ctaPrimaryLabel: 'Liên hệ tư vấn',
      ctaPrimaryUrl: '/contact',
      status: 'active'
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    });
  }
  console.log('✅ Đã tạo', products.length, 'sản phẩm mẫu');

  // Tạo đánh giá khách hàng mẫu
  const AVATAR_COLORS = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#FF9800', '#FF5722', '#795548', '#607D8B'
  ];
  
  const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const reviews = [
    {
      name: 'Nguyễn Minh Tuấn',
      role: 'CEO - TechStart JSC',
      rating: 5,
      quote: 'COVASOL đã giúp chúng tôi xây dựng hệ thống ERP hoàn chỉnh. Đội ngũ rất chuyên nghiệp, giao hàng đúng hẹn và hỗ trợ tận tình sau bàn giao.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 1
    },
    {
      name: 'Trần Thị Lan',
      role: 'Giám đốc Marketing - BeautyShop',
      rating: 5,
      quote: 'Website và app mobile do COVASOL phát triển đã giúp doanh thu online tăng 300%. UI/UX rất đẹp và dễ sử dụng.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 1
    },
    {
      name: 'Lê Văn Hùng',
      role: 'CTO - FinanceCore',
      rating: 4.5,
      quote: 'Hệ thống API và microservice rất ổn định. COVASOL hiểu rõ yêu cầu kỹ thuật và đưa ra giải pháp phù hợp.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Phạm Thị Mai',
      role: 'Founder - EduTech Vietnam',
      rating: 5,
      quote: 'Nền tảng học trực tuyến được xây dựng rất chuyên nghiệp. Học sinh và giáo viên đều phản hồi tích cực về giao diện và tính năng.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 1
    },
    {
      name: 'Hoàng Đức Thánh',
      role: 'Giám đốc - Logistics Plus',
      rating: 4,
      quote: 'Hệ thống quản lý vận chuyển giúp tối ưu tuyến đường và giảm 25% chi phí nhiên liệu. Tính năng tracking real-time rất hữu ích.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Nguyễn Thị Hương',
      role: 'HR Manager - GreenTech Co.',
      rating: 4.5,
      quote: 'App HR quản lý nhân sự rất tiện lợi. Nhân viên có thể chấm công, xin phép và theo dõi lương dễ dàng.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Võ Minh Khôi',
      role: 'CEO - SmartHome Solutions',
      rating: 5,
      quote: 'Hệ thống IoT và dashboard monitoring hoạt động cực kỳ ổn định. COVASOL có kiến thức sâu về công nghệ mới nhất.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 1
    },
    {
      name: 'Đặng Thị Ngọc',
      role: 'Marketing Director - FoodieHub',
      rating: 3.5,
      quote: 'App giao đồ ăn ra mắt đúng tiến độ. Một số tính năng cần tiếp tục hoàn thiện nhưng nhìn chung đã đáp ứng yêu cầu cốt lõi.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Trịnh Vân Nam',
      role: 'Owner - RetailChain VN',
      rating: 5,
      quote: 'Hệ thống POS và quản lý chuỗi cửa hàng hoạt động mượt mà. Báo cáo thống kê chi tiết giúp ra quyết định chính xác.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Lữ Thị Đinh',
      role: 'CFO - InvestSmart',
      rating: 4,
      quote: 'Nền tảng fintech được phát triển với tính bảo mật cao. API tích hợp ngân hàng hoạt động ổn định và tuân thủ quy định.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Bùi Hoàng Long',
      role: 'CTO - HealthCare Tech',
      rating: 4.5,
      quote: 'Hệ thống quản lý bệnh viện giúp số hoá quy trình khám chữa bệnh. Bác sĩ và bệnh nhân đều hài lòng.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Cao Thị Minh',
      role: 'Operations Manager - LogiFlow',
      rating: 4,
      quote: 'Automation workflow tiết kiệm 40% thời gian xử lý đơn hàng. Tích hợp với các hệ thống có sẵn rất mượt.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Đinh Văn Tài',
      role: 'Founder - AgriTech Vietnam',
      rating: 5,
      quote: 'Nền tảng nông nghiệp thông minh kết nối nông dân với người tiêu dùng rất hiệu quả. Giao diện dễ dùng cho mọi lứa tuổi.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Võ Thị Thu',
      role: 'Brand Manager - FashionHub',
      rating: 3.5,
      quote: 'Website thương mại điện tử có thiết kế đẹp mắt. Một số chức năng checkout cần tối ưu thêm để tăng conversion rate.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Phan Minh Đức',
      role: 'IT Manager - AutoService',
      rating: 4.5,
      quote: 'Hệ thống quản lý garage ô tô với booking online rất tiện lợi. Khách hàng có thể đặt lịch và theo dõi tiến độ sửa chữa.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Đỗ Thị Linh',
      role: 'Director - RealEstate Pro',
      rating: 4,
      quote: 'Nền tảng bất động sản có tính năng tìm kiếm thông minh và bản đồ tương tác. Giúp tăng 50% leads chất lượng.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Hà Quang Minh',
      role: 'CEO - TravelSmart',
      rating: 5,
      quote: 'App du lịch với AI recommendation rất ấn tượng. Khách hàng có thể lên kế hoạch và đặt trọn bộ chuyến đi chỉ trong vài click.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Ngô Thị Vân',
      role: 'Product Manager - SportsTech',
      rating: 3.5,
      quote: 'App thể thao với tracking workout khá tốt. Performance tracking chính xác nhưng UI cần cải thiện để thân thiện hơn.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Lương Văn Khang',
      role: 'Technical Lead - CloudFirst',
      rating: 4.5,
      quote: 'Migration từ on-premise lên cloud do COVASOL thực hiện rất chuyên nghiệp. Zero downtime và hiệu năng tăng đáng kể.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    },
    {
      name: 'Trương Thị Hạnh',
      role: 'COO - MediaStreaming',
      rating: 4,
      quote: 'Nền tảng streaming video có khả năng scale tốt. Xử lý hàng nghìn user cùng lúc mà không bị lag hay buffering.',
      bgColor: getRandomColor(),
      status: 'published',
      isFeatured: 0
    }
  ];

  // Xóa reviews cũ và tạo mới
  await prisma.customerReview.deleteMany({});
  for (const review of reviews) {
    await prisma.customerReview.create({
      data: review
    });
  }
  console.log('✅ Đã tạo', reviews.length, 'đánh giá khách hàng mẫu');

  console.log('🎉 Seed database hoàn tất!');
  console.log('📝 Admin credentials:');
  console.log('   Username: admin');
  console.log('   Password:', adminPassword);
}

main()
  .catch(err => {
    console.error('❌ Lỗi seed database:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
