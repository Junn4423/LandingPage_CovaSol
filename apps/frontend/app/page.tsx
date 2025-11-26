import Link from 'next/link';
import { fetchBlogSummaries } from '@/lib/api/blog';
import { fetchProductSummaries } from '@/lib/api/products';
import { heroHighlights } from '@/lib/sample-data';

export default async function HomePage() {
  const [products, blogPosts] = await Promise.all([fetchProductSummaries(), fetchBlogSummaries()]);
  const featuredProducts = products.slice(0, 2);
  const featuredPosts = blogPosts.slice(0, 2);

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Core Value · Smart Solutions</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-5xl">
              Đối tác chuyển đổi số đồng hành cùng doanh nghiệp Việt.
            </h1>
            <p className="mt-6 text-lg text-slate-200">
              Tư vấn chiến lược, thiết kế trải nghiệm và triển khai nền tảng số từ giai đoạn ý tưởng đến vận hành.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products" className="rounded-full bg-brand-secondary px-6 py-3 text-slate-900 font-semibold">
                Khám phá giải pháp
              </Link>
              <Link href="/blog" className="rounded-full border border-white/40 px-6 py-3 font-semibold">
                Theo dõi blog
              </Link>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl bg-white/5 p-6 backdrop-blur">
            {heroHighlights.map(item => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-slate-200">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Giải pháp nổi bật</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Sản phẩm đang triển khai</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-brand-primary">
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {featuredProducts.length ? (
            featuredProducts.map(product => (
              <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-brand-primary">{product.category}</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">{product.name}</h3>
                <p className="text-base text-slate-600">{product.headline}</p>
                <p className="mt-4 text-sm text-slate-500">{product.summary}</p>
                <Link href={`/products/${product.id}`} className="mt-6 inline-flex text-sm font-semibold text-brand-primary">
                  Chi tiết giải pháp →
                </Link>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">Đang cập nhật danh sách sản phẩm...</p>
          )}
        </div>
      </section>

      <section id="blog" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Chuyên mục blog</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Insight & câu chuyện triển khai</h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-brand-primary">
              Đọc thêm →
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featuredPosts.length ? (
              featuredPosts.map(post => (
                <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">{post.title}</h3>
                  <p className="mt-3 text-slate-600">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex text-sm font-semibold text-brand-primary">
                    Đọc tiếp →
                  </Link>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">Đang cập nhật bài viết...</p>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-slate-900 px-10 py-12 text-white">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Ready to build</p>
              <h2 className="mt-3 text-3xl font-semibold">Trò chuyện cùng chuyên gia COVASOL</h2>
              <p className="mt-4 text-slate-200">
                Mô tả nhanh thử thách hiện tại của bạn, chúng tôi sẽ đề xuất roadmap 4 tuần để bắt đầu.
              </p>
            </div>
            <div className="space-y-4">
              <a href="mailto:covasol.studio@gmail.com" className="flex items-center justify-between rounded-2xl bg-white/10 px-6 py-4 text-base">
                Email đội ngũ tư vấn <span>→</span>
              </a>
              <a href="https://calendly.com" className="flex items-center justify-between rounded-2xl bg-white/10 px-6 py-4 text-base" target="_blank" rel="noreferrer">
                Đặt lịch discovery call <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
