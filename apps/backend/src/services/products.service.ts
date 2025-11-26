import type { Product as PrismaProduct } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { ProductDetail, ProductSummary } from '@/types/content';
import { generateSlug } from '../utils/slug';

type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type ProductRecord = PrismaProduct;

export interface ProductUpsertInput {
  name: string;
  headline: string;
  summary: string;
  description: string;
  category: string;
  thumbnail?: string | null;
  features?: string[];
  metrics?: Array<{ label: string; value: string }>;
  status?: ProductStatus;
  publishedAt?: Date | string | null;
  slug?: string;
}

function parseMetrics(value: unknown): Array<{ label: string; value: string }> | undefined {
  if (!value || !Array.isArray(value)) {
    return undefined;
  }
  return value.filter(item => typeof item === 'object' && item !== null && 'label' in item && 'value' in item) as Array<{
    label: string;
    value: string;
  }>;
}

function parseStringArray(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function toSummary(product: ProductRecord): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    headline: product.headline,
    summary: product.summary,
    category: product.category,
    thumbnail: product.thumbnail ?? undefined,
    status: product.status,
    publishedAt: product.publishedAt?.toISOString() ?? null
  };
}

function toDetail(product: ProductRecord): ProductDetail {
  return {
    ...toSummary(product),
    description: product.description,
    features: parseStringArray(product.features ?? []),
    metrics: parseMetrics(product.metrics ?? [])
  };
}

export async function listPublishedProducts(): Promise<ProductSummary[]> {
  const data = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' }
  });
  return data.map(toSummary);
}

export async function listAllProducts(): Promise<ProductDetail[]> {
  const data = await prisma.product.findMany({ orderBy: { updatedAt: 'desc' } });
  return data.map(toDetail);
}

export async function getProductBySlugOrId(identifier: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }]
    }
  });
  if (!product || product.status !== 'PUBLISHED') {
    return null;
  }
  return toDetail(product);
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  return product ? toDetail(product) : null;
}

export async function createProduct(input: ProductUpsertInput): Promise<ProductDetail> {
  const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.name);
  const product = await prisma.product.create({
    data: {
      slug,
      name: input.name,
      headline: input.headline,
      summary: input.summary,
      description: input.description,
      category: input.category,
      thumbnail: input.thumbnail,
      features: input.features ?? [],
      metrics: input.metrics ?? [],
      status: input.status ?? 'DRAFT',
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null
    }
  });
  return toDetail(product);
}

export async function updateProduct(id: string, input: Partial<ProductUpsertInput>): Promise<ProductDetail> {
  const slug = input.slug ? generateSlug(input.slug) : undefined;
  const product = await prisma.product.update({
    where: { id },
    data: {
      slug,
      name: input.name,
      headline: input.headline,
      summary: input.summary,
      description: input.description,
      category: input.category,
      thumbnail: input.thumbnail,
      features: input.features,
      metrics: input.metrics,
      status: input.status,
      publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null
    }
  });
  return toDetail(product);
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}
