'use client';

import Link from 'next/link';
import type { ProductSummary } from '@/types/content';
import type { Route } from 'next';
import { normalizeImageUrl } from '@/lib/image-url';

interface HomeProductsGridProps {
  products: ProductSummary[];
}

export function HomeProductsGrid({ products }: HomeProductsGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="posts-empty">
        <i className="fas fa-box-open" />
        <p data-key="home-products-empty">Chưa có sản phẩm nào được xuất bản.</p>
      </div>
    );
  }

  return (
    <div className="products-grid" id="homeProductsGrid">
      {products.slice(0, 3).map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: ProductSummary;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const detailUrl = `/products/${product.slug || product.id}` as Route;
  const fallbackImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80';
  const imageSrc = normalizeImageUrl(product.imageUrl, { fallback: fallbackImage });

  return (
    <article
      className="product-card"
      data-aos="fade-up"
      tabIndex={0}
    >
      <div className="product-image">
        <Link href={detailUrl}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={product.name || 'COVASOL Product'}
            loading="lazy"
          />
        </Link>
      </div>
      <div className="product-content">
        <h3>
          <Link href={detailUrl}>{product.name || 'COVASOL Solution'}</Link>
        </h3>
        <p className="product-category">{product.category || 'Giải pháp số'}</p>
        <p className="product-description">
          {product.shortDescription || 'Giải pháp công nghệ linh hoạt cho doanh nghiệp.'}
        </p>
        <div className="product-actions">
          <Link href={detailUrl} className="btn btn-outline">
            <span data-key="read-more">Xem chi tiết</span>
            <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
    </article>
  );
}
