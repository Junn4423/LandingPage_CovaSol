/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { normalizeImageUrl } from '@/lib/image-url';

const ZALO_ICON = normalizeImageUrl('/assets/img/icons/Zalo.png', { fallback: '/assets/img/icons/Zalo.png' });

export function FloatingContactFab() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFab = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={clsx('contact-fab', { open: isOpen })} aria-live="polite">
      <div className={clsx('contact-fab__actions', { open: isOpen })} id="contactFabActions">
        <a href="https://zalo.me/0707038113" className="contact-fab__action" target="_blank" rel="noopener noreferrer">
          <span className="contact-fab__icon contact-fab__icon--zalo">
            <img src={ZALO_ICON} alt="Zalo" />
          </span>
          <span className="contact-fab__label" data-key="contact-fab-zalo">
            Zalo
          </span>
        </a>
        <a href="tel:0707038113" className="contact-fab__action">
          <span className="contact-fab__icon contact-fab__icon--phone">
            <i className="fas fa-phone" aria-hidden="true" />
          </span>
          <span className="contact-fab__label" data-key="contact-fab-phone">
            Gọi ngay
          </span>
        </a>
        <a href="mailto:covasol.studio@gmail.com" className="contact-fab__action">
          <span className="contact-fab__icon contact-fab__icon--gmail">
            <i className="fas fa-envelope" aria-hidden="true" />
          </span>
          <span className="contact-fab__label" data-key="contact-fab-mail">
            Gửi Gmail
          </span>
        </a>
        <a href="https://www.facebook.com/junloun4423" className="contact-fab__action" target="_blank" rel="noopener noreferrer">
          <span className="contact-fab__icon contact-fab__icon--facebook">
            <i className="fab fa-facebook-f" aria-hidden="true" />
          </span>
          <span className="contact-fab__label" data-key="contact-fab-facebook">
            Facebook
          </span>
        </a>
      </div>
      <button 
        type="button" 
        className={clsx('contact-fab__toggle', { open: isOpen })}
        aria-expanded={isOpen} 
        aria-controls="contactFabActions"
        onClick={toggleFab}
      >
        <i className={clsx('fas', isOpen ? 'fa-times' : 'fa-headset')} aria-hidden="true" />
      </button>
    </div>
  );
}
