import { notFound } from 'next/navigation';
import { fetchProductDetail, fetchProductSummaries } from '@/lib/api/products';

interface ProductPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const products = await fetchProductSummaries();
  return products.map(product => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = params;
  const product = await fetchProductDetail(id);

  if (!product) {
    return {
      title: 'Giải pháp không tồn tại'
    };
  }

  return {
    title: product.name,
    description: product.summary
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = params;
  const product = await fetchProductDetail(id);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.4em] text-brand-primary">Solution</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">{product.name}</h1>
      <p className="mt-4 text-lg text-slate-600">{product.summary}</p>
      <p className="mt-6 text-base text-slate-600">{product.description}</p>

      {product.metrics?.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {product.metrics.map(metric => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {product.features?.length ? (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Tính năng nổi bật</h2>
          <ul className="mt-4 space-y-3">
            {product.features.map(feature => (
              <li key={feature} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <span className="mt-2 inline-flex h-2 w-2 rounded-full bg-brand-primary" />
                <span className="text-base text-slate-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-12 rounded-3xl bg-slate-900 p-8 text-white">
        <h2 className="text-2xl font-semibold">Khởi động {product.name}</h2>
        <p className="mt-3 text-slate-200">Đặt lịch workshop 90 phút cùng đội ngũ tư vấn và kiến trúc sư giải pháp.</p>
        <a href="mailto:covasol.studio@gmail.com" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-slate-900">
          Liên hệ ngay
        </a>
      </div>
    </section>
  );
}
