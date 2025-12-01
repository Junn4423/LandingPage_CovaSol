import { ProductCard, type LegacyProductCard } from './product-card';

interface ProductsGridProps {
  title: string;
  subtitle: string;
  titleKey: string;
  subtitleKey: string;
  items: LegacyProductCard[];
  emptyMessage: string;
}

export function ProductsGrid({ title, subtitle, titleKey, subtitleKey, items, emptyMessage }: ProductsGridProps) {
  const hasItems = items.length > 0;

  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2 data-key={titleKey}>{title}</h2>
          <p data-key={subtitleKey}>{subtitle}</p>
        </div>

        {hasItems ? (
          <div className="products-grid">
            {items.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="posts-empty" role="status">
            <i className="fas fa-box-open" aria-hidden="true" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
