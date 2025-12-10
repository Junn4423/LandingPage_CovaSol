import type { Metadata } from 'next';

import { ProductsHero, ProductsGrid, ProductsCta } from '@/components/legacy/products';
import type { LegacyProductCard } from '@/components/legacy/products';
import { fetchProductSummaries } from '@/lib/api/products';
import type { ProductSummary } from '@/types/content';

export const metadata: Metadata = {
  title: 'Sản phẩm | COVASOL',
  description: 'Khám phá danh mục sản phẩm thông minh và giải pháp SaaS do COVASOL phát triển.'
};

const HERO_VIDEO = '/assets/video/Hero_section_Landing_page_3D_animation.webm';
const EMPTY_MESSAGE = 'Chưa có sản phẩm nào được công bố.';

const HERO_COPY = {
  title: 'Sản phẩm của COVASOL',
  description:
    'Khám phá các nền tảng SaaS, AI Assistant và workflow engine được xây dựng cho doanh nghiệp Việt Nam. Mỗi sản phẩm đều sẵn sàng tinh chỉnh theo nhu cầu thực tế.'
};

const GRID_COPY = {
  title: 'Bộ sưu tập sản phẩm',
  subtitle: 'Các giải pháp được thiết kế để tối ưu quy trình làm việc và trải nghiệm khách hàng.'
};

const CTA_COPY = {
  title: 'Sẵn sàng trải nghiệm sản phẩm của chúng tôi?',
  description: 'Liên hệ với đội ngũ COVASOL để được tư vấn chi tiết về sản phẩm phù hợp với nhu cầu của bạn.'
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80'
];

const FALLBACK_PRODUCTS: LegacyProductCard[] = [
  {
    id: 'covaflow',
    name: 'CovaFlow',
    category: 'Workflow Management',
    description:
      'Nền tảng quản lý quy trình thông minh với AI tích hợp. Tự động hóa task, theo dõi tiến độ và tối ưu hiệu suất đội nhóm.',
    imageUrl: FALLBACK_IMAGES[0],
    tags: ['AI-Powered', 'Real-time', 'Cloud'],
    featured: true,
    badge: { label: 'Nổi bật' },
    primaryCta: { label: 'Chi tiết', href: '/products/covaflow' },
    secondaryCta: { label: 'Liên hệ tư vấn', href: '/#contact' }
  },
  {
    id: 'covacrm',
    name: 'CovaCRM',
    category: 'Customer Management',
    description: 'CRM thông minh tích hợp chatbot AI và analytics giúp đội ngũ sales làm việc hiệu quả hơn.',
    imageUrl: FALLBACK_IMAGES[1],
    tags: ['Chatbot', 'Analytics'],
    primaryCta: { label: 'Xem demo', href: '/#contact' },
    secondaryCta: { label: 'Tìm hiểu thêm', href: '/products/covacrm' }
  },
  {
    id: 'covaai',
    name: 'CovaAI Assistant',
    category: 'AI Assistant',
    description: 'Trợ lý AI hỗ trợ viết nội dung, phân tích dữ liệu và tự động hóa công việc hằng ngày.',
    imageUrl: FALLBACK_IMAGES[2],
    tags: ['Content Gen', 'Data Analysis'],
    badge: { label: 'Mới', variant: 'new' },
    primaryCta: { label: 'Dùng thử Beta', href: '/#contact' },
    secondaryCta: { label: 'Xem chi tiết', href: '/products/covaai-assistant' }
  },
  {
    id: 'covasync',
    name: 'CovaSync',
    category: 'Integration Platform',
    description: 'Nền tảng tích hợp dữ liệu giữa các ứng dụng để hệ sinh thái công nghệ của bạn luôn đồng bộ.',
    imageUrl: FALLBACK_IMAGES[3],
    tags: ['Integration', 'Sync'],
    primaryCta: { label: 'Đặt lịch tư vấn', href: '/#contact' },
    secondaryCta: { label: 'Tìm hiểu thêm', href: '/products/covasync' }
  },
  {
    id: 'covaanalytics',
    name: 'CovaAnalytics',
    category: 'Business Intelligence',
    description: 'Dashboard trực quan, báo cáo realtime và dự đoán bằng AI cho đội ngũ điều hành.',
    imageUrl: FALLBACK_IMAGES[4],
    tags: ['Business Intelligence', 'Predictive AI'],
    primaryCta: { label: 'Xem demo', href: '/#contact' },
    secondaryCta: { label: 'Tìm hiểu thêm', href: '/products/covaanalytics' }
  }
];

export default async function ProductsPage() {
  const summaries = await fetchProductSummaries();
  const products = mapSummariesToCards(summaries);
  const items = products.length ? products : FALLBACK_PRODUCTS;

  return (
    <div className="products-page legacy-products">
      <ProductsHero
        videoSrc={HERO_VIDEO}
        title={HERO_COPY.title}
        description={HERO_COPY.description}
        titleKey="products-title"
        descriptionKey="products-description"
      />

      <ProductsGrid
        title={GRID_COPY.title}
        subtitle={GRID_COPY.subtitle}
        titleKey="products-grid-title"
        subtitleKey="products-grid-subtitle"
        items={items}
        emptyMessage={EMPTY_MESSAGE}
      />

      <ProductsCta
        title={CTA_COPY.title}
        description={CTA_COPY.description}
        titleKey="cta-title"
        descriptionKey="cta-description"
        primaryCta={{ label: 'Liên hệ ngay', href: '/#contact', key: 'contact-now' }}
        secondaryCta={{ label: 'Đặt lịch demo', href: '/#contact', key: 'schedule-demo' }}
      />
    </div>
  );
}

function mapSummariesToCards(products: ProductSummary[]): LegacyProductCard[] {
  if (!products.length) {
    return [];
  }

  return products.map((product, index) => {
    const placeholder = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    const fallbackId = product.id ?? product.slug ?? `product-${index}`;
    const detailHref = product.slug ? `/products/${product.slug}` : `/products/${fallbackId}`;
    const isNew = product.status?.toLowerCase?.() === 'new';

    return {
      id: fallbackId,
      name: product.name,
      category: product.category || 'Giải pháp công nghệ',
      description: product.shortDescription || 'Đang cập nhật mô tả chi tiết.',
      imageUrl: product.imageUrl || placeholder,
      tags: createTags(product),
      featured: index === 0,
      badge: isNew ? { label: 'Mới', variant: 'new' } : index === 0 ? { label: 'Nổi bật' } : undefined,
      primaryCta: { label: 'Chi tiết', href: detailHref },
      secondaryCta: { label: 'Đặt lịch demo', href: '/#contact' }
    } satisfies LegacyProductCard;
  });
}

function createTags(product: ProductSummary) {
  const tags: string[] = [];
  if (product.category) {
    tags.push(product.category);
  }
  if (product.code) {
    tags.push(product.code);
  }
  if (product.status) {
    tags.push(product.status);
  }
  return tags.slice(0, 3);
}
