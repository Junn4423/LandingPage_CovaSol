import { prisma } from '../db/prisma';

export interface CustomerReviewSummary {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  quote: string;
  bgColor: string;
  createdAt: string;
}

export interface CustomerReviewDetail extends CustomerReviewSummary {
  status: string;
  isFeatured: boolean;
  updatedAt: string;
}

export interface ReviewUpsertInput {
  id?: number;
  name: string;
  role: string;
  company?: string;
  rating?: number;
  quote: string;
  bgColor?: string;
  status?: string;
  isFeatured?: boolean;
}

// Danh sách màu nền cho avatar (cơ chế như Google)
const AVATAR_COLORS = [
  '#F44336', // Red
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

// Tạo màu ngẫu nhiên cho avatar
export function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Lấy chữ cái đầu của tên (để hiển thị trong avatar)
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  // Lấy chữ cái đầu của từ cuối cùng (tên trong tiếng Việt)
  return words[words.length - 1].charAt(0).toUpperCase();
}

function toSummary(review: any): CustomerReviewSummary {
  return {
    id: String(review.id),
    name: review.name,
    role: review.role,
    company: review.company ?? undefined,
    rating: review.rating,
    quote: review.quote,
    bgColor: review.bgColor,
    createdAt: review.createdAt.toISOString(),
  };
}

function toDetail(review: any): CustomerReviewDetail {
  return {
    ...toSummary(review),
    status: review.status,
    isFeatured: review.isFeatured === 1,
    updatedAt: review.updatedAt.toISOString(),
  };
}

// Lấy danh sách reviews đã published
export async function listPublishedReviews(): Promise<CustomerReviewSummary[]> {
  const reviews = await prisma.customerReview.findMany({
    where: { status: 'published' },
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' }
    ],
  });
  return reviews.map(toSummary);
}

// Lấy tất cả reviews (cho admin)
export async function listAllReviews(): Promise<CustomerReviewDetail[]> {
  const reviews = await prisma.customerReview.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return reviews.map(toDetail);
}

// Lấy review theo ID
export async function getReviewById(id: number | string): Promise<CustomerReviewDetail | null> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) return null;

  const review = await prisma.customerReview.findUnique({
    where: { id: numericId },
  });

  if (!review) return null;
  return toDetail(review);
}

// Tạo mới hoặc cập nhật review
export async function upsertReview(input: ReviewUpsertInput): Promise<CustomerReviewDetail> {
  const bgColor = input.bgColor || getRandomAvatarColor();

  if (input.id) {
    const updated = await prisma.customerReview.update({
      where: { id: input.id },
      data: {
        name: input.name,
        role: input.role,
        company: input.company ?? null,
        rating: input.rating ?? 5,
        quote: input.quote,
        bgColor,
        status: input.status ?? 'published',
        isFeatured: input.isFeatured ? 1 : 0,
      },
    });
    return toDetail(updated);
  }

  const created = await prisma.customerReview.create({
    data: {
      name: input.name,
      role: input.role,
      company: input.company ?? null,
      rating: input.rating ?? 5,
      quote: input.quote,
      bgColor,
      status: input.status ?? 'published',
      isFeatured: input.isFeatured ? 1 : 0,
    },
  });
  return toDetail(created);
}

// Xóa review
export async function deleteReview(id: number | string): Promise<boolean> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) return false;

  try {
    await prisma.customerReview.delete({
      where: { id: numericId },
    });
    return true;
  } catch {
    return false;
  }
}

// Lấy thống kê đánh giá
export async function getReviewsStats(): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: { label: string; count: number; percent: number }[];
}> {
  const reviews = await prisma.customerReview.findMany({
    where: { status: 'published' },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingBreakdown: [
        { label: '5 sao', count: 0, percent: 0 },
        { label: '4 sao', count: 0, percent: 0 },
        { label: '3 sao', count: 0, percent: 0 },
      ],
    };
  }

  const averageRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews;

  // Đếm số lượng theo rating
  const fiveStars = reviews.filter((r: { rating: number }) => r.rating >= 4.5).length;
  const fourStars = reviews.filter((r: { rating: number }) => r.rating >= 3.5 && r.rating < 4.5).length;
  const threeStars = reviews.filter((r: { rating: number }) => r.rating < 3.5).length;

  const ratingBreakdown = [
    { label: '5 sao', count: fiveStars, percent: Math.round((fiveStars / totalReviews) * 100) },
    { label: '4 sao', count: fourStars, percent: Math.round((fourStars / totalReviews) * 100) },
    { label: '3 sao', count: threeStars, percent: Math.round((threeStars / totalReviews) * 100) },
  ];

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingBreakdown,
  };
}
