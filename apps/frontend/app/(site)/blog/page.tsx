/* eslint-disable @next/next/no-img-element */
import { YatameBlogGrid } from '@/components/blog/yatame-blog-grid';
import { fetchBlogSummaries, searchBlogPosts } from '@/lib/api/blog';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { BlogSearchForm } from '@/components/blog/blog-search-form';

export const metadata = {
  title: 'Blog | COVASOL',
  description: 'Chia sẻ kiến thức, xu hướng và insights về phát triển phần mềm, AI, chuyển đổi số'
};

interface BlogPageProps {
  searchParams: { q?: string; category?: string; tag?: string };
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const query = searchParams.q;
  const category = searchParams.category;
  const tag = searchParams.tag;
  
  let rawPosts = await fetchBlogSummaries();
  
  // Filter by search query if provided
  if (query && query.trim().length >= 2) {
    rawPosts = await searchBlogPosts(query.trim());
  }
  
  // Filter by category if provided
  if (category) {
    rawPosts = rawPosts.filter(post => post.category === category);
  }
  
  // Filter by tag if provided
  if (tag) {
    rawPosts = rawPosts.filter(post => {
      const postTags = (post as any).tags || [];
      return postTags.includes(tag);
    });
  }
  
  // Serialize to ensure data is safely passable to client component
  const posts = JSON.parse(JSON.stringify(rawPosts));
  
  // Build page title based on filters
  let pageTitle = 'Blog COVASOL';
  let pageSubtitle = 'Chia sẻ kiến thức, xu hướng công nghệ và insights từ đội ngũ chuyên gia COVASOL.';
  
  if (query) {
    pageTitle = `Kết quả tìm kiếm: "${query}"`;
    pageSubtitle = `Tìm thấy ${posts.length} bài viết`;
  } else if (category) {
    pageTitle = `Danh mục: ${category}`;
    pageSubtitle = `${posts.length} bài viết trong danh mục này`;
  } else if (tag) {
    pageTitle = `Tag: ${tag}`;
    pageSubtitle = `${posts.length} bài viết với tag này`;
  }

  return (
    <div className="yatame-blog-page">
      {/* Hero Section */}
      <section className="yatame-blog-hero">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Blog' }
            ]}
          />
          <h1 data-aos="fade-up">{pageTitle}</h1>
          <p data-aos="fade-up" data-aos-delay="100">
            {pageSubtitle}
          </p>
          
          {/* Search Form */}
          <BlogSearchForm defaultQuery={query} />
          
          {/* Filter Tags */}
          {(query || category || tag) && (
            <div className="active-filters" data-aos="fade-up" data-aos-delay="300">
              <a href="/blog" className="clear-filter" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                textDecoration: 'none',
                marginTop: '16px'
              }}>
                <i className="fas fa-times" aria-hidden="true" />
                Xóa bộ lọc
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Blog Grid */}
      <YatameBlogGrid posts={posts} />
    </div>
  );
}
