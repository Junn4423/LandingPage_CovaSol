/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPost, fetchBlogSummaries } from '@/lib/api/blog';
import { renderBlogPreviewHtml } from '@/lib/legacy-preview';
import { RichContent } from '@/components/common/rich-content';

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

  return {
    title: post.title,
    description: post.excerpt
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await fetchBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await fetchBlogSummaries()).filter(item => item.id !== post.id).slice(0, 4);
  const previewHtml = renderBlogPreviewHtml(post);

  return (
    <div className="article-page detail-preview">
      <section className="article-preview-section">
        <div className="container">
          <div className="article-layout">
            <div className="article-main" data-aos="fade-up">
              <div className="preview-content preview-surface" id="articlePreview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              <div className="article-back">
                <Link className="btn btn-outline" href="/blog">
                  <i className="fas fa-arrow-left" aria-hidden="true" /> Quay lại Blog
                </Link>
              </div>
            </div>

            <aside className="article-side" data-aos="fade-up">
              <div className="aside-card">
                <h3>Bài viết gần đây</h3>
                <ul className="aside-list" id="relatedPosts">
                  {relatedPosts.map(related => (
                    <li key={related.id}>
                      <Link href={`/blog/${related.slug}`} className="recent-post-link">
                        <div className="recent-post-body">
                          <span className="recent-post-title">{related.title}</span>
                          <span className="recent-post-date">{formatDate(related.publishedAt)}</span>
                        </div>
                        <i className="fas fa-arrow-right" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="aside-card highlight">
                <h3>Kết nối với COVASOL</h3>
                <p>Liên hệ đội ngũ của chúng tôi để được tư vấn giải pháp phù hợp nhất.</p>
                <Link className="btn btn-primary" href="/#contact">
                  Liên Hệ
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
