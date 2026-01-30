'use client';

import { useEffect, useState, useCallback } from 'react';
import { trackEvent } from '@/components/common/google-analytics';

interface ExitIntentPopupProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  showNewsletter?: boolean;
}

export function ExitIntentPopup({
  title = 'Đừng bỏ lỡ!',
  subtitle = 'Đăng ký nhận thông tin về các giải pháp công nghệ mới nhất từ COVASOL.',
  ctaText = 'Liên hệ tư vấn',
  ctaLink = '/#contact',
  showNewsletter = true
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const showPopup = useCallback(() => {
    if (hasShown) return;
    
    // Check if popup was shown recently (within 24 hours)
    const lastShown = localStorage.getItem('exitPopupLastShown');
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      const hoursSinceLastShown = (Date.now() - lastShownTime) / (1000 * 60 * 60);
      if (hoursSinceLastShown < 24) return;
    }

    setIsVisible(true);
    setHasShown(true);
    localStorage.setItem('exitPopupLastShown', Date.now().toString());
    trackEvent('exit_intent_popup_shown');
  }, [hasShown]);

  useEffect(() => {
    // Exit intent detection for desktop
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    // Scroll-based trigger for mobile (when scrolling up quickly)
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = lastScrollY - currentScrollY;
      
      // If scrolling up quickly from a deep position
      if (scrollDiff > 100 && currentScrollY < 200 && lastScrollY > 500) {
        showPopup();
      }
      
      lastScrollY = currentScrollY;
    };

    // Only add listeners after 10 seconds on page
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showPopup]);

  const handleClose = () => {
    setIsVisible(false);
    trackEvent('exit_intent_popup_closed');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate newsletter subscription
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      trackEvent('newsletter_signup', { source: 'exit_intent' });
    } catch (error) {
      console.error('Newsletter signup failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCtaClick = () => {
    trackEvent('exit_intent_cta_click');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="exit-popup-overlay" onClick={handleClose} />
      <div className="exit-popup" role="dialog" aria-modal="true">
        <button className="close-btn" onClick={handleClose} aria-label="Đóng">
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        <div className="popup-content">
          <div className="popup-icon">
            <i className="fas fa-gift" aria-hidden="true" />
          </div>
          
          <h2>{title}</h2>
          <p>{subtitle}</p>

          {showNewsletter && !submitted && (
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                disabled={isSubmitting}
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
              </button>
            </form>
          )}

          {submitted && (
            <div className="success-message">
              <i className="fas fa-check-circle" aria-hidden="true" />
              Cảm ơn bạn đã đăng ký!
            </div>
          )}

          <div className="popup-cta">
            <span className="divider">hoặc</span>
            <a href={ctaLink} className="cta-btn" onClick={handleCtaClick}>
              {ctaText}
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exit-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 9998;
          animation: fadeIn 0.3s ease;
        }

        .exit-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 480px;
          width: 90%;
          z-index: 9999;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          padding: 8px;
          line-height: 1;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #374151;
        }

        .popup-content {
          text-align: center;
        }

        .popup-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #124e66 0%, #0d8065 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .popup-icon i {
          font-size: 36px;
          color: white;
        }

        h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px;
        }

        p {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        .newsletter-form {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .newsletter-form input {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .newsletter-form input:focus {
          outline: none;
          border-color: #124e66;
        }

        .newsletter-form button {
          padding: 14px 24px;
          background: #124e66;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .newsletter-form button:hover:not(:disabled) {
          background: #0d3d51;
        }

        .newsletter-form button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: #f0fdf4;
          color: #16a34a;
          border-radius: 10px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .popup-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .divider {
          color: #9ca3af;
          font-size: 14px;
        }

        .cta-btn {
          display: inline-block;
          padding: 14px 32px;
          background: transparent;
          color: #124e66;
          border: 2px solid #124e66;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .cta-btn:hover {
          background: #124e66;
          color: white;
        }

        @media (max-width: 480px) {
          .exit-popup {
            padding: 32px 24px;
          }

          h2 {
            font-size: 24px;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .popup-icon {
            width: 64px;
            height: 64px;
          }

          .popup-icon i {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
}
