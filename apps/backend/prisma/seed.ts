import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'CovaSol#2025';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      displayName: 'COVASOL Admin',
      role: 'super_admin'
    }
  });

  await prisma.blogPost.createMany({
    data: [
      {
        slug: 'xu-huong-ai-2025',
        title: '5 xu hướng AI doanh nghiệp cần chuẩn bị cho 2025',
        excerpt: 'Cập nhật nhanh những ứng dụng AI giúp doanh nghiệp tăng trưởng.',
        content:
          'AI đang dịch chuyển từ các thử nghiệm rời rạc sang chiến lược vận hành lõi. Doanh nghiệp cần chuẩn bị nền tảng dữ liệu, kiến trúc tích hợp và văn hoá thử nghiệm để tận dụng làn sóng mới. COVASOL đề xuất mô hình đánh giá mức độ sẵn sàng trong 4 tuần giúp doanh nghiệp xác định điểm khởi đầu rõ ràng.\n\nCác ca triển khai thực tế cho thấy việc kết hợp AI với workflow nội bộ mang lại hiệu quả cao hơn so với giải pháp đóng gói. Vì vậy chúng tôi tập trung xây dựng bộ API linh hoạt để kết nối với CRM/ERP hiện có.',
        tags: ['AI', 'Automation'],
        status: 'PUBLISHED',
        publishedAt: new Date('2025-10-02T00:00:00Z'),
        authorId: admin.id
      },
      {
        slug: 'toan-canh-product-design',
        title: 'Product Design: Từ ý tưởng đến MVP trong 6 tuần',
        excerpt: 'Quy trình tinh gọn giúp bạn kiểm chứng giả thuyết nhanh chóng.',
        content:
          'Để rút ngắn thời gian ra mắt sản phẩm, đội ngũ product cần một khung làm việc thống nhất với business và tech. COVASOL sử dụng phương pháp 6 tuần bao gồm Discovery, Experience Design, Prototyping và Validation. Mỗi tuần đều có deliverable rõ ràng để stakeholders ra quyết định nhanh chóng.\n\nSong song đó chúng tôi chuẩn hoá thư viện UI cũng như tài liệu handoff giúp đội phát triển triển khai ngay sau khi kết thúc sprint.',
        tags: ['Product', 'Design Sprint'],
        status: 'PUBLISHED',
        publishedAt: new Date('2025-09-12T00:00:00Z'),
        authorId: admin.id
      }
    ],
    skipDuplicates: true
  });

  await prisma.product.createMany({
    data: [
      {
        slug: 'virtual-assistant',
        name: 'Virtual Assistant Platform',
        headline: 'Trợ lý AI đa kênh',
        summary: 'Trả lời khách hàng tự động qua web, Zalo OA và Facebook Messenger.',
        description:
          'Nền tảng trợ lý ảo được thiết kế chuyên biệt cho doanh nghiệp Việt với khả năng hiểu ngôn ngữ tự nhiên và tích hợp hệ thống sẵn có. Bộ workflow builder trực quan giúp đội CSKH tự điều chỉnh kịch bản chỉ trong vài phút.',
        category: 'AI',
        thumbnail: '/images/mock/virtual-assistant.png',
        features: [
          'Kết nối đa kênh (Web Widget, Facebook, Zalo OA, Hotline)',
          'Hệ thống đào tạo tri thức từ tài liệu nội bộ',
          'Dashboard realtime phân tích hội thoại'
        ],
        metrics: [
          { label: 'Thời gian go-live', value: '4 tuần' },
          { label: 'Tỉ lệ tự động hoá', value: '65%' }
        ],
        status: 'PUBLISHED',
        publishedAt: new Date('2025-07-01T00:00:00Z')
      },
      {
        slug: 'manufacturing-mes',
        name: 'Manufacturing MES',
        headline: 'Giải pháp điều hành sản xuất',
        summary: 'Tối ưu dây chuyền với dashboard thời gian thực và cảnh báo bất thường.',
        description:
          'Hệ thống MES tập trung giúp giám sát hiệu suất từng chuyền và đồng bộ dữ liệu với ERP hiện hữu. Giải pháp hỗ trợ cả mô hình on-premise lẫn cloud để phù hợp yêu cầu bảo mật.',
        category: 'MES',
        thumbnail: '/images/mock/mes.png',
        features: [
          'Giám sát OEE và downtime realtime',
          'Quản lý lệnh sản xuất và truy xuất nguồn gốc',
          'Ứng dụng di động cho tổ trưởng'
        ],
        metrics: [
          { label: 'Sites đang vận hành', value: '12+' },
          { label: 'Thời gian triển khai', value: '8-10 tuần' }
        ],
        status: 'PUBLISHED',
        publishedAt: new Date('2025-08-15T00:00:00Z')
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed completed. Default admin password:', adminPassword);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
