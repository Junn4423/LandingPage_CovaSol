/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { fetchProductSummaries } from '@/lib/api/products';
import { fetchBlogSummaries } from '@/lib/api/blog';
import { HomeProductsGrid } from '@/components/home/home-products-grid';
import { HomeBlogGrid } from '@/components/home/home-blog-grid';

type Review = {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  date: string;
};

const heroStats = [
  { label: 'Dự án triển khai', value: '120+' },
  { label: 'Khách hàng hài lòng', value: '60+' },
  { label: 'Đối tác chiến lược', value: '12' }
];

const servicesOverview = [
  {
    icon: 'fas fa-laptop-code',
    titleKey: 'service1-title',
    title: 'Phát triển phần mềm',
    descriptionKey: 'service1-desc',
    description: 'Xây dựng giải pháp công nghệ theo nhu cầu',
    features: ['Web Application Development', 'Mobile App Development', 'API & Backend Development', 'Automation & Integration'],
    href: '#software-dev'
  },
  {
    icon: 'fas fa-paint-brush',
    titleKey: 'service2-title',
    title: 'Thiết kế & Giao diện',
    descriptionKey: 'service2-desc',
    description: 'Tạo trải nghiệm thương hiệu và sản phẩm tinh gọn – rõ ràng – dễ dùng',
    features: ['UI/UX Design', 'Brand Identity Design', 'Prototype & Wireframe', 'Design System Development'],
    href: '#design-services'
  },
  {
    icon: 'fas fa-cogs',
    titleKey: 'service3-title',
    title: 'Chuyển đổi số',
    descriptionKey: 'service3-desc',
    description: 'Đưa công nghệ vào hoạt động thực tế, không chỉ dừng ở phần mềm',
    features: ['Business Process Automation', 'System Integration', 'Digital Workspace Setup', 'Data Analytics & Reporting'],
    href: '#digital-transformation'
  },
  {
    icon: 'fas fa-handshake',
    titleKey: 'service4-title',
    title: 'Tư vấn & Bảo trì',
    descriptionKey: 'service4-desc',
    description: 'Đồng hành lâu dài, phát triển bền vững cùng doanh nghiệp',
    features: ['Technical Consulting', 'Software Maintenance', 'Training & Documentation'],
    href: '#consulting'
  },
  {
    icon: 'fas fa-chart-line',
    titleKey: 'service5-title',
    title: 'Marketing & Chiến lược',
    descriptionKey: 'service5-desc',
    description: 'Hợp nhất công nghệ và marketing tạo kết quả thực tế',
    features: ['Website Optimization', 'Campaign Landing Page', 'Automation Marketing'],
    href: '#digital-marketing'
  },
  {
    icon: 'fas fa-rocket',
    titleKey: 'service6-title',
    title: 'Giải pháp đặc biệt',
    descriptionKey: 'service6-desc',
    description: 'Xây dựng sản phẩm riêng có thể thương mại hoá',
    features: ['Công cụ SaaS nội bộ', 'AI Assistant tích hợp', 'Custom Cloud Service'],
    href: '#specialized'
  }
];

const detailedServices = [
  {
    icon: 'fas fa-globe',
    titleKey: 'web-dev-title',
    title: 'Web Application Development',
    descriptionKey: 'web-dev-desc',
    description: 'Thiết kế & phát triển website, web app, hệ thống nội bộ, dashboard quản lý và portal khách hàng.',
    targetKey: 'web-dev-target',
    target: 'Startup, SME, tổ chức cần hệ thống quản lý hoặc kênh tương tác.'
  },
  {
    icon: 'fas fa-mobile-alt',
    titleKey: 'mobile-dev-title',
    title: 'Mobile App Development',
    descriptionKey: 'mobile-dev-desc',
    description: 'Ứng dụng di động Android/iOS (React Native / Flutter), phát triển đa nền tảng.',
    targetKey: 'mobile-dev-target',
    target: 'Doanh nghiệp cần sản phẩm hướng tới người dùng cuối.'
  },
  {
    icon: 'fas fa-server',
    titleKey: 'api-dev-title',
    title: 'API & Backend Development',
    descriptionKey: 'api-dev-desc',
    description: 'Xây dựng hệ thống API, cơ sở dữ liệu, microservice bảo mật và mở rộng linh hoạt.',
    targetKey: 'api-dev-target',
    target: 'Các dự án cần kết nối dữ liệu hoặc nền tảng mở rộng.'
  },
  {
    icon: 'fas fa-robot',
    titleKey: 'automation-title',
    title: 'Automation & Integration',
    descriptionKey: 'automation-desc',
    description: 'Tự động hoá quy trình, kết nối ứng dụng (Zapier, n8n, custom API).',
    targetKey: 'automation-target',
    target: 'Doanh nghiệp muốn giảm thao tác thủ công, tăng hiệu suất.'
  }
];

