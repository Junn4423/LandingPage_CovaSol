/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductDetail, fetchProductSummaries } from '@/lib/api/products';
import { renderProductPreviewHtml } from '@/lib/legacy-preview';
import { ProductGalleryHandler } from '@/components/products/product-gallery-handler';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await fetchProductSummaries();
  return products
    .filter(product => product.slug || product.id)
    .map(product => ({ slug: product.slug ?? product.id! }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await fetchProductDetail(params.slug);
  if (!product) {
    return { title: 'Giải pháp không tồn tại' };
  }
  return {
    title: product.name,
    description: product.shortDescription || product.description
  };
}

function buildCtaButtons(product: Awaited<ReturnType<typeof fetchProductDetail>>) {
  if (!product) return null;
  return (
    <div className="product-cta-group">
      {product.ctaPrimary?.url ? (
        <a
          href={product.ctaPrimary.url}
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          id="productPrimaryCta"
        >
          {product.ctaPrimary.label || 'Yêu cầu demo'}
        </a>
      ) : (
        <Link href="/#contact" className="btn btn-primary" id="productPrimaryCta">
          Liên hệ tư vấn
        </Link>
      )}
      {product.ctaSecondary?.url ? (
        <a
          href={product.ctaSecondary.url}
          className="btn btn-outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {product.ctaSecondary.label || 'Tải brochure'}
        </a>
      ) : (
        <Link href="/products" className="btn btn-outline">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Quay lại danh sách
        </Link>
      )}
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await fetchProductDetail(params.slug);
  if (!product) {
    notFound();
  }

  const previewHtml = renderProductPreviewHtml(product);
  const ctaButtons = buildCtaButtons(product);

  // Prepare gallery images for modal
  const demoMedia = (product.demoMedia || [])
    .filter((item: any) => item?.url)
    .map((item: any) => ({ url: item.url, caption: item.caption || null }));
  
  const galleryMedia = (product.galleryMedia || [])
    .filter((item: any) => item?.url)
    .map((item: any) => ({ url: item.url, caption: item.caption || null }));

  return (
    <div className="product-detail-page detail-preview">
      <ProductGalleryHandler demoMedia={demoMedia} galleryMedia={galleryMedia} />
      <section className="product-preview-section">
        <div className="container">
          <div className="product-preview-layout">
            <div className="product-main" data-aos="fade-up">
              <div className="preview-content preview-surface">
                <div className="live-preview-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                <div className="preview-footer-panel">
                  <div className="preview-tags">
                    <span className="preview-tag is-muted">Mã sản phẩm: {product.code}</span>
                    <span className="preview-tag">Trạng thái: {product.status}</span>
                  </div>
                  {ctaButtons}
                </div>
              </div>
            </div>

            <aside className="product-aside" data-aos="fade-up" data-aos-delay="150">
              <div className="aside-card">
                <h3>Tài liệu & Liên kết</h3>
                <ul className="aside-links">
                  {product.ctaPrimary?.url ? (
                    <li>
                      <a href={product.ctaPrimary.url} target="_blank" rel="noopener noreferrer">
                        {product.ctaPrimary.label || 'Xem demo'}
                      </a>
                    </li>
                  ) : null}
                  {product.ctaSecondary?.url ? (
                    <li>
                      <a href={product.ctaSecondary.url} target="_blank" rel="noopener noreferrer">
                        {product.ctaSecondary.label || 'Tải brochure'}
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
