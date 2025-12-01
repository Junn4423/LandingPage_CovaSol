interface ContactItem {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

const contactItems: ContactItem[] = [
  { icon: 'fas fa-phone', label: 'Hotline', value: '0707 038 113', href: 'tel:0707038113' },
  { icon: 'fas fa-envelope', label: 'Email', value: 'covasol.studio@gmail.com', href: 'mailto:covasol.studio@gmail.com' },
  { icon: 'fas fa-location-dot', label: 'Studio', value: 'TP. Hồ Chí Minh & Hà Nội', href: 'https://maps.app.goo.gl/6YtYf7x1r7vGk9jK6' },
  { icon: 'fas fa-clock', label: 'Giờ làm việc', value: '09:00 - 21:00 (T2 - CN)' }
];

const socialLinks: SocialLink[] = [
  { icon: 'fab fa-facebook-f', label: 'Facebook', href: 'https://www.facebook.com/junloun4423' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/company/covasol' },
  { icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/CovaSol' }
];

export interface LegacyContactSectionProps {
  sectionId?: string;
  headingKey?: string;
  subtitleKey?: string;
  heading?: string;
  subtitle?: string;
}

export function LegacyContactSection({
  sectionId = 'contact',
  headingKey = 'contact-title',
  subtitleKey = 'contact-subtitle',
  heading = 'Liên hệ với chúng tôi',
  subtitle = 'Hãy để COVASOL đồng hành cùng doanh nghiệp của bạn trên hành trình chuyển đổi số.'
}: LegacyContactSectionProps) {
  const headingId = `${sectionId}Heading`;

  return (
    <section id={sectionId} className="contact" aria-labelledby={headingId}>
      <div className="container">
        <div className="contact-content">
          <div className="contact-info" data-aos="fade-right">
            <h2 id={headingId} data-key={headingKey}>
              {heading}
            </h2>
            <p data-key={subtitleKey}>{subtitle}</p>
            <div className="contact-details">
              {contactItems.map(item => (
                <div className="contact-item" key={item.label}>
                  <i className={item.icon} aria-hidden="true" />
                  <div>
                    <span>{item.label}</span>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      <strong>{item.value}</strong>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="social-links" aria-label="Kênh kết nối">
              {socialLinks.map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                  <i className={link.icon} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <form className="contact-form" id="quoteForm" data-aos="fade-left" noValidate>
            <div className="form-group">
              <input type="text" id="name" name="name" data-key="contact-form-name" placeholder="Họ và tên *" required />
            </div>
            <div className="form-group">
              <input type="email" id="email" name="email" data-key="contact-form-email" placeholder="Email *" required />
            </div>
            <div className="form-group">
              <input type="tel" id="phone" name="phone" data-key="contact-form-phone" placeholder="Số điện thoại *" required />
            </div>
            <div className="form-group">
              <select id="service" name="service" required>
                <option value="" data-key="contact-form-service">
                  -- Chọn dịch vụ quan tâm * --
                </option>
                <option value="web" data-key="service-option-web">
                  Phát triển Website
                </option>
                <option value="mobile" data-key="service-option-mobile">
                  Ứng dụng di động
                </option>
                <option value="ecommerce" data-key="service-option-ecommerce">
                  Thương mại điện tử
                </option>
                <option value="uiux" data-key="service-option-uiux">
                  Thiết kế UI/UX
                </option>
                <option value="digital" data-key="service-option-digital">
                  Chuyển đổi số
                </option>
                <option value="other" data-key="service-option-other">
                  Khác
                </option>
              </select>
            </div>
            <div className="form-group">
              <textarea
                id="message"
                name="message"
                rows={4}
                data-key="contact-form-message"
                placeholder="Mô tả chi tiết yêu cầu của bạn... *"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" id="submitBtn" data-key="contact-form-submit">
              Gửi yêu cầu báo giá
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