const aboutStats = [
  { labelKey: 'stat1-label', label: 'Dự án hoàn thành', value: 100 },
  { labelKey: 'stat2-label', label: 'Khách hàng hài lòng', value: 50 },
  { labelKey: 'stat3-label', label: 'Năm kinh nghiệm', value: 3 }
];

const aboutPhotos = [
  {
    src: '/assets/img/anh4.jpeg',
    alt: 'Đội ngũ COVASOL đang làm việc',
    caption: 'Đội ngũ triển khai dự án',
    icon: 'fas fa-people-group',
    variant: 'primary'
  },
  {
    src: '/assets/img/anh3.jpeg',
    alt: 'Không gian IT tại văn phòng COVASOL',
    caption: 'Văn phòng IT Lab',
    icon: 'fas fa-microchip',
    variant: 'secondary'
  },
  {
    src: '/assets/img/anh1.jpeg',
    alt: 'Phòng họp chiến lược của COVASOL',
    caption: 'Không gian hợp chiến lược',
    icon: 'fas fa-handshake',
    variant: 'tertiary'
  }
];

const whyChooseFeatures = [
  {
    icon: 'fas fa-lightbulb',
    titleKey: 'feature1-title',
    title: 'Giải pháp sáng tạo',
    descriptionKey: 'feature1-desc',
    description: 'Luôn tìm kiếm những cách tiếp cận mới và sáng tạo để giải quyết vấn đề.'
  },
  {
    icon: 'fas fa-users',
    titleKey: 'feature2-title',
    title: 'Đội ngũ chuyên nghiệp',
    descriptionKey: 'feature2-desc',
    description: 'Tập hợp các chuyên gia giàu kinh nghiệm và đam mê công nghệ.'
  },
  {
    icon: 'fas fa-clock',
    titleKey: 'feature3-title',
    title: 'Cam kết thời gian',
    descriptionKey: 'feature3-desc',
    description: 'Đảm bảo tiến độ triển khai và bàn giao đúng với cam kết.'
  },
  {
    icon: 'fas fa-shield-alt',
    titleKey: 'feature4-title',
    title: 'Bảo mật tuyệt đối',
    descriptionKey: 'feature4-desc',
    description: 'Cam kết an toàn thông tin và dữ liệu khách hàng nhiều lớp.'
  },
  {
    icon: 'fas fa-headset',
    titleKey: 'feature5-title',
    title: 'Hỗ trợ 24/7',
    descriptionKey: 'feature5-desc',
    description: 'Đội ngũ hỗ trợ kỹ thuật luôn sẵn sàng mọi lúc, mọi nơi.'
  },
  {
    icon: 'fas fa-chart-line',
    titleKey: 'feature6-title',
    title: 'Tối ưu hiệu quả',
    descriptionKey: 'feature6-desc',
    description: 'Tập trung tối đa vào hiệu quả vận hành và ROI cho khách hàng.'
  }
];

