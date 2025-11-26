import Link from 'next/link';
import { fetchProductSummaries } from '@/lib/api/products';

export const metadata = {
  title: 'Danh sách giải pháp'
};

export default async function ProductsPage() {
  const products = await fetchProductSummaries();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-primary">Solutions</p>
        <h1 className="text-3xl font-semibold text-slate-900">Danh mục sản phẩm & dịch vụ</h1>
        <p className="text-base text-slate-500">
          Lộ trình tư vấn, thiết kế, triển khai và vận hành giải pháp công nghệ cho SMEs & Enterprise.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {products.length ? (
          products.map(product => (
            <article key={product.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-brand-primary">{product.category}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{product.name}</h2>
              <p className="mt-3 text-slate-600">{product.summary}</p>
              <div className="mt-auto pt-6">
                <Link href={`/products/${product.id}`} className="text-sm font-semibold text-brand-primary">
                  Chi tiết →
                </Link>
              </div>
            </article>
          ))
        ) : (
          <p className="text-center text-sm text-slate-500">Hiện chưa có sản phẩm nào.</p>
        )}
      </div>
    </section>
  );
}
