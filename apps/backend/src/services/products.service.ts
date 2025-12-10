import type { Product as PrismaProduct } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { ProductDetail, ProductSummary } from '../types/covasol';
import { generateSlug, generateCode } from '../utils/slug';
import { notifySitemapUpdated } from './sitemap.service';

type ProductRecord = PrismaProduct;

export interface ProductUpsertInput {
  name: string;
  category?: string | null;
  shortDescription?: string | null;
  description?: string;
  imageUrl?: string | null;
  featureTags?: string[];
  highlights?: string[];
  ctaPrimary?: { label?: string; url?: string };
  ctaSecondary?: { label?: string; url?: string };
  galleryMedia?: any[];
  videoItems?: any[];
  demoMedia?: any[];
  status?: string;
  slug?: string;
}

const PRODUCT_STATUSES = new Set(['draft', 'active', 'archived']);

function normalizeProductStatus(value?: string) {
  if (!value) return 'active';
  const normalized = value.toLowerCase();
  return PRODUCT_STATUSES.has(normalized) ? normalized : 'active';
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
    status: product.status,
    updatedAt: product.updatedAt?.toISOString()
  };
}

function toDetail(product: ProductRecord): ProductDetail {
  const primaryCta = product.ctaPrimaryLabel || product.ctaPrimaryUrl
    ? { label: product.ctaPrimaryLabel ?? undefined, url: product.ctaPrimaryUrl ?? undefined }
    : undefined;
  const secondaryCta = product.ctaSecondaryLabel || product.ctaSecondaryUrl
    ? { label: product.ctaSecondaryLabel ?? undefined, url: product.ctaSecondaryUrl ?? undefined }
    : undefined;

  return {
    ...toSummary(product),
    description: product.description ?? '',
    featureTags: parseStringArray(product.featureTags),
    highlights: parseStringArray(product.highlights),
    ctaPrimary: primaryCta,
    ctaSecondary: secondaryCta,
    galleryMedia: (product.galleryMedia as any[]) ?? [],
    videoItems: (product.videoItems as any[]) ?? [],
    demoMedia: (product.demoMedia as any[]) ?? []
  };
}

export async function listPublishedProducts(): Promise<ProductSummary[]> {
  const data = await prisma.product.findMany({
    where: { status: { in: ['active', 'ACTIVE'] } },
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
  const slug = generateSlug(input.slug ?? input.name, { entity: 'product' });
  const code = generateCode('PROD');
  const status = normalizeProductStatus(input.status);
  
  const product = await prisma.product.create({
    data: {
      code,
      slug,
      name: input.name,
      category: input.category ?? undefined,
      shortDescription: input.shortDescription ?? undefined,
      description: input.description,
      imageUrl: input.imageUrl,
      featureTags: input.featureTags ? JSON.stringify(input.featureTags) : null,
      highlights: input.highlights ? JSON.stringify(input.highlights) : null,
      ctaPrimaryLabel: input.ctaPrimary?.label,
      ctaPrimaryUrl: input.ctaPrimary?.url,
      ctaSecondaryLabel: input.ctaSecondary?.label,
      ctaSecondaryUrl: input.ctaSecondary?.url,
      galleryMedia: input.galleryMedia ?? [],
      videoItems: input.videoItems ?? [],
      demoMedia: input.demoMedia ?? [],
      status
    }
  });
  if (product.status === 'active') {
    void notifySitemapUpdated('product-create');
  }
  return toDetail(product);
}

export async function updateProduct(id: number | string, input: Partial<ProductUpsertInput>): Promise<ProductDetail> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const slug = input.slug ? generateSlug(input.slug, { entity: 'product' }) : undefined;
  const status = input.status ? normalizeProductStatus(input.status) : undefined;
  
  const product = await prisma.product.update({
    where: { id: numId },
    data: {
      slug,
      name: input.name,
      category: input.category ?? undefined,
      shortDescription: input.shortDescription ?? undefined,
      description: input.description,
      imageUrl: input.imageUrl,
      featureTags: input.featureTags !== undefined ? JSON.stringify(input.featureTags) : undefined,
      highlights: input.highlights !== undefined ? JSON.stringify(input.highlights) : undefined,
      ctaPrimaryLabel: input.ctaPrimary?.label,
      ctaPrimaryUrl: input.ctaPrimary?.url,
      ctaSecondaryLabel: input.ctaSecondary?.label,
      ctaSecondaryUrl: input.ctaSecondary?.url,
      galleryMedia: input.galleryMedia === undefined ? undefined : input.galleryMedia,
      videoItems: input.videoItems === undefined ? undefined : input.videoItems,
      demoMedia: input.demoMedia === undefined ? undefined : input.demoMedia,
      status
    }
  });
  if (product.status === 'active') {
    void notifySitemapUpdated('product-update');
  }
  return toDetail(product);
}

export async function deleteProduct(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  await prisma.product.delete({ where: { id: numId } });
}
