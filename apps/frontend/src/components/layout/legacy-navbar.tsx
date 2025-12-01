'use client';

/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLanguageSwitcher } from '@/hooks/use-language-switcher';
import { useNavbarEffects } from '@/hooks/use-navbar-effects';

interface NavLink {
  href: string;
  label: string;
  dataKey: string;
  match?: (pathname: string) => boolean;
  homeHash?: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Trang chủ', dataKey: 'nav-home', match: pathname => pathname === '/' },
  {
    href: '/#services',
    label: 'Dịch vụ',
    dataKey: 'nav-services',
    match: pathname => pathname === '/',
    homeHash: '#services'
  },
  { href: '/products', label: 'Sản phẩm', dataKey: 'nav-products', match: pathname => pathname.startsWith('/products') },
  { href: '/blog', label: 'Blog', dataKey: 'nav-blog', match: pathname => pathname.startsWith('/blog') },
  { href: '/#about', label: 'Về chúng tôi', dataKey: 'nav-about', match: pathname => pathname === '/', homeHash: '#about' },
  { href: '/#reviews', label: 'Đánh giá', dataKey: 'nav-reviews', match: pathname => pathname === '/', homeHash: '#reviews' },
  { href: '/#contact', label: 'Liên hệ', dataKey: 'nav-contact', match: pathname => pathname === '/', homeHash: '#contact' }
];

export function LegacyNavbar() {
  const pathname = usePathname();
  const { t, options, currentOption, isDropdownOpen, toggleDropdown, selectLanguage, dropdownRef, language } = useLanguageSwitcher();
  const { isMenuOpen, isScrolled, toggleMenu, closeMenu } = useNavbarEffects();

  return (
    <nav className="navbar" aria-label="Điều hướng chính" data-react-navbar="true" style={getNavbarStyle(isScrolled)}>
      <div className="nav-container">
        <div className="nav-logo">
          <Link href="/">
            <img src="/assets/img/logo.png" alt="COVASOL Logo" />
          </Link>
          <Link href="/" aria-label="Trang chủ COVASOL">
            <span>COVASOL</span>
          </Link>
        </div>
        <div className={clsx('nav-menu', { active: isMenuOpen })}>
          {navLinks.map(link => {
            const resolvedHref = link.homeHash && pathname === '/' ? link.homeHash : link.href;
            const isAnchorLink = resolvedHref.startsWith('#');
            const commonProps = {
              className: clsx('nav-link', { active: link.match ? link.match(pathname) : pathname === link.href }),
              'data-key': link.dataKey,
              onClick: closeMenu
            } as const;

            if (isAnchorLink) {
              return (
                <a key={link.href + link.label} href={resolvedHref} {...commonProps}>
                  {t(link.dataKey, link.label)}
                </a>
              );
            }

            return (
              <Link key={link.href + link.label} href={resolvedHref as any} {...commonProps}>
                {t(link.dataKey, link.label)}
              </Link>
            );
          })}
        </div>
        <div className="nav-actions">
          <Link href="/#contact" className="nav-cta" data-key="nav-cta" onClick={closeMenu}>
            {t('nav-cta', 'Tư vấn miễn phí')}
          </Link>
          <div className="language-switcher">
            <div className={clsx('language-dropdown', { active: isDropdownOpen })} ref={dropdownRef}>
              <button
                className="lang-btn"
                id="langBtn"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                onClick={toggleDropdown}
              >
                <i className="fas fa-globe" aria-hidden="true" />
                <span id="currentLang">{currentOption.shortLabel}</span>
                <i className="fas fa-chevron-down" aria-hidden="true" />
              </button>
              <div className={clsx('lang-menu', { active: isDropdownOpen })} id="langMenu" role="menu">
                {options.map(option => (
                  <button
                    key={option.code}
                    className={clsx('lang-option', { active: option.code === language })}
                    data-lang={option.code}
                    type="button"
                    onClick={() => selectLanguage(option.code)}
                  >
                    <img src={option.flagUrl} alt={option.label} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button
          className={clsx('nav-toggle', { active: isMenuOpen })}
          type="button"
          aria-label="Mở menu"
          aria-pressed={isMenuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

function getNavbarStyle(isScrolled: boolean): CSSProperties | undefined {
  if (!isScrolled) {
    return undefined;
  }

  return {
    background: 'rgba(13, 27, 42, 0.98)',
    boxShadow: '0 2px 20px rgba(13, 27, 42, 0.1)'
  };
}
