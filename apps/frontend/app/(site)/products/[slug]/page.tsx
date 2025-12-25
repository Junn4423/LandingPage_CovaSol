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

  const baseUrl = 'https://covasol.com.vn';
  const productUrl = `${baseUrl}/products/${params.slug}`;
  
  // Đảm bảo imageUrl luôn là absolute URL cho Facebook/social sharing
  let imageUrl = product.imageUrl || `${baseUrl}/assets/img/anh2.jpeg`;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
  }

  return {
    title: product.name,
    description: product.shortDescription || product.description,
    alternates: {
      canonical: productUrl
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description || product.name,
      url: productUrl,
      siteName: 'Covasol',
      locale: 'vi_VN',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription || product.description || product.name,
      images: [imageUrl]
    }
  };
}

function buildCtaButtons(product: Awaited<ReturnType<typeof fetchProductDetail>>) {
  if (!product) return null;
  return (
    <div className="yatame-back-button" style={{ borderTop: 'none', marginTop: '24px', paddingTop: 0 }}>
      {product.ctaPrimary?.url ? (
        <a
          href={product.ctaPrimary.url}
          className="btn"
          target="_blank"
          rel="noopener noreferrer"
          id="productPrimaryCta"
          style={{ marginRight: '12px' }}
        >
          {product.ctaPrimary.label || 'Yêu cầu demo'}
        </a>
      ) : (
        <Link href="/#contact" className="btn" id="productPrimaryCta" style={{ marginRight: '12px' }}>
          Liên hệ tư vấn
        </Link>
      )}
      <Link href="/products" className="btn" style={{ background: 'transparent', color: 'var(--primary-green)', border: '1px solid var(--primary-green)' }}>
        <i className="fas fa-arrow-left" aria-hidden="true" /> Quay lại danh sách
      </Link>
    </div>
  );
}

const DEFAULT_IMAGE = '/assets/img/anh2.jpeg';

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await fetchProductDetail(params.slug);
  if (!product) {
    notFound();
  }

  const allProducts = await fetchProductSummaries();
  const relatedProducts = allProducts.filter(item => item.id !== product.id && item.slug !== params.slug).slice(0, 6);

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
    <div className="yatame-detail-page">
      <ProductGalleryHandler demoMedia={demoMedia} galleryMedia={galleryMedia} />
      
      {/* Hero Section */}
      <section className="yatame-detail-hero">
        <div className="container">
          {product.category && (
            <Link href="/products" className="category-badge" data-aos="fade-down">
              {product.category}
            </Link>
          )}
          <h1 data-aos="fade-up">{product.name}</h1>
          <div className="post-meta" data-aos="fade-up" data-aos-delay="100">
            <span className="post-meta-item">
              <i className="fas fa-tag" aria-hidden="true" />
              Mã: {product.code}
            </span>
            <span className="post-meta-item">
              <i className="fas fa-circle-check" aria-hidden="true" />
              Trạng thái: {product.status}
            </span>
            {product.category && (
              <span className="post-meta-item">
                <i className="fas fa-folder" aria-hidden="true" />
                {product.category}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="yatame-detail-content">
        <div className="container">
          <div className="yatame-content-layout">
            {/* Main Content */}
            <main className="yatame-main-content" data-aos="fade-up">
              <div 
                className="article-body" 
                dangerouslySetInnerHTML={{ __html: previewHtml }} 
              />
              {ctaButtons}
            </main>

            {/* Sidebar */}
            <aside className="yatame-sidebar" data-aos="fade-up" data-aos-delay="100">
              {/* Product Info Card */}
              <div className="sidebar-card">
                <h3>Thông tin sản phẩm</h3>
                <ul className="aside-links" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-200)' }}>
                    <strong>Mã:</strong> {product.code}
                  </li>
                  <li style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-200)' }}>
                    <strong>Danh mục:</strong> {product.category}
                  </li>
                  <li style={{ padding: '8px 0' }}>
                    <strong>Trạng thái:</strong> {product.status}
                  </li>
                </ul>
              </div>

              {/* Links Card */}
              <div className="sidebar-card">
                <h3>Tài liệu & Liên kết</h3>
                <ul className="aside-links" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {product.ctaPrimary?.url && (
                    <li style={{ padding: '8px 0' }}>
                      <a href={product.ctaPrimary.url} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt" style={{ marginRight: '8px' }} />
                        {product.ctaPrimary.label || 'Xem demo'}
                      </a>
                    </li>
                  )}
                  {product.ctaSecondary?.url && (
                    <li style={{ padding: '8px 0' }}>
                      <a href={product.ctaSecondary.url} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-download" style={{ marginRight: '8px' }} />
                        {product.ctaSecondary.label || 'Tải brochure'}
                      </a>
                    </li>
                  )}
                  <li style={{ padding: '8px 0' }}>
                    <a href="/#contact">
                      <i className="fas fa-headset" style={{ marginRight: '8px' }} />
                      Liên hệ đội ngũ triển khai
                    </a>
                  </li>
                </ul>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="sidebar-card">
                  <h3>Sản phẩm liên quan</h3>
                  <ul className="sidebar-recent-posts">
                    {relatedProducts.slice(0, 4).map(related => (
                      <li key={related.id || related.slug}>
                        <Link href={`/products/${related.slug}`}>
                          <img 
                            src={related.imageUrl || DEFAULT_IMAGE} 
                            alt={related.name}
                            className="post-thumb"
                            loading="lazy"
                          />
                          <div className="post-info">
                            <h4 className="post-title">{related.name}</h4>
                            <span className="post-date">{related.category}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Card */}
              <div className="sidebar-card sidebar-cta">
                <h3>Nhận tư vấn</h3>
                <p>Để lại thông tin liên hệ, đội ngũ COVASOL sẽ hỗ trợ trong 24 giờ.</p>
                <Link className="btn" href="/#contact">
                  Liên Hệ Ngay
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
