const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const { db, initializeDatabase } = require('./index');
const config = require('../config');

initializeDatabase();

function seedAdminUser() {
  const existing = db
    .prepare('SELECT COUNT(*) as count FROM admin_users WHERE username = ?')
    .get(config.adminDefault.username);

  if (existing.count > 0) {
    console.log('Admin user already exists. Skipping admin seed.');
    return;
  }

  const passwordHash = bcrypt.hashSync(config.adminDefault.password, 12);
  db.prepare(`
      INSERT INTO admin_users (username, password_hash, display_name, role)
      VALUES (@username, @password_hash, @display_name, 'admin')
    `)
    .run({
      username: config.adminDefault.username,
      password_hash: passwordHash,
      display_name: config.adminDefault.displayName
    });

  console.log(`Default admin user '${config.adminDefault.username}' created.`);
}

function seedBlogPosts() {
  const count = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
  if (count.count > 0) {
    console.log('Blog posts already seeded. Skipping blog seed.');
    return;
  }

  const blogPosts = [
    {
      code: 'BLOG20241001',
      title: 'Chiến lược chuyển đổi số bền vững cho doanh nghiệp Việt 2025',
      subtitle: 'Tạo đà tăng trưởng với công nghệ và dữ liệu',
      excerpt:
        'Bài viết phân tích 5 bước trọng tâm giúp doanh nghiệp Việt Nam xây dựng chiến lược chuyển đổi số bền vững, giảm rủi ro và gia tăng hiệu suất.',
      content: [
        'Chuyển đổi số đã trở thành yêu cầu cấp thiết với mọi doanh nghiệp. Tuy nhiên, để chuyển đổi thành công cần một chiến lược dài hạn, rõ ràng và phù hợp với từng giai đoạn phát triển.',
        'Trong bài viết này, Covasol chia sẻ 5 trụ cột giúp doanh nghiệp triển khai chuyển đổi số hiệu quả gồm: (1) Khung đánh giá trưởng thành số, (2) Tái thiết kế quy trình vận hành, (3) Cấu trúc dữ liệu thống nhất, (4) Lộ trình triển khai công nghệ và (5) Nâng cao năng lực nhân sự.',
        'Bên cạnh đó, chúng tôi gợi ý bộ KPI thực tế để đo lường tiến độ, các rủi ro phổ biến cần tránh và câu chuyện thành công từ doanh nghiệp trong nước.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80',
      category: 'Digital Transformation',
      tags: ['Digital Transformation', 'Strategy', 'Vietnam Market'],
      keywords: ['chuyển đổi số', 'digital transformation', 'covasol'],
      authorName: 'Nguyễn Minh Khoa',
      authorRole: 'Digital Transformation Lead',
      publishedAt: '2024-10-01T09:00:00.000Z'
    },
    {
      code: 'BLOG20240912',
      title: 'Kết hợp AI và Low-code để tăng tốc phát triển sản phẩm',
      subtitle: 'Tối ưu nguồn lực với đội ngũ nhỏ',
      excerpt:
        'Các đội ngũ sản phẩm nhỏ hoàn toàn có thể xây dựng MVP trong 6 tuần với sự kết hợp giữa AI và nền tảng low-code. Cùng khám phá quy trình chi tiết trong bài viết này.',
      content: [
        'AI đang trở thành một đồng đội đáng tin cậy trong quá trình xây dựng sản phẩm. Từ ý tưởng, thiết kế UI đến viết test case, AI có thể hỗ trợ đội ngũ ở nhiều bước khác nhau.',
        'Khi kết hợp với nền tảng low-code/no-code, doanh nghiệp có thể tạo ra phiên bản MVP với ngân sách tối ưu. Tuy nhiên, việc lựa chọn nền tảng, thiết kế kiến trúc mở rộng và kiểm thử vẫn cần đội ngũ kỹ thuật định hướng.',
        'Covasol đã tổng hợp một quy trình 6 bước, đi kèm checklist để bạn có thể áp dụng ngay cho đội ngũ của mình.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
      category: 'AI & Automation',
      tags: ['AI', 'Low-code', 'Product Development'],
      keywords: ['ai', 'low-code', 'product roadmap'],
      authorName: 'Trần Thu Trang',
      authorRole: 'Head of Product Design',
      publishedAt: '2024-09-12T04:30:00.000Z'
    },
    {
      code: 'BLOG20240805',
      title: 'Checklist bảo mật API cho startup giai đoạn scale-up',
      subtitle: '01 framework duy nhất để đảm bảo an toàn hệ thống',
      excerpt:
        'Khi lượng người dùng tăng nhanh, các lỗ hổng bảo mật API sẽ bộc lộ rõ rệt. Checklist dưới đây giúp startup kiểm soát rủi ro chỉ trong 1 tuần.',
      content: [
        'API là xương sống của mọi sản phẩm số hiện đại. Tuy nhiên, nhiều startup chỉ tập trung xây tính năng mà bỏ quên kiểm soát truy cập và giám sát.',
        'Checklist của Covasol bao gồm 20 tiêu chí theo 4 nhóm: Authentication, Authorization, Rate Limiting & Monitoring và Data Protection.',
        'Chúng tôi cũng chia sẻ các công cụ mã nguồn mở có thể triển khai nhanh mà vẫn đáp ứng yêu cầu của nhà đầu tư/đối tác.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
      category: 'Security',
      tags: ['API Security', 'Best Practices', 'Startup'],
      keywords: ['api security', 'owasp', 'startup growth'],
      authorName: 'Phạm Quang Huy',
      authorRole: 'Senior Software Architect',
      publishedAt: '2024-08-05T07:10:00.000Z'
    },
    {
      code: 'BLOG20240718',
      title: 'Thiết kế trải nghiệm người dùng đa ngôn ngữ cho thị trường khu vực',
      subtitle: 'UX Researchers chia sẻ kinh nghiệm thực chiến',
      excerpt:
        'Sản phẩm số muốn mở rộng sang Đông Nam Á cần tối ưu ngôn ngữ và văn hóa. Bài viết đúc kết 7 lưu ý quan trọng từ các dự án của Covasol.',
      content: [
        'Khác biệt văn hóa và hành vi số tại mỗi quốc gia khiến trải nghiệm người dùng thay đổi đáng kể. Việc dịch thuật đơn thuần không còn đủ.',
        'Các dự án thành công thường bắt đầu với việc phân nhóm người dùng mục tiêu, nghiên cứu ngữ cảnh sử dụng và xây dựng design system hỗ trợ đa ngôn ngữ.',
        'Covasol trình bày bộ guideline giúp đội ngũ sản phẩm xác định ưu tiên, tối ưu nội dung và kiểm thử nhanh trên từng thị trường.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1529336953121-a481df255de4?auto=format&fit=crop&w=1200&q=80',
      category: 'UI/UX Design',
      tags: ['UX', 'Localization', 'Product Strategy'],
      keywords: ['ux design', 'localization', 'sea market'],
      authorName: 'Lê Hoài Phương',
      authorRole: 'UX Research Lead',
      publishedAt: '2024-07-18T05:45:00.000Z'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO blog_posts (
      code,
      slug,
      title,
      subtitle,
      excerpt,
      content,
      image_url,
      category,
      tags,
      keywords,
      author_name,
      author_role,
      published_at,
      status
    )
    VALUES (
      @code,
      @slug,
      @title,
      @subtitle,
      @excerpt,
      @content,
      @image_url,
      @category,
      @tags,
      @keywords,
      @author_name,
      @author_role,
      @published_at,
      'published'
    )
  `);

  const insertMany = db.transaction((rows) => {
    rows.forEach((row) => {
      const slugBase = slugify(row.title, { lower: true, strict: true });
      insert.run({
        code: row.code,
        slug: `${slugBase}-${row.code.toLowerCase()}`,
        title: row.title,
        subtitle: row.subtitle || null,
        excerpt: row.excerpt || null,
        content: row.content,
        image_url: row.imageUrl || null,
        category: row.category || null,
        tags: JSON.stringify(row.tags || []),
        keywords: JSON.stringify(row.keywords || []),
        author_name: row.authorName || null,
        author_role: row.authorRole || null,
        published_at: row.publishedAt
      });
    });
  });

  insertMany(blogPosts);
  console.log(`Seeded ${blogPosts.length} blog posts.`);
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count > 0) {
    console.log('Products already seeded. Skipping product seed.');
    return;
  }

  const products = [
    {
      code: 'PROD-COVACRM',
      name: 'CovaCRM',
      category: 'Customer Success Platform',
      shortDescription:
        'Nền tảng quản trị trải nghiệm khách hàng đa kênh dành cho doanh nghiệp dịch vụ.',
      description: [
        'CovaCRM được thiết kế cho những đội ngũ chăm sóc khách hàng cần mở rộng nhanh và giữ chất lượng dịch vụ. Hệ thống hợp nhất dữ liệu từ Website, Zalo OA, Facebook, Email vào một bảng điều khiển thống nhất.',
        'Các workflow tự động hóa được xây dựng bằng drag-and-drop, giúp triển khai chiến dịch onboarding, upsell, chăm sóc sau bán chỉ trong vài giờ.',
        'Module báo cáo theo thời gian thực giúp đội ngũ lãnh đạo nắm bắt tình trạng khách hàng, NPS theo phân khúc và đề xuất hành động tiếp theo.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1521790361543-f645cf042ec4?auto=format&fit=crop&w=1200&q=80',
      featureTags: ['Omnichannel', 'Automation', 'Realtime Dashboard'],
      highlights: [
        'Pipeline theo dõi hành trình khách hàng từ lead tới loyal',
        'Workflow automation với hơn 30 mẫu dựng sẵn',
        'Báo cáo KPI dành cho cả Sales lẫn Customer Success'
      ],
      ctaPrimaryLabel: 'Dùng thử 14 ngày',
      ctaPrimaryUrl: '#request-demo',
      ctaSecondaryLabel: 'Tài liệu sản phẩm',
      ctaSecondaryUrl: '#product-docs'
    },
    {
      code: 'PROD-COVAIQ',
      name: 'CovaIQ',
      category: 'AI Knowledge Assistant',
      shortDescription:
        'Trợ lý AI nội bộ giúp tự động hoá quy trình trả lời khách hàng và hỗ trợ nhân viên.',
      description: [
        'CovaIQ sử dụng mô hình ngôn ngữ tinh chỉnh riêng cho tiếng Việt, kết hợp với RAG để truy xuất dữ liệu nội bộ an toàn.',
        'Doanh nghiệp có thể dựng chatbot tư vấn sản phẩm, FAQ nội bộ, trợ lý chăm sóc khách hàng chỉ trong 1 ngày với bộ template dựng sẵn.',
        'Tính năng analytics giúp tối ưu câu trả lời, gợi ý nội dung cần cập nhật và theo dõi mức độ hài lòng của người dùng.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      featureTags: ['AI Assistant', 'RAG', 'Analytics'],
      highlights: [
        'Triển khai trên hạ tầng riêng hoặc đám mây',
        'Tích hợp sẵn với Slack, Teams, Zalo OA',
        'Dashboard đánh giá chất lượng câu trả lời'
      ],
      ctaPrimaryLabel: 'Đăng ký demo',
      ctaPrimaryUrl: '#request-demo',
      ctaSecondaryLabel: 'Xem case study',
      ctaSecondaryUrl: '#case-study'
    },
    {
      code: 'PROD-COVAOPS',
      name: 'CovaOps',
      category: 'Operational Intelligence',
      shortDescription:
        'Giải pháp giám sát vận hành end-to-end cho doanh nghiệp sản xuất và logistic.',
      description: [
        'CovaOps thu thập dữ liệu từ IoT gateway, ERP và hệ thống hiện hữu để hiển thị trên bản đồ vận hành trực quan.',
        'Hệ thống cảnh báo bất thường theo thời gian thực với khả năng cấu hình SLA linh hoạt.',
        'Module phân tích dự báo giúp tối ưu chi phí bảo trì máy móc và kế hoạch giao hàng.'
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
      featureTags: ['IoT', 'Monitoring', 'Predictive Analytics'],
      highlights: [
        'Bản đồ vận hành theo ca/khu vực',
        'Cảnh báo chủ động qua Email, SMS, MS Teams',
        'Mô hình dự báo downtime dựa trên lịch sử thiết bị'
      ],
      ctaPrimaryLabel: 'Nhận tư vấn',
      ctaPrimaryUrl: '#contact-sales',
      ctaSecondaryLabel: 'Tải brochure',
      ctaSecondaryUrl: '#download-brochure'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO products (
      code,
      slug,
      name,
      category,
      short_description,
      description,
      image_url,
      feature_tags,
      highlights,
      cta_primary_label,
      cta_primary_url,
      cta_secondary_label,
      cta_secondary_url,
      status
    )
    VALUES (
      @code,
      @slug,
      @name,
      @category,
      @short_description,
      @description,
      @image_url,
      @feature_tags,
      @highlights,
      @cta_primary_label,
      @cta_primary_url,
      @cta_secondary_label,
      @cta_secondary_url,
      'active'
    )
  `);

  const insertMany = db.transaction((rows) => {
    rows.forEach((row) => {
      const slugBase = slugify(row.name, { lower: true, strict: true });
      insert.run({
        code: row.code,
        slug: `${slugBase}-${row.code.toLowerCase()}`,
        name: row.name,
        category: row.category || null,
        short_description: row.shortDescription || null,
        description: row.description,
        image_url: row.imageUrl || null,
        feature_tags: JSON.stringify(row.featureTags || []),
        highlights: JSON.stringify(row.highlights || []),
        cta_primary_label: row.ctaPrimaryLabel || null,
        cta_primary_url: row.ctaPrimaryUrl || null,
        cta_secondary_label: row.ctaSecondaryLabel || null,
        cta_secondary_url: row.ctaSecondaryUrl || null
      });
    });
  });

  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
}

seedAdminUser();
seedBlogPosts();
seedProducts();

console.log('Seeding completed.');
