/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductDetail, fetchProductSummaries } from '@/lib/api/products';

interface ProductPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const products = await fetchProductSummaries();
  return products.map(product => ({ id: product.slug ?? product.id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = params;
  const product = await fetchProductDetail(id);

  if (!product) {
    return {
      title: 'Giải pháp không tồn tại'
    };
  }

  return {
    title: product.name,
    description: product.shortDescription || product.description
  };
}

function splitParagraphs(content: string | undefined) {
  if (!content) return [];
  return content.split('\n\n').map(paragraph => paragraph.trim()).filter(Boolean);
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await fetchProductDetail(params.id);

  if (!product) {
    notFound();
  }

  const paragraphs = splitParagraphs(product.description);
  const highlights = product.highlights ?? [];
  const featureTags = product.featureTags ?? [];
  const heroImage = product.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="product-detail-page detail-preview">
      <section className="product-preview-section">
        <div className="container">
          <div className="product-preview-layout">
            <div className="product-main" data-aos="fade-up">
              <div className="preview-content preview-surface">
                <div className="live-preview-header">
                  <div className="meta-badge">{product.category || 'Giải pháp công nghệ'}</div>
                  <h1>{product.name}</h1>
                  <p className="preview-subtitle">{product.shortDescription || 'Giải pháp đang được cập nhật mô tả chi tiết.'}</p>
                  <div className="preview-meta">
                    <span className="meta-date">Mã: {product.code}</span>
                    <span className="meta-author">Trạng thái: {product.status}</span>
                  </div>
                </div>

                <div className="preview-hero-image">
                  <img src={heroImage} alt={product.name} />
                </div>

                {product.shortDescription ? <p className="preview-excerpt">{product.shortDescription}</p> : null}

                <div className="preview-body">
                  {paragraphs.length ? (
                    paragraphs.map((paragraph, index) => (
                      <p key={index} className="preview-paragraph">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="preview-placeholder">Nội dung chi tiết đang được cập nhật.</p>
                  )}
                </div>

                {featureTags.length ? (
                  <div className="preview-highlights">
                    <h3>Tính năng chính</h3>
                    <ul>
                      {featureTags.map(tag => (
                        <li key={tag}>
                          <i className="fas fa-check" aria-hidden="true" />
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {highlights.length ? (
                  <div className="preview-highlights">
                    <h3>Lợi ích nổi bật</h3>
                    <ul>
                      {highlights.map(highlight => (
                        <li key={highlight}>
                          <i className="fas fa-star" aria-hidden="true" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="preview-footer-panel">
                  <div className="preview-tags">
                    <span className="preview-tag is-muted">Mã sản phẩm: {product.code}</span>
                    <span className="preview-tag">Trạng thái: {product.status}</span>
                  </div>
                  <div className="product-cta-group">
                    {product.ctaPrimaryUrl ? (
                      <a href={product.ctaPrimaryUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer" id="productPrimaryCta">
                        {product.ctaPrimaryLabel || 'Yêu cầu demo'}
                      </a>
                    ) : (
                      <Link href="/#contact" className="btn btn-primary" id="productPrimaryCta">
                        Liên hệ tư vấn
                      </Link>
                    )}
                    {product.ctaSecondaryUrl ? (
                      <a href={product.ctaSecondaryUrl} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                        {product.ctaSecondaryLabel || 'Tài liệu chi tiết'}
                      </a>
                    ) : (
                      <Link href="/products" className="btn btn-outline">
                        <i className="fas fa-arrow-left" aria-hidden="true" /> Quay lại danh sách
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="product-aside" data-aos="fade-up" data-aos-delay="150">
              <div className="aside-card">
                <h3>Tài liệu & Liên kết</h3>
                <ul className="aside-links">
                  {product.ctaPrimaryUrl ? (
                    <li>
                      <a href={product.ctaPrimaryUrl} target="_blank" rel="noopener noreferrer">
                        {product.ctaPrimaryLabel || 'Xem demo'}
                      </a>
                    </li>
                  ) : null}
                  {product.ctaSecondaryUrl ? (
                    <li>
                      <a href={product.ctaSecondaryUrl} target="_blank" rel="noopener noreferrer">
                        {product.ctaSecondaryLabel || 'Tải brochure'}
                      </a>
                    </li>
                  ) : null}
                  <li>
                    <a href="/#contact">Liên hệ đội ngũ triển khai</a>
                  </li>
                </ul>
              </div>
              <div className="aside-card highlight">
                <h3>Nhận tư vấn</h3>
                <p>Để lại thông tin liên hệ, đội ngũ COVASOL sẽ hỗ trợ trong 24 giờ.</p>
                <Link className="btn btn-primary" href="/#contact">
                  Đặt lịch tư vấn
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
