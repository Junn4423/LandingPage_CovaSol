"use client";

import { useEffect } from 'react';

function getApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
}

export function VisitTracker() {
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${getApiBaseUrl()}/v1/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    }).catch(() => {
      // Silently ignore tracking failures
    });

    return () => controller.abort();
  }, []);

  return null;
}
