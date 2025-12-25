/* eslint-disable @next/next/no-img-element */
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
  const detailHref = product.primaryCta?.href || `/products/${product.id}`;

  return (
    <article className="yatame-post-card" data-aos="fade-up">
      <Link href={detailHref as any} className="card-thumbnail">
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
      </Link>
      <div className="card-body">
        <h3 className="card-title">
          <Link href={detailHref as any}>
            {product.name}
          </Link>
        </h3>
        <p className="card-excerpt">{product.description}</p>
      </div>
    </article>
  );
}
