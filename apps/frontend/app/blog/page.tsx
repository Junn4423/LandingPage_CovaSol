import Link from 'next/link';
import { fetchBlogSummaries } from '@/lib/api/blog';

export const metadata = {
  title: 'Blog & Insight'
};

export default async function BlogListingPage() {
  const posts = await fetchBlogSummaries();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-primary">Blog</p>
        <h1 className="text-3xl font-semibold text-slate-900">Insight từ dự án thực tế</h1>
        <p className="text-base text-slate-500">Case study, best-practice và chia sẻ từ đội ngũ tư vấn.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.length ? (
          posts.map(post => (
            <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{post.title}</h2>
              <p className="mt-3 text-slate-600">{post.excerpt}</p>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-brand-primary">
                <Link href={`/blog/${post.slug}`}>Đọc tiếp →</Link>
                <span className="text-slate-400">{post.author}</span>
              </div>
            </article>
          ))
        ) : (
          <p className="text-center text-sm text-slate-500">Hiện chưa có bài viết nào.</p>
        )}
      </div>
    </section>
  );
}
