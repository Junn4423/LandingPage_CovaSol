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
