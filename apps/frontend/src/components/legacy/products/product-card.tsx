/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import Link from 'next/link';
import { normalizeImageUrl } from '@/lib/image-url';

export interface LegacyProductCard {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  featured?: boolean;
  badge?: {
    label: string;
    variant?: 'new';
  };
  primaryCta?: LegacyProductCta;
  secondaryCta?: LegacyProductCta;
}

export interface LegacyProductCta {
  label: string;
  href: string;
}

interface ProductCardProps {
  product: LegacyProductCard;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const placeholderImage = '/assets/logo_whvxwb/logo_whvxwb_c_scale,w_438.png';
  const imageSrc = normalizeImageUrl(product.imageUrl, { fallback: placeholderImage });

  return (
    <article className={clsx('product-card', { featured: product.featured })} data-aos="fade-up">
      <div className="product-image">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={event => {
            if (event.currentTarget.src !== placeholderImage) {
              event.currentTarget.src = placeholderImage;
            }
          }}
        />
        {product.badge ? (
          <div className={clsx('product-badge', { new: product.badge.variant === 'new' })}>{product.badge.label}</div>
        ) : null}
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-description">{product.description}</p>
        {product.tags?.length ? (
          <div className="product-features">
            {product.tags.map(tag => (
              <span key={`${product.id}-${tag}`} className="feature-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="product-actions">
          {product.primaryCta ? <CtaLink {...product.primaryCta} intent="primary" /> : null}
          {product.secondaryCta ? <CtaLink {...product.secondaryCta} intent="secondary" /> : null}
        </div>
      </div>
    </article>
  );
}

interface CtaLinkProps extends LegacyProductCta {
  intent: 'primary' | 'secondary';
}

function CtaLink({ label, href, intent }: CtaLinkProps) {
  const className = intent === 'primary' ? 'btn btn-primary' : 'btn btn-outline';
  const isInternal = href.startsWith('/');

  if (isInternal) {
    return (
      <Link href={href as any} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}
