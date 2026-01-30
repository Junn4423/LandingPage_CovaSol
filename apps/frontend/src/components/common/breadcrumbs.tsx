import Link from 'next/link';
import type { Route } from 'next';
import './breadcrumbs.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://covasol.com.vn${item.href}` : undefined
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className={`breadcrumbs ${className}`} aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="breadcrumb-item">
                {!isLast && item.href ? (
                  <>
                    <Link href={item.href as Route} className="breadcrumb-link">
                      {index === 0 && <i className="fas fa-home" aria-hidden="true" />}
                      <span>{item.label}</span>
                    </Link>
                    <span className="breadcrumb-separator" aria-hidden="true">
                      <i className="fas fa-chevron-right" />
                    </span>
                  </>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
