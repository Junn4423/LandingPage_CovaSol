/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { normalizeImageUrl } from '@/lib/image-url';

const LOGO_SRC = normalizeImageUrl('/assets/img/logo.png', { fallback: '/assets/img/logo.png' });

const productLinks = [
  { label: 'Tính năng', href: '/products' },
  { label: 'Bảng giá', href: '/#contact' },
  { label: 'Cập nhật mới', href: '/blog' },
  { label: 'Tích hợp', href: '/services' }
];

const supportLinks = [
  { label: 'Hướng dẫn sử dụng', href: '/blog' },
  { label: 'Video hướng dẫn', href: '/blog' },
  { label: 'FAQ', href: '/blog' },
  { label: 'Liên hệ hỗ trợ', href: '/#contact' }
];

const contactItems = [
  { icon: 'fas fa-phone', label: 'Hotline', value: '0559526824', href: 'tel:0559526824' },
  { icon: 'fas fa-envelope', label: 'Email', value: 'covasol.studio@gmail.com', href: 'mailto:covasol.studio@gmail.com' },
  { icon: 'fas fa-location-dot', label: 'Địa chỉ', value: 'TP. Hồ Chí Minh', href: 'https://maps.app.goo.gl/6YtYf7x1r7vGk9jK6' }
];

const socialLinks = [
  { icon: 'fab fa-facebook-f', label: 'Facebook', href: 'https://www.facebook.com/covasol.studio' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/company/covasol' },
  { icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/CovaSol' }
];

export function LegacyFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={LOGO_SRC} alt="COVASOL Logo" />
              <span>COVASOL</span>
            </div>
            <p className="footer-description">
              Giải pháp SaaS, AI và workflow engine đồng hành cùng doanh nghiệp Việt.
            </p>
            <div className="footer-social" aria-label="Kênh kết nối">
              {socialLinks.map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                  <i className={link.icon} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h4>Sản phẩm</h4>
            <ul>
              {productLinks.map(item => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <ul>
              {supportLinks.map(item => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h4>Liên hệ</h4>
            <ul className="footer-contact">
              {contactItems.map(item => (
                <li key={item.label}>
                  <a href={item.href} target={item.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    <i className={item.icon} aria-hidden="true" />
                    <span>{item.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {year} COVASOL. All rights reserved.</span>
          <div className="footer-legal">
            <Link href="/terms">Điều khoản sử dụng</Link>
            <Link href="/privacy">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
