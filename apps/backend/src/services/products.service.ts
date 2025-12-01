import type { Product as PrismaProduct } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { ProductDetail, ProductSummary } from '@covasol/types';
import { generateSlug, generateCode } from '../utils/slug';

type ProductRecord = PrismaProduct;

export interface ProductUpsertInput {
  name: string;
  category?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string | null;
  featureTags?: string[];
  highlights?: string[];
  ctaPrimaryLabel?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
  status?: string;
  slug?: string;
}

function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function toSummary(product: ProductRecord): ProductSummary {
  return {
    id: String(product.id),
    code: product.code,
    slug: product.slug,
    name: product.name,
    category: product.category ?? '',
    shortDescription: product.shortDescription ?? '',
    imageUrl: product.imageUrl ?? undefined,
    status: product.status
  };
}

function toDetail(product: ProductRecord): ProductDetail {
  return {
    ...toSummary(product),
    description: product.description ?? '',
    featureTags: parseStringArray(product.featureTags),
    highlights: parseStringArray(product.highlights),
    ctaPrimaryLabel: product.ctaPrimaryLabel ?? undefined,
    ctaPrimaryUrl: product.ctaPrimaryUrl ?? undefined,
    ctaSecondaryLabel: product.ctaSecondaryLabel ?? undefined,
    ctaSecondaryUrl: product.ctaSecondaryUrl ?? undefined,
    galleryMedia: product.galleryMedia as any[] ?? [],
    videoItems: product.videoItems as any[] ?? [],
    demoMedia: product.demoMedia as any[] ?? []
  };
}

export async function listPublishedProducts(): Promise<ProductSummary[]> {
  const data = await prisma.product.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' }
  });
  return data.map(toSummary);
}

export async function listAllProducts(): Promise<ProductDetail[]> {
  const data = await prisma.product.findMany({ orderBy: { updatedAt: 'desc' } });
  return data.map(toDetail);
}

export async function getProductBySlugOrId(identifier: string): Promise<ProductDetail | null> {
  const numId = parseInt(identifier, 10);
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: identifier },
        { code: identifier },
        ...(isNaN(numId) ? [] : [{ id: numId }])
      ]
    }
  });
  if (!product || product.status !== 'active') {
    return null;
  }
  return toDetail(product);
}

export async function getProductById(id: number | string): Promise<ProductDetail | null> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const product = await prisma.product.findUnique({ where: { id: numId } });
  return product ? toDetail(product) : null;
}

export async function createProduct(input: ProductUpsertInput): Promise<ProductDetail> {
  const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.name);
  const code = generateCode('PROD');
  
  const product = await prisma.product.create({
    data: {
      code,
      slug,
      name: input.name,
      category: input.category,
      shortDescription: input.shortDescription,
      description: input.description,
      imageUrl: input.imageUrl,
      featureTags: input.featureTags ? JSON.stringify(input.featureTags) : null,
      highlights: input.highlights ? JSON.stringify(input.highlights) : null,
      ctaPrimaryLabel: input.ctaPrimaryLabel,
      ctaPrimaryUrl: input.ctaPrimaryUrl,
      ctaSecondaryLabel: input.ctaSecondaryLabel,
      ctaSecondaryUrl: input.ctaSecondaryUrl,
      status: input.status ?? 'active'
    }
  });
  return toDetail(product);
}

export async function updateProduct(id: number | string, input: Partial<ProductUpsertInput>): Promise<ProductDetail> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const slug = input.slug ? generateSlug(input.slug) : undefined;
  
  const product = await prisma.product.update({
    where: { id: numId },
    data: {
      slug,
      name: input.name,
      category: input.category,
      shortDescription: input.shortDescription,
      description: input.description,
      imageUrl: input.imageUrl,
      featureTags: input.featureTags ? JSON.stringify(input.featureTags) : undefined,
      highlights: input.highlights ? JSON.stringify(input.highlights) : undefined,
      ctaPrimaryLabel: input.ctaPrimaryLabel,
      ctaPrimaryUrl: input.ctaPrimaryUrl,
      ctaSecondaryLabel: input.ctaSecondaryLabel,
      ctaSecondaryUrl: input.ctaSecondaryUrl,
      status: input.status
    }
  });
  return toDetail(product);
}

export async function deleteProduct(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  await prisma.product.delete({ where: { id: numId } });
}
