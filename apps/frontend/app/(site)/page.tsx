/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { fetchProductSummaries } from '@/lib/api/products';
import { fetchBlogSummaries } from '@/lib/api/blog';
import { fetchReviews, fetchReviewStats } from '@/lib/api/reviews';
import { normalizeImageUrl } from '@/lib/image-url';
import { HomeProductsGrid } from '@/components/home/home-products-grid';
import { HomeBlogGrid } from '@/components/home/home-blog-grid';
import { ReviewsCarousel } from '@/components/home/reviews-carousel';
import { ContactForm } from '@/components/home/contact-form';
import { HeroVideo } from '@/components/home/hero-video';

const HERO_VIDEO_SRC = '/assets/video/Hero_section_Landing_page_3D_animation.webm';

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

export default async function HomePage() {
  // Fetch data on server side
  const [products, blogPosts, reviews, reviewStats] = await Promise.all([
    fetchProductSummaries(),
    fetchBlogSummaries(),
    fetchReviews(),
    fetchReviewStats()
  ]);

  return (
    <>
      <section id="home" className="hero">
        <div className="hero-media" aria-hidden="true">
          <HeroVideo src={HERO_VIDEO_SRC} />
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
          <div className="section-actions" data-aos="fade-up">
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
          <div className="section-actions" data-aos="fade-up">
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
              <div className="service-card" data-aos="zoom-in" key={service.title}>
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
              <div className="detail-card" data-aos="fade-up" key={detail.title}>
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
                  .map(photo => {
                    const imageSrc = normalizeImageUrl(photo.src, { fallback: photo.src });
                    return (
                      <figure className="about-photo about-photo--primary" key={photo.src}>
                        <img src={imageSrc} alt={photo.alt} loading="lazy" />
                      <figcaption className="about-photo-caption">
                        <i className={photo.icon} />
                        <span>{photo.caption}</span>
                      </figcaption>
                      </figure>
                    );
                  })}
                <div className="about-gallery-stack">
                  {aboutPhotos
                    .filter(photo => photo.variant !== 'primary')
                    .map(photo => {
                      const imageSrc = normalizeImageUrl(photo.src, { fallback: photo.src });
                      return (
                        <figure className={`about-photo about-photo--${photo.variant}`} key={photo.src}>
                          <img src={imageSrc} alt={photo.alt} loading="lazy" />
                        <figcaption className="about-photo-caption">
                          <i className={photo.icon} />
                          <span>{photo.caption}</span>
                        </figcaption>
                        </figure>
                      );
                    })}
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
              <div className="feature-item" data-aos="fade-up" key={feature.title}>
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
          <ReviewsCarousel reviews={reviews} stats={reviewStats} />
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info" data-aos="fade-up">
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
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