const reviews: Review[] = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'CEO - TechStart JSC',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'COVASOL đã giúp chúng tôi xây dựng hệ thống ERP hoàn chỉnh. Đội ngũ rất chuyên nghiệp, giao hàng đúng hẹn và hỗ trợ tận tình sau bàn giao.',
    date: '2 tháng trước'
  },
  {
    name: 'Trần Thị Lan',
    role: 'Giám đốc Marketing - BeautyShop',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'Website và app mobile do COVASOL phát triển đã giúp doanh thu online tăng 300%. UI/UX rất đẹp và dễ sử dụng.',
    date: '1 tháng trước'
  },
  {
    name: 'Lê Văn Hùng',
    role: 'CTO - FinanceCore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    rating: 4.5,
    quote: 'Hệ thống API và microservice rất ổn định. COVASOL hiểu rõ yêu cầu kỹ thuật và đưa ra giải pháp phù hợp.',
    date: '3 tuần trước'
  },
  {
    name: 'Phạm Thị Mai',
    role: 'Founder - EduTech Vietnam',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'Nền tảng học trực tuyến được xây dựng rất chuyên nghiệp. Học sinh và giáo viên đều phản hồi tích cực về giao diện và tính năng.',
    date: '1 tháng trước'
  },
  {
    name: 'Hoàng Đức Thánh',
    role: 'Giám đốc - Logistics Plus',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face',
    rating: 4,
    quote:
      'Hệ thống quản lý vận chuyển giúp tối ưu tuyến đường và giảm 25% chi phí nhiên liệu. Tính năng tracking real-time rất hữu ích.',
    date: '6 tuần trước'
  },
  {
    name: 'Nguyễn Thị Hương',
    role: 'HR Manager - GreenTech Co.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face',
    rating: 4.5,
    quote: 'App HR quản lý nhân sự rất tiện lợi. Nhân viên có thể chấm công, xin phép và theo dõi lương dễ dàng.',
    date: '2 tháng trước'
  },
  {
    name: 'Võ Minh Khôi',
    role: 'CEO - SmartHome Solutions',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'Hệ thống IoT và dashboard monitoring hoạt động cực kỳ ổn định. COVASOL có kiến thức sâu về công nghệ mới nhất.',
    date: '3 tuần trước'
  },
  {
    name: 'Đặng Thị Ngọc',
    role: 'Marketing Director - FoodieHub',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    rating: 3.5,
    quote:
      'App giao đồ ăn ra mắt đúng tiến độ. Một số tính năng cần tiếp tục hoàn thiện nhưng nhìn chung đã đáp ứng yêu cầu cốt lõi.',
    date: '4 tháng trước'
  },
  {
    name: 'Trịnh Vân Nam',
    role: 'Owner - RetailChain VN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'Hệ thống POS và quản lý chuỗi cửa hàng hoạt động mượt mà. Báo cáo thống kê chi tiết giúp ra quyết định chính xác.',
    date: '5 tuần trước'
  },
  {
    name: 'Lữ Thị Đinh',
    role: 'CFO - InvestSmart',
    avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=60&h=60&fit=crop&crop=face',
    rating: 4,
    quote:
      'Nền tảng fintech được phát triển với tính bảo mật cao. API tích hợp ngân hàng hoạt động ổn định và tuân thủ quy định.',
    date: '7 tuần trước'
  },
  {
    name: 'Bùi Hoàng Long',
    role: 'CTO - HealthCare Tech',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=60&h=60&fit=crop&crop=face',
    rating: 4.5,
    quote:
      'Hệ thống quản lý bệnh viện giúp số hoá quy trình khám chữa bệnh. Bác sĩ và bệnh nhân đều hài lòng.',
    date: '6 tuần trước'
  },
  {
    name: 'Cao Thị Minh',
    role: 'Operations Manager - LogiFlow',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=60&h=60&fit=crop&crop=face',
    rating: 4,
    quote:
      'Automation workflow tiết kiệm 40% thời gian xử lý đơn hàng. Tích hợp với các hệ thống có sẵn rất mượt.',
    date: '3 tháng trước'
  },
  {
    name: 'Đinh Văn Tài',
    role: 'Founder - AgriTech Vietnam',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'Nền tảng nông nghiệp thông minh kết nối nông dân với người tiêu dùng rất hiệu quả. Giao diện dễ dùng cho mọi lứa tuổi.',
    date: '1 tháng trước'
  },
  {
    name: 'Võ Thị Thu',
    role: 'Brand Manager - FashionHub',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face',
    rating: 3.5,
    quote:
      'Website thương mại điện tử có thiết kế đẹp mắt. Một số chức năng checkout cần tối ưu thêm để tăng conversion rate.',
    date: '5 tháng trước'
  },
  {
    name: 'Phan Minh Đức',
    role: 'IT Manager - AutoService',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
    rating: 4.5,
    quote:
      'Hệ thống quản lý garage ô tô với booking online rất tiện lợi. Khách hàng có thể đặt lịch và theo dõi tiến độ sửa chữa.',
    date: '4 tuần trước'
  },
  {
    name: 'Đỗ Thị Linh',
    role: 'Director - RealEstate Pro',
    avatar: 'https://images.unsplash.com/photo-1567532900872-f4e906cbf06a?w=60&h=60&fit=crop&crop=face',
    rating: 4,
    quote:
      'Nền tảng bất động sản có tính năng tìm kiếm thông minh và bản đồ tương tác. Giúp tăng 50% leads chất lượng.',
    date: '2 tháng trước'
  },
  {
    name: 'Hà Quang Minh',
    role: 'CEO - TravelSmart',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    quote:
      'App du lịch với AI recommendation rất ấn tượng. Khách hàng có thể lên kế hoạch và đặt trọn bộ chuyến đi chỉ trong vài click.',
    date: '6 tuần trước'
  },
  {
    name: 'Ngô Thị Vân',
    role: 'Product Manager - SportsTech',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&crop=face',
    rating: 3.5,
    quote:
      'App thể thao với tracking workout khá tốt. Performance tracking chính xác nhưng UI cần cải thiện để thân thiện hơn.',
    date: '7 tháng trước'
  },
  {
    name: 'Lương Văn Khang',
    role: 'Technical Lead - CloudFirst',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=60&h=60&fit=crop&crop=face',
    rating: 4.5,
    quote:
      'Migration từ on-premise lên cloud do COVASOL thực hiện rất chuyên nghiệp. Zero downtime và hiệu năng tăng đáng kể.',
    date: '1 tháng trước'
  },
  {
    name: 'Trương Thị Hạnh',
    role: 'COO - MediaStreaming',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=60&h=60&fit=crop&crop=face',
    rating: 4,
    quote:
      'Nền tảng streaming video có khả năng scale tốt. Xử lý hàng nghìn user cùng lúc mà không bị lag hay buffering.',
    date: '8 tuần trước'
  }
];

