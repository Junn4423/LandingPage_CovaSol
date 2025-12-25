/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPost, fetchBlogSummaries } from '@/lib/api/blog';
import { renderBlogPreviewHtml } from '@/lib/legacy-preview';

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await fetchBlogSummaries();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await fetchBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Bài viết không tồn tại'
    };
  }

  const baseUrl = 'https://covasol.com.vn';
  const blogUrl = `${baseUrl}/blog/${params.slug}`;
  
  // Đảm bảo imageUrl luôn là absolute URL cho Facebook/social sharing
  let imageUrl = post.heroImage || `${baseUrl}/assets/img/anh1.jpeg`;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: blogUrl
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: blogUrl,
      siteName: 'Covasol',
      locale: 'vi_VN',
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: post.author ? [post.author] : ['COVASOL'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: [imageUrl]
    }
  };
}

function formatDate(value?: string | null) {
  if (!value) return 'Chưa xuất bản';
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return value;
  }
}

const DEFAULT_IMAGE = '/assets/img/anh1.jpeg';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await fetchBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = await fetchBlogSummaries();
  const relatedPosts = allPosts.filter(item => item.id !== post.id).slice(0, 6);
  const previewHtml = renderBlogPreviewHtml(post);

  return (
    <div className="yatame-detail-page">
      {/* Hero Section */}
      <section className="yatame-detail-hero">
        <div className="container">
          {post.category && (
            <Link href="/blog" className="category-badge" data-aos="fade-down">
              {post.category}
            </Link>
          )}
          <h1 data-aos="fade-up">{post.title}</h1>
          <div className="post-meta" data-aos="fade-up" data-aos-delay="100">
            <span className="post-meta-item">
              <i className="far fa-user-circle" aria-hidden="true" />
              {post.author || 'COVASOL'}
            </span>
            <span className="post-meta-item">
              <i className="far fa-calendar-alt" aria-hidden="true" />
              {formatDate(post.publishedAt)}
            </span>
            {post.category && (
              <span className="post-meta-item">
                <i className="fas fa-tag" aria-hidden="true" />
                {post.category}
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
              <div className="yatame-back-button">
                <Link className="btn" href="/blog">
                  <i className="fas fa-arrow-left" aria-hidden="true" /> Quay lại Blog
                </Link>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="yatame-sidebar" data-aos="fade-up" data-aos-delay="100">
              {/* Search */}
              <div className="sidebar-card">
                <div className="sidebar-search">
                  <input type="search" placeholder="Tìm kiếm..." aria-label="Tìm kiếm bài viết" />
                  <button type="button" aria-label="Tìm kiếm">
                    <i className="fas fa-search" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Banner */}
              <Link href="/#services" className="sidebar-card sidebar-banner">
                <img 
                  src="/assets/img/anh2.jpeg" 
                  alt="Dịch vụ COVASOL" 
                  loading="lazy"
                />
              </Link>

              {/* Recent Posts */}
              <div className="sidebar-card">
                <h3>Bài viết gần đây</h3>
                <ul className="sidebar-recent-posts">
                  {relatedPosts.map(related => (
                    <li key={related.id}>
                      <Link href={`/blog/${related.slug}`}>
                        <img 
                          src={related.heroImage || DEFAULT_IMAGE} 
                          alt={related.title}
                          className="post-thumb"
                          loading="lazy"
                        />
                        <div className="post-info">
                          <h4 className="post-title">{related.title}</h4>
                          <span className="post-date">{formatDate(related.publishedAt)}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Card */}
              <div className="sidebar-card sidebar-cta">
                <h3>Kết nối với COVASOL</h3>
                <p>Liên hệ đội ngũ của chúng tôi để được tư vấn giải pháp phù hợp nhất.</p>
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
