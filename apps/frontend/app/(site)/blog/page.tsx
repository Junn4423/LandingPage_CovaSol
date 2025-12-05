/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { LegacyBlogGrid } from '@/components/blog/legacy-blog-grid';
import { LegacyBlogNewsletter } from '@/components/blog/legacy-blog-newsletter';
import { fetchBlogSummaries } from '@/lib/api/blog';

export const metadata = {
  title: 'Blog | COVASOL',
  description: 'Chia sẻ kiến thức, xu hướng và insights về phát triển phần mềm, AI, chuyển đổi số'
};

function getFeaturedPost(posts: Awaited<ReturnType<typeof fetchBlogSummaries>>) {
  if (!posts.length) {
    return { featuredPost: null, rest: [] as typeof posts };
  }
  const featured = posts.find(post => post.isFeatured) ?? posts[0];
  const rest = posts.filter(post => post.id !== featured.id);
  return { featuredPost: featured, rest };
}

function getHeroMedia(postImage?: string | null) {
  if (postImage) return postImage;
  return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80';
}

export default async function BlogListingPage() {
  const posts = await fetchBlogSummaries();
  const { featuredPost, rest } = getFeaturedPost(posts);

  return (
    <div className="legacy-blog-page">
      <section className="page-hero blog-hero">
        <div className="hero-media" aria-hidden="true">
          <video autoPlay muted loop playsInline preload="metadata">
            <source src="/assets/video/Hero_section_Landing_page_3D_animation.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
          <div className="hero-media-overlay" />
        </div>
        <div className="hero-container">
          <div className="hero-content" data-aos="fade-up">
            <p className="page-kicker" data-key="blog-kicker">
              Blog · Insight · Case Study
            </p>
            <h1 className="page-title" data-key="blog-title">
              Blog COVASOL
            </h1>
            <p className="page-description" data-key="blog-description">
              Chia sẻ kiến thức, xu hướng công nghệ và insights từ đội ngũ chuyên gia COVASOL. Cập nhật những thông tin mới nhất về phát
              triển phần mềm, AI, và chuyển đổi số.
            </p>
          </div>
        </div>
      </section>

      <section className="featured-post" id="featuredPostSection">
        <div className="container">
          {featuredPost ? (
            <div className="featured-content" data-aos="fade-up">
              <div className="featured-image">
                <img src={getHeroMedia(featuredPost.heroImage)} alt={featuredPost.title} />
                <div className="featured-badge" data-key="featured">
                  Nổi bật
                </div>
              </div>
              <div className="featured-text">
                <div className="post-meta">
                  <span className="post-category" id="featuredPostCategory">
                    {featuredPost.category || 'Insight' }
                  </span>
                  <span className="post-date" id="featuredPostDate">
                    {featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
                  </span>
                </div>
                <h2 id="featuredPostTitle">{featuredPost.title}</h2>
                <p id="featuredPostExcerpt">{featuredPost.excerpt}</p>
                <div className="post-author">
                  <img src="/assets/img/anh2.jpeg" alt={featuredPost.author} className="author-avatar" />
                  <div className="author-info">
                    <span className="author-name" id="featuredPostAuthor">
                      {featuredPost.author}
                    </span>
                    <span className="author-title" data-key="tech-lead" id="featuredPostAuthorRole">
                      Chuyên gia triển khai
                    </span>
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.slug}`} className="btn btn-primary" id="featuredPostButton">
                  Đọc toàn bộ
                </Link>
              </div>
            </div>
          ) : (
            <div className="featured-empty" data-aos="fade-up">
              <p>Hiện chưa có bài viết nổi bật.</p>
            </div>
          )}
        </div>
      </section>

      <LegacyBlogGrid posts={rest} />
      <LegacyBlogNewsletter />
    </div>
  );
}