const ratingBreakdown = [
  { label: '5 sao', percent: 60 },
  { label: '4 sao', percent: 25 },
  { label: '3 sao', percent: 15 }
];

const contactDetails = [
  { icon: 'fas fa-globe', label: 'Website', value: 'covasol.top', href: 'https://covasol.top' },
  { icon: 'fas fa-envelope', label: 'Email', value: 'covasol.studio@gmail.com', href: 'mailto:covasol.studio@gmail.com' },
  { icon: 'fas fa-phone', label: 'Hotline', value: '+84 123 456 789', href: 'tel:+84123456789' },
  { icon: 'fas fa-map-marker-alt', label: 'Địa chỉ', value: 'Hồ Chí Minh, Việt Nam' }
];

const contactSocials = [
  { icon: 'fab fa-facebook-f', label: 'Facebook', href: '#' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: '#' },
  { icon: 'fab fa-twitter', label: 'Twitter', href: '#' },
  { icon: 'fab fa-github', label: 'GitHub', href: '#' }
];

const contactServices = [
  { value: '', textKey: 'contact-form-service', text: '-- Chọn dịch vụ quan tâm * --' },
  { value: 'web-app-development', textKey: 'service-option-web', text: 'Phát triển Website/App' },
  { value: 'automation', textKey: 'service-option-mobile', text: 'Ứng dụng di động' },
  { value: 'ui-ux-design', textKey: 'service-option-uiux', text: 'Thiết kế giao diện UI/UX' },
  { value: 'consulting-maintenance', textKey: 'service-option-ecommerce', text: 'Thương mại điện tử' },
  { value: 'digital-transformation', textKey: 'service-option-digital', text: 'Chuyển đổi số' },
  { value: 'other', textKey: 'service-option-other', text: 'Khác' }
];

const getStarClass = (rating: number, position: number) => {
  if (rating >= position) {
    return 'fas fa-star';
  }
  if (rating >= position - 0.5) {
    return 'fas fa-star-half-alt';
  }
  return 'far fa-star';
};

