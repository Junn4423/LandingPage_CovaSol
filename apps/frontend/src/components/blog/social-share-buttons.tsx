'use client';

import { useEffect, useState } from 'react';
import { trackSocialShare } from '@/components/common/google-analytics';

interface SocialShareButtonsProps {
  title: string;
  excerpt?: string;
  slug: string;
  className?: string;
}

export function SocialShareButtons({ title, excerpt, slug, className = '' }: SocialShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/blog/${slug}`);
  }, [slug]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    zalo: `https://zalo.me/share/social/?d=${encodedTitle}&u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };

  const handleShare = (platform: string, url: string) => {
    trackSocialShare(platform, 'blog', title);
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackSocialShare('copy_link', 'blog', title);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: shareUrl
        });
        trackSocialShare('native_share', 'blog', title);
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className={`social-share-buttons ${className}`}>
      <span className="share-label">
        <i className="fas fa-share-alt" aria-hidden="true" /> Chia sẻ:
      </span>
      <div className="share-buttons">
        <button
          onClick={() => handleShare('facebook', shareLinks.facebook)}
          className="share-btn share-facebook"
          title="Chia sẻ lên Facebook"
          aria-label="Chia sẻ lên Facebook"
        >
          <i className="fab fa-facebook-f" aria-hidden="true" />
        </button>
        
        <button
          onClick={() => handleShare('zalo', shareLinks.zalo)}
          className="share-btn share-zalo"
          title="Chia sẻ qua Zalo"
          aria-label="Chia sẻ qua Zalo"
        >
          <span className="zalo-icon">Z</span>
        </button>

        <button
          onClick={() => handleShare('linkedin', shareLinks.linkedin)}
          className="share-btn share-linkedin"
          title="Chia sẻ lên LinkedIn"
          aria-label="Chia sẻ lên LinkedIn"
        >
          <i className="fab fa-linkedin-in" aria-hidden="true" />
        </button>

        <button
          onClick={() => handleShare('twitter', shareLinks.twitter)}
          className="share-btn share-twitter"
          title="Chia sẻ lên X (Twitter)"
          aria-label="Chia sẻ lên X (Twitter)"
        >
          <i className="fab fa-x-twitter" aria-hidden="true" />
        </button>

        <button
          onClick={() => handleShare('telegram', shareLinks.telegram)}
          className="share-btn share-telegram"
          title="Chia sẻ qua Telegram"
          aria-label="Chia sẻ qua Telegram"
        >
          <i className="fab fa-telegram-plane" aria-hidden="true" />
        </button>

        <button
          onClick={handleCopyLink}
          className={`share-btn share-copy ${copied ? 'copied' : ''}`}
          title={copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
          aria-label="Sao chép liên kết"
        >
          <i className={copied ? 'fas fa-check' : 'fas fa-link'} aria-hidden="true" />
        </button>
      </div>

      <style jsx>{`
        .social-share-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 16px 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          margin: 24px 0;
        }

        .share-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .share-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .share-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          transition: all 0.2s ease;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .share-btn:active {
          transform: translateY(0);
        }

        .share-facebook {
          background: #1877f2;
        }

        .share-zalo {
          background: #0068ff;
        }

        .zalo-icon {
          font-weight: bold;
          font-size: 18px;
        }

        .share-linkedin {
          background: #0a66c2;
        }

        .share-twitter {
          background: #000000;
        }

        .share-telegram {
          background: #0088cc;
        }

        .share-copy {
          background: #6b7280;
        }

        .share-copy.copied {
          background: #10b981;
        }

        .share-native {
          background: #124e66;
        }

        @media (max-width: 480px) {
          .social-share-buttons {
            flex-direction: column;
            align-items: flex-start;
          }

          .share-btn {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
