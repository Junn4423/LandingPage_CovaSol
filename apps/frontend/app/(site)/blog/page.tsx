/* eslint-disable @next/next/no-img-element */
import { YatameBlogGrid } from '@/components/blog/yatame-blog-grid';
import { fetchBlogSummaries } from '@/lib/api/blog';

export const metadata = {
  title: 'Blog | COVASOL',
  description: 'Chia sẻ kiến thức, xu hướng và insights về phát triển phần mềm, AI, chuyển đổi số'
};

export default async function BlogListingPage() {
  const rawPosts = await fetchBlogSummaries();
  // Serialize to ensure data is safely passable to client component
  const posts = JSON.parse(JSON.stringify(rawPosts));

  return (
    <div className="yatame-blog-page">
      {/* Hero Section */}
      <section className="yatame-blog-hero">
        <div className="container">
          <h1 data-aos="fade-up">Blog COVASOL</h1>
          <p data-aos="fade-up" data-aos-delay="100">
            Chia sẻ kiến thức, xu hướng công nghệ và insights từ đội ngũ chuyên gia COVASOL. 
            Cập nhật những thông tin mới nhất về phát triển phần mềm, AI, và chuyển đổi số.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <YatameBlogGrid posts={posts} />
    </div>
  );
}
