'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { normalizeImageUrl } from '@/lib/image-url';

const LOGO_SRC = normalizeImageUrl('/assets/img/logo.png', { fallback: '/assets/img/logo.png' });

/* eslint-disable @next/next/no-img-element */
export function LoadingScreen() {
  const [isHidden, setIsHidden] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let loadListener: (() => void) | null = null;
    let isCompleted = false;

    const finishLoading = () => {
      if (isCompleted) {
        return;
      }
      isCompleted = true;
      setIsHidden(true);
      hideTimer = setTimeout(() => setShouldRender(false), 600);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      loadListener = () => finishLoading();
      window.addEventListener('load', loadListener, { once: true });
    }

    // Fallback in case the load event never fires (e.g. request error)
    fallbackTimer = setTimeout(() => finishLoading(), 4000);

    return () => {
      if (loadListener) window.removeEventListener('load', loadListener);
      if (hideTimer) clearTimeout(hideTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div id="loading" className={clsx('loading-screen', { hidden: isHidden })} aria-hidden="true">
      <div className="loading-content">
        <img src={LOGO_SRC} alt="COVASOL Logo" className="loading-logo" />
        <div className="loading-spinner" />
      </div>
    </div>
  );
}
