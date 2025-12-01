'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type LanguageCode = 'vi' | 'en' | 'fr';

interface TranslationRecord {
  [code: string]: Record<string, string>;
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  shortLabel: string;
  flagUrl: string;
}

const LANGUAGE_STORAGE_KEY = 'covasol-language';

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI', flagUrl: 'https://flagcdn.com/w20/vn.png' },
  { code: 'en', label: 'English', shortLabel: 'EN', flagUrl: 'https://flagcdn.com/w20/us.png' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', flagUrl: 'https://flagcdn.com/w20/fr.png' }
];

const FALLBACK_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  vi: {
    'nav-home': 'Trang chủ',
    'nav-services': 'Dịch vụ',
    'nav-products': 'Sản phẩm',
    'nav-blog': 'Blog',
    'nav-about': 'Về chúng tôi',
    'nav-reviews': 'Đánh giá',
    'nav-contact': 'Liên hệ',
    'nav-cta': 'Tư vấn miễn phí',
    'products-title': 'Sản phẩm của COVASOL',
    'products-description': 'Khám phá các sản phẩm công nghệ độc quyền do COVASOL phát triển.',
    'products-grid-title': 'Bộ sưu tập sản phẩm',
    'products-grid-subtitle': 'Các giải pháp công nghệ được thiết kế để thay đổi cách bạn làm việc',
    featured: 'Nổi bật',
    new: 'Mới',
    'cta-title': 'Sẵn sàng trải nghiệm sản phẩm của chúng tôi?',
    'cta-description': 'Liên hệ với đội ngũ COVASOL để được tư vấn chi tiết về sản phẩm phù hợp với nhu cầu của bạn.',
    'contact-now': 'Liên hệ ngay',
    'schedule-demo': 'Đặt lịch demo'
  },
  en: {
    'nav-home': 'Home',
    'nav-services': 'Services',
    'nav-products': 'Products',
    'nav-blog': 'Blog',
    'nav-about': 'About Us',
    'nav-reviews': 'Reviews',
    'nav-contact': 'Contact',
    'nav-cta': 'Free Consultation',
    'products-title': 'COVASOL Products',
    'products-description': 'Explore proprietary SaaS and AI solutions crafted by COVASOL.',
    'products-grid-title': 'Product Collection',
    'products-grid-subtitle': 'Solutions engineered to change the way you work',
    featured: 'Featured',
    new: 'New',
    'cta-title': 'Ready to experience our products?',
    'cta-description': 'Connect with the COVASOL team for tailored recommendations.',
    'contact-now': 'Contact now',
    'schedule-demo': 'Book a demo'
  },
  fr: {
    'nav-home': 'Accueil',
    'nav-services': 'Services',
    'nav-products': 'Produits',
    'nav-blog': 'Blog',
    'nav-about': 'À propos',
    'nav-reviews': 'Avis',
    'nav-contact': 'Contact',
    'nav-cta': 'Consultation gratuite',
    'products-title': 'Produits COVASOL',
    'products-description': 'Découvrez les solutions technologiques développées par COVASOL.',
    'products-grid-title': 'Collection de produits',
    'products-grid-subtitle': 'Des solutions conçues pour transformer votre façon de travailler',
    featured: 'À la une',
    new: 'Nouveau',
    'cta-title': 'Prêt à essayer nos produits ?',
    'cta-description': "Contactez l'équipe COVASOL pour une recommandation adaptée.",
    'contact-now': 'Contactez-nous',
    'schedule-demo': 'Planifier une démo'
  }
};

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === 'vi' || value === 'en' || value === 'fr';
}

function isTranslationRecord(value: unknown): value is TranslationRecord {
  return Boolean(value) && typeof value === 'object';
}

function dispatchLanguageEvent(language: LanguageCode) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  const event = new CustomEvent('covasol:language-change', {
    detail: { language }
  });
  window.dispatchEvent(event);
}

declare global {
  interface Window {
    covasolTranslations?: TranslationRecord;
    translations?: TranslationRecord;
    covasolLanguageBridge?: {
      getCurrentLanguage?: () => string;
      setLanguage?: (lang: string) => void;
    };
  }
}

export function useLanguageSwitcher(defaultLanguage: LanguageCode = 'vi') {
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [translations, setTranslations] = useState<Record<LanguageCode, Record<string, string>>>(FALLBACK_TRANSLATIONS);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguageCode(saved)) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const globalTranslations = window.covasolTranslations || window.translations;
    if (isTranslationRecord(globalTranslations)) {
      setTranslations(prev => prev === globalTranslations ? prev : (globalTranslations as Record<LanguageCode, Record<string, string>>));
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      window.covasolLanguageBridge?.setLanguage?.(language);
      dispatchLanguageEvent(language);
    }
  }, [language]);

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const selectLanguage = useCallback((code: LanguageCode) => {
    setLanguage(code);
    setDropdownOpen(false);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const dictionary = translations[language] || translations[defaultLanguage];
      return dictionary?.[key] ?? fallback ?? key;
    },
    [language, translations, defaultLanguage]
  );

  const currentOption = useMemo(() => LANGUAGE_OPTIONS.find(option => option.code === language) ?? LANGUAGE_OPTIONS[0], [language]);

  return {
    language,
    t,
    options: LANGUAGE_OPTIONS,
    selectLanguage,
    toggleDropdown,
    isDropdownOpen,
    dropdownRef,
    currentOption
  } as const;
}
