'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  console.log('New content available, please refresh.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if already dismissed recently
      const dismissed = localStorage.getItem('pwaInstallDismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return;
      }
      
      // Show prompt after delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000); // Show after 30 seconds
    };

    // Check if already installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="prompt-content">
        <img 
          src="/assets/favicon/web-app-manifest-192x192.png" 
          alt="COVASOL" 
          className="prompt-icon"
        />
        <div className="prompt-text">
          <strong>Cài đặt ứng dụng COVASOL</strong>
          <span>Truy cập nhanh hơn ngay từ màn hình chính</span>
        </div>
        <div className="prompt-actions">
          <button onClick={handleDismiss} className="dismiss-btn">
            Để sau
          </button>
          <button onClick={handleInstall} className="install-btn">
            Cài đặt
          </button>
        </div>
      </div>

      <style jsx>{`
        .pwa-install-prompt {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          max-width: 400px;
          margin: 0 auto;
          z-index: 9000;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .prompt-content {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 16px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
        }

        .prompt-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .prompt-text {
          flex: 1;
          min-width: 0;
        }

        .prompt-text strong {
          display: block;
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .prompt-text span {
          display: block;
          font-size: 12px;
          color: #6b7280;
        }

        .prompt-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .dismiss-btn {
          padding: 8px 12px;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          border-radius: 6px;
        }

        .dismiss-btn:hover {
          background: #f3f4f6;
        }

        .install-btn {
          padding: 8px 16px;
          background: #124e66;
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .install-btn:hover {
          background: #0d3d51;
        }

        @media (max-width: 480px) {
          .prompt-content {
            flex-wrap: wrap;
          }

          .prompt-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}