export default async function HomePage() {
  // Fetch data on server side
  const [products, blogPosts] = await Promise.all([
    fetchProductSummaries(),
    fetchBlogSummaries()
  ]);

  return (
    <>
      <section id="home" className="hero">
        <div className="hero-media" aria-hidden="true">
          <video autoPlay muted loop playsInline preload="metadata">
            <source src="/assets/video/Hero_section_Landing_page_3D_animation.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
          <div className="hero-media-overlay" />
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-main">COVASOL</span>
              <span className="title-sub" data-key="hero-subtitle">
                Core Value. Smart Solutions.
              </span>
            </h1>
            <p className="hero-description" data-key="hero-description">
              Đối tác công nghệ đáng tin cậy cho doanh nghiệp hiện đại. Chúng tôi phát triển phần mềm, thiết kế trải nghiệm người dùng và
              hỗ trợ chuyển đổi số toàn diện.
            </p>
            <div className="hero-buttons">
              <a href="#services" className="btn btn-primary" data-key="hero-btn-services">
                Khám phá dịch vụ
              </a>
              <a href="#contact" className="btn btn-secondary" data-key="hero-btn-contact">
                Liên hệ ngay
              </a>
            </div>
            <div className="hero-stats">
              {heroStats.map(stat => (
                <div className="hero-stat" key={stat.label}>
                  <span className="stat-label">{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-particles" aria-hidden="true">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>
      </section>

      <section id="featuredProducts" className="home-featured-products">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 data-key="home-products-title">Giải pháp nổi bật</h2>
            <p data-key="home-products-subtitle">Các sản phẩm cập nhật trực tiếp từ hệ thống quản trị.</p>
          </div>
          <HomeProductsGrid products={products} />
          <div className="section-actions" data-aos="fade-up" data-aos-delay="100">
            <Link className="btn btn-outline" href="/products">
              <span data-key="home-products-button">Xem tất cả sản phẩm</span>
              <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      <section id="latestBlog" className="home-latest-blog">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 data-key="home-blog-title">Bài viết mới nhất</h2>
            <p data-key="home-blog-subtitle">Tin tức và chia sẻ từ đội ngũ chuyên gia COVASOL.</p>
          </div>
          <HomeBlogGrid posts={blogPosts} />
          <div className="section-actions" data-aos="fade-up" data-aos-delay="100">
            <Link className="btn btn-outline" href="/blog">
              <span data-key="home-blog-button">Đọc thêm trên Blog</span>
              <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="services-overview">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 data-key="services-title">Dịch vụ của chúng tôi</h2>
            <p data-key="services-description">Giải pháp công nghệ toàn diện cho mọi nhu cầu doanh nghiệp</p>
          </div>
          <div className="services-grid">
            {servicesOverview.map((service, index) => (
              <div className="service-card" data-aos="zoom-in" data-aos-delay={(index + 1) * 100} key={service.title}>
                <div className="service-icon">
                  <i className={service.icon} />
                </div>
                <h3 data-key={service.titleKey}>{service.title}</h3>
                <p data-key={service.descriptionKey}>{service.description}</p>
                <ul>
                  {service.features.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a href={service.href} className="service-link">
                  <span data-key="learn-more">Tìm hiểu thêm</span> <i className="fas fa-arrow-right" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="software-dev" className="service-detail">
        <div className="container">
          <div className="service-detail-header" data-aos="fade-up">
            <h2 data-key="detailed-services-title">Phát triển phần mềm</h2>
            <p className="service-tagline" data-key="detailed-services-subtitle">
              Xây dựng giải pháp công nghệ theo nhu cầu.
            </p>
          </div>
          <div className="service-detail-grid">
            {detailedServices.map((detail, index) => (
              <div className="detail-card" data-aos="fade-up" data-aos-delay={(index + 1) * 100} key={detail.title}>
                <div className="detail-icon">
                  <i className={detail.icon} />
                </div>
                <h3 data-key={detail.titleKey}>{detail.title}</h3>
                <p data-key={detail.descriptionKey}>{detail.description}</p>
                <div className="target-clients">
                  <strong data-key="target-label">Đối tượng:</strong> <span data-key={detail.targetKey}>{detail.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text" data-aos="fade-right">
              <h2 data-key="about-title">Về COVASOL</h2>
              <p data-key="about-text">
                COVASOL là công ty công nghệ chuyên cung cấp giải pháp phần mềm và dịch vụ chuyển đổi số cho doanh nghiệp vừa và nhỏ.
                Với phương châm Core Value. Smart Solutions., chúng tôi cam kết mang đến giải pháp thông minh, hiệu quả và bền vững.
              </p>
              <div className="about-stats">
                {aboutStats.map(stat => (
                  <div className="stat-item" key={stat.label}>
                    <span className="stat-number" data-counter={stat.value}>
                      0
                    </span>
                    <span className="stat-label" data-key={stat.labelKey}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-image" data-aos="fade-left">
              <div className="about-gallery">
                {aboutPhotos
                  .filter(photo => photo.variant === 'primary')
                  .map(photo => (
                    <figure className="about-photo about-photo--primary" key={photo.src}>
                      <img src={photo.src} alt={photo.alt} loading="lazy" />
                      <figcaption className="about-photo-caption">
                        <i className={photo.icon} />
                        <span>{photo.caption}</span>
                      </figcaption>
                    </figure>
                  ))}
                <div className="about-gallery-stack">
                  {aboutPhotos
                    .filter(photo => photo.variant !== 'primary')
                    .map(photo => (
                      <figure className={`about-photo about-photo--${photo.variant}`} key={photo.src}>
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <figcaption className="about-photo-caption">
                          <i className={photo.icon} />
                          <span>{photo.caption}</span>
                        </figcaption>
                      </figure>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 data-key="why-choose-title">Tại sao nên chọn COVASOL?</h2>
            <p data-key="why-choose-subtitle">Những giá trị cốt lõi tạo nên sự khác biệt</p>
          </div>
          <div className="features-grid">
            {whyChooseFeatures.map((feature, index) => (
              <div className="feature-item" data-aos="flip-left" data-aos-delay={(index + 1) * 100} key={feature.title}>
                <div className="feature-icon">
                  <i className={feature.icon} />
                </div>
                <h3 data-key={feature.titleKey}>{feature.title}</h3>
                <p data-key={feature.descriptionKey}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="customer-reviews">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 data-key="reviews-title">Khách hàng nói gì về chúng tôi</h2>
            <p data-key="reviews-subtitle">Những phản hồi từ các doanh nghiệp đã tin tưởng COVASOL.</p>
          </div>
          <div className="reviews-carousel-wrapper">
            <div className="reviews-carousel">
              <div className="reviews-track">
                {reviews.map((review, index) => (
                  <div className="review-card" data-aos="fade-up" data-aos-delay={100 + (index % 6) * 50} key={review.name}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <img src={review.avatar} alt={review.name} loading="lazy" />
                        </div>
                        <div className="reviewer-details">
                          <h4>{review.name}</h4>
                          <span>{review.role}</span>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map(position => (
                            <i className={getStarClass(review.rating, position)} key={position} />
                          ))}
                        </div>
                        <span className="rating-number">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="review-text">{review.quote}</p>
                    <div className="review-date">{review.date}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="carousel-nav carousel-prev" aria-label="Previous reviews">
              <i className="fas fa-chevron-left" />
            </button>
            <button className="carousel-nav carousel-next" aria-label="Next reviews">
              <i className="fas fa-chevron-right" />
            </button>
            <div className="carousel-indicators" />
          </div>
          <div className="reviews-summary" data-aos="fade-up" data-aos-delay="400">
            <div className="summary-stats">
              <div className="overall-rating">
                <span className="rating-number">4.4</span>
                <div className="stars">
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star-half-alt" />
                </div>
                <span className="total-reviews">20 đánh giá</span>
              </div>
              <div className="rating-breakdown">
                {ratingBreakdown.map(item => (
                  <div className="rating-bar" key={item.label}>
                    <span>{item.label}</span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${item.percent}%` }} />
                    </div>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info" data-aos="slide-right" data-aos-duration="1200">
              <h2 data-key="contact-title">Liên hệ với chúng tôi</h2>
              <p data-key="contact-subtitle">
                Hãy để COVASOL đồng hành cùng doanh nghiệp của bạn trên hành trình chuyển đổi số.
              </p>
              <div className="contact-details">
                {contactDetails.map(detail => (
                  <div className="contact-item" key={detail.label}>
                    <i className={detail.icon} />
                    <div>
                      <span>{detail.label}</span>
                      {detail.href ? (
                        <a href={detail.href} target={detail.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                          {detail.value}
                        </a>
                      ) : (
                        <span>{detail.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="social-links">
                {contactSocials.map(social => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <i className={social.icon} />
                  </a>
                ))}
              </div>
            </div>
            <div className="contact-form" data-aos="slide-left" data-aos-duration="1200" data-aos-delay="200">
              <form id="quoteForm">
                <div className="form-group">
                  <input type="text" id="name" name="name" placeholder="Họ và tên *" data-key="contact-form-name" required />
                </div>
                <div className="form-group">
                  <input type="email" id="email" name="email" placeholder="Email *" data-key="contact-form-email" required />
                </div>
                <div className="form-group">
                  <input type="tel" id="phone" name="phone" placeholder="Số điện thoại *" data-key="contact-form-phone" required />
                </div>
                <div className="form-group">
                  <select id="service" name="service" required>
                    {contactServices.map(option => (
                      <option value={option.value} data-key={option.textKey} key={option.textKey}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Mô tả chi tiết yêu cầu của bạn... *"
                    data-key="contact-form-message"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" id="submitBtn">
                  <span data-key="contact-form-submit">Gửi yêu cầu báo giá</span>
                  <i className="fas fa-paper-plane" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
