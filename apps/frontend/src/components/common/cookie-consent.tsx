"use client";

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'covasol-cookie-consent';

function getApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
}

interface StoredConsent {
  consented: boolean;
  timestamp: string;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setVisible(true);
    }
  }, []);

  const persist = (consented: boolean) => {
    if (typeof window === 'undefined') return;
    const payload: StoredConsent = {
      consented,
      timestamp: new Date().toISOString()
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const submitConsent = async (consented: boolean) => {
    setSubmitting(true);
    try {
      await fetch(`${getApiBaseUrl()}/v1/analytics/cookie-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consented }),
      });
    } catch {
      // ignore network errors to avoid blocking UX
    } finally {
      persist(consented);
      setVisible(false);
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-consent__content">
        <div>
          <strong>Chúng tôi sử dụng cookie</strong>
          <p>Cookie giúp cải thiện trải nghiệm và phân tích hiệu suất website. Bạn có đồng ý chia sẻ dữ liệu cookie?</p>
        </div>
        <div className="cookie-consent__actions">
          <button type="button" className="btn btn-secondary" onClick={() => submitConsent(false)} disabled={submitting}>
            Từ chối
          </button>
          <button type="button" className="btn btn-primary" onClick={() => submitConsent(true)} disabled={submitting}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
