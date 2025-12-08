import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LegacyContactSection } from '@/components/legacy/contact-section';
import { normalizeImageUrl } from '@/lib/image-url';
import { detailedServices, servicesOverview } from '@/lib/services-data';

export const metadata: Metadata = {
  title: 'Dịch vụ | COVASOL',
  description:
    'Dịch vụ tư vấn, thiết kế và phát triển phần mềm trọn gói của COVASOL. Từ discovery đến vận hành, chúng tôi đồng hành trong toàn bộ hành trình chuyển đổi số.'
};

const serviceHeroStats = [
  { value: '85+', label: 'Dự án chuyển đổi số' },
  { value: '96%', label: 'Tỉ lệ bàn giao đúng hạn' },
  { value: '30+', label: 'Chuyên gia & cộng sự' },
  { value: '08', label: 'Thành phố triển khai' }
];

const serviceApproachBullets = [
  'Discovery workshop đa phòng ban để xác định bài toán cốt lõi.',
  'Prototype UX và kiến trúc kỹ thuật được kiểm chứng song song.',
  'Delivery theo sprint minh bạch với KPI đầu ra đo lường được.'
];

const serviceApproachMilestones = [
  { value: '02 tuần', label: 'Discovery & alignment' },
  { value: '04 tuần', label: 'Build & validate' },
  { value: '24/7', label: 'Vận hành & tối ưu' }
];

const serviceGallery = [
  { src: '/assets/img/anh1.jpeg', alt: 'Workshop chiến lược', modifier: 'about-photo--primary', caption: 'Workshop chiến lược' },
  { src: '/assets/img/anh2.jpeg', alt: 'Design sprint', modifier: 'about-photo--secondary', caption: 'Design sprint' },
  { src: '/assets/img/anh3.jpeg', alt: 'Delivery ceremony', modifier: 'about-photo--tertiary', caption: 'Delivery ceremony' }
];

const servicePillars = [
  {
    icon: 'fas fa-layer-group',
    title: 'Discovery đa tầng',
    description: 'Phỏng vấn stakeholder, audit hiện trạng, xác định KPI rõ ràng trước khi triển khai.'
  },
  {
    icon: 'fas fa-sitemap',
    title: 'Kiến trúc linh hoạt',
    description: 'Thiết kế kiến trúc module hóa, dễ mở rộng và tích hợp với hệ thống sẵn có.'
  },
  {
    icon: 'fas fa-clipboard-check',
    title: 'Delivery minh bạch',
    description: 'Sprint planning, demo định kỳ, báo cáo trực quan để kiểm soát rủi ro.'
  },
  {
    icon: 'fas fa-shield-heart',
    title: 'Bảo mật & tuân thủ',
    description: 'Áp dụng chuẩn bảo mật OWASP, quản lý truy cập nhiều lớp, tuân thủ quy định.'
  },
  {
    icon: 'fas fa-people-carry-box',
    title: 'Đồng hành vận hành',
    description: 'Huấn luyện đội nội bộ, bàn giao playbook, hỗ trợ vận hành 24/7.'
  },
  {
    icon: 'fas fa-infinity',
    title: 'Tối ưu liên tục',
    description: 'Theo dõi số liệu thực tế, đề xuất cải tiến mỗi quý để tối đa ROI.'
  }
];

const deliverySteps = [
  {
    title: 'Kick-off & alignment',
    description: 'Xác định mục tiêu kinh doanh, chân dung người dùng, phạm vi deliverable.',
    outputs: ['Project charter', 'Success metrics', 'Risk register']
  },
  {
    title: 'Solution design',
    description: 'Thiết kế UX, kiến trúc hệ thống, lộ trình kỹ thuật từng phiên bản.',
    outputs: ['Experience map', 'System blueprint', 'Implementation roadmap']
  },
  {
    title: 'Build & integrate',
    description: 'Phát triển theo sprint, tự động hóa test, tích hợp với hệ sinh thái hiện hữu.',
    outputs: ['Incremental releases', 'Automation scripts', 'Integration playbook']
  },
  {
    title: 'Launch & success enablement',
    description: 'Chuẩn bị vận hành, đào tạo đội nội bộ, đo lường KPI sau triển khai.',
    outputs: ['Runbook & SOP', 'Training kit', 'Observability dashboard']
  }
];

const servicePackages = [
  {
    id: 'mvp-fast-track',
    name: 'MVP Fast Track',
    summary: 'Hoàn thiện MVP trong 6-8 tuần cùng squad giàu kinh nghiệm.',
    deliverables: ['Discovery sprint', 'Clickable prototype', 'Pilot release'],
    timeline: '6-8 tuần · 1 squad',
    badge: 'Phổ biến',
    featured: true,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'scale-program',
    name: 'Scale Program',
    summary: 'Mở rộng hệ thống, tối ưu hiệu năng và trải nghiệm trong giai đoạn tăng trưởng.',
    deliverables: ['Architecture refactor', 'Performance lab', 'Growth dashboard'],
    timeline: '12-16 tuần · 2 squad',
    badge: 'Tăng trưởng',
    featured: false,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dedicated-team',
    name: 'Dedicated Product Team',
    summary: 'Đội ngũ chuyên trách vận hành lâu dài cùng doanh nghiệp.',
    deliverables: ['Cross-functional team', 'OKR tracking', 'Optimization backlog'],
    timeline: 'Từ 6 tháng · 1-3 squad',
    badge: 'Enterprise',
    featured: false,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function ServicesPage() {
  return (
    <div className="services-page legacy-services">
      <section className="page-hero service-hero" aria-labelledby="serviceHeroHeading">
        <div className="hero-media" aria-hidden="true">
          <video autoPlay loop muted playsInline poster="/assets/img/anh4.jpeg">
            <source src="/assets/video/Hero_section_Landing_page_3D_animation.webm" type="video/mp4" />
          </video>
          <div className="hero-media-overlay" />
        </div>
        <div className="hero-container">
          <div className="hero-content" data-aos="fade-right">
            <p className="page-kicker">Consulting • Design • Engineering</p>
            <h1 id="serviceHeroHeading">Dịch vụ công nghệ trọn gói</h1>
            <p>
              Chúng tôi đồng hành cùng doanh nghiệp từ discovery đến vận hành. Đội ngũ COVASOL kết hợp tư duy sản phẩm, UI/UX và năng lực
              kỹ thuật để xây dựng giải pháp đo lường được hiệu quả thực tế.
            </p>
            <div className="hero-buttons">
              <Link href="/#contact" className="btn btn-primary">
                Đặt lịch tư vấn
              </Link>
              <a href="#capabilities" className="btn btn-secondary">
                Xem năng lực
              </a>
            </div>
            <div className="hero-stats">
              {serviceHeroStats.map(stat => (
                <div className="hero-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="services-overview" aria-labelledby="serviceCapabilitiesHeading">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 id="serviceCapabilitiesHeading">Năng lực cốt lõi</h2>
            <p>Hệ sinh thái dịch vụ kết nối chặt chẽ để đảm bảo chất lượng toàn hành trình.</p>
          </div>
          <div className="services-grid">
            {servicesOverview.map((service, index) => (
              <div className="service-card" data-aos="fade-up" key={service.title}>
                <div className="service-icon">
                  <i className={service.icon} aria-hidden="true" />
                </div>
                <h3 data-key={service.titleKey}>{service.title}</h3>
                <p data-key={service.descriptionKey}>{service.description}</p>
                <ul>
                  {service.features.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a href="#service-expertise" className="service-link">
                  <span>Tìm hiểu thêm</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="service-expertise" className="service-detail" aria-labelledby="serviceDetailHeading">
        <div className="container">
          <div className="service-detail-header" data-aos="fade-up">
            <h2 id="serviceDetailHeading">Chuyên môn triển khai</h2>
            <p className="service-tagline">“Tập trung vào giá trị kinh doanh đo lường được.”</p>
          </div>
          <div className="service-detail-grid">
            {detailedServices.map(detail => (
              <div className="detail-card" key={detail.title} data-aos="fade-up">
                <div className="detail-icon">
                  <i className={detail.icon} aria-hidden="true" />
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

      <section className="service-detail service-process" aria-labelledby="processHeading">
        <div className="container">
          <div className="service-detail-header" data-aos="fade-up">
            <h2 id="processHeading">Quy trình hợp tác</h2>
            <p className="service-tagline">Minh bạch từng bước, linh hoạt cho mọi quy mô dự án.</p>
          </div>
          <div className="service-detail-grid">
            {deliverySteps.map((step, index) => (
              <div className="detail-card" key={step.title} data-aos="fade-up">
                <div className="detail-icon">
                  <span style={{ color: '#fff', fontWeight: 700 }}>0{index + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="target-clients">
                  <strong>Deliverables:</strong> {step.outputs.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about service-approach" aria-labelledby="approachHeading">
        <div className="container">
          <div className="about-content">
            <div className="about-text" data-aos="fade-right">
              <h2 id="approachHeading">Phương pháp triển khai</h2>
              <p>
                Kết hợp tư duy sản phẩm, UI/UX và năng lực kỹ thuật, chúng tôi giúp doanh nghiệp chuyển đổi số nhanh nhưng vẫn đảm bảo
                kiểm soát chất lượng.
              </p>
              <ul>
                {serviceApproachBullets.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="about-stats">
                {serviceApproachMilestones.map(milestone => (
                  <div className="stat-item" key={milestone.label}>
                    <span className="stat-number">{milestone.value}</span>
                    <span className="stat-label">{milestone.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-image" data-aos="fade-left">
              <div className="about-gallery">
                {serviceGallery.map(photo => {
                  const imageSrc = normalizeImageUrl(photo.src, { fallback: photo.src });
                  return (
                    <figure className={`about-photo ${photo.modifier}`} key={photo.src}>
                      <Image src={imageSrc} alt={photo.alt} width={640} height={360} loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
                    <figcaption className="about-photo-caption">
                      <i className="fas fa-location-arrow" aria-hidden="true" />
                      {photo.caption}
                    </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose service-pillars" aria-labelledby="pillarHeading">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 id="pillarHeading">Nguyên tắc đồng hành</h2>
            <p>Cam kết được cụ thể hóa bằng quy trình và chỉ số rõ ràng.</p>
          </div>
          <div className="features-grid">
            {servicePillars.map(pillar => (
              <div className="feature-item" key={pillar.title} data-aos="zoom-in">
                <div className="feature-icon">
                  <i className={pillar.icon} aria-hidden="true" />
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="products-section service-packages" aria-labelledby="packagesHeading">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 id="packagesHeading">Gói dịch vụ linh hoạt</h2>
            <p>Chọn mô hình phù hợp hoặc kết hợp để tạo ra lộ trình riêng cho doanh nghiệp của bạn.</p>
          </div>
          <div className="products-grid">
                {servicePackages.map(pkg => {
                  const imageSrc = normalizeImageUrl(pkg.image, { fallback: pkg.image });
                  return (
                    <article className={`product-card${pkg.featured ? ' featured' : ''}`} key={pkg.id} data-aos="fade-up">
                      <div className="product-image">
                        <Image src={imageSrc} alt={pkg.name} width={640} height={360} sizes="(max-width: 768px) 100vw, 400px" />
                  {pkg.badge && <div className="product-badge">{pkg.badge}</div>}
                </div>
                <div className="product-content">
                  <h3>{pkg.name}</h3>
                  <p className="product-description">{pkg.summary}</p>
                  <div className="product-features">
                    {pkg.deliverables.map(item => (
                      <span className="feature-tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="product-category">{pkg.timeline}</p>
                  <div className="product-actions">
                    <Link href="/#contact" className="btn btn-primary">
                      Nhận tư vấn
                    </Link>
                    <a href="#services-contact" className="btn btn-outline">
                      Trao đổi chi tiết
                    </a>
                  </div>
                </div>
                    </article>
                  );
                })}
          </div>
        </div>
      </section>

      <section className="products-cta service-cta" aria-labelledby="servicesCtaHeading">
        <div className="container">
          <div className="cta-content" data-aos="fade-up">
            <h2 id="servicesCtaHeading">Sẵn sàng cho bước tiếp theo?</h2>
            <p>
              Chúng tôi sẽ lắng nghe bài toán cụ thể, đề xuất roadmap cùng chi phí minh bạch ngay trong buổi tư vấn đầu tiên.
            </p>
            <div className="cta-buttons">
              <Link href="/#contact" className="btn btn-primary">
                Đặt lịch discovery
              </Link>
              <a href="tel:0559526824" className="btn btn-outline">
                Gọi nhanh 0559526824
              </a>
            </div>
          </div>
        </div>
      </section>

      <LegacyContactSection sectionId="services-contact" />
    </div>
  );
}
