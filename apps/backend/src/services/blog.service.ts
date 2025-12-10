import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { BlogPostDetail, BlogPostSummary } from '../types/covasol';
import { generateSlug, generateCode } from '../utils/slug';
import { notifySitemapUpdated } from './sitemap.service';

type BlogWithAuthor = Prisma.BlogPostGetPayload<{ include: { author: true } }>;

export interface BlogUpsertInput {
  id?: number;
  title: string;
  subtitle?: string | null;
  excerpt?: string;
  content: string;
  tags?: string[];
  keywords?: string[];
  imageUrl?: string | null;
  category?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
  authorAvatar?: string | null;
  status?: string;
  publishedAt?: Date | string | null;
  authorId?: number;
  slug?: string;
  isFeatured?: boolean;
  galleryMedia?: Prisma.InputJsonValue | null;
  videoItems?: Prisma.InputJsonValue | null;
  sourceLinks?: Prisma.InputJsonValue | null;
}

const BLOG_STATUSES = new Set(['draft', 'published', 'archived']);

function normalizeBlogStatus(value?: string) {
  if (!value) return 'draft';
  const normalized = value.toLowerCase();
  return BLOG_STATUSES.has(normalized) ? normalized : 'draft';
}

async function resetFeaturedFlag(excludeId?: number) {
  await prisma.blogPost.updateMany({
    data: { isFeatured: 0 },
    where: excludeId
      ? {
          isFeatured: 1,
          NOT: { id: excludeId }
        }
      : { isFeatured: 1 }
  });
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

function toSummary(post: BlogWithAuthor): BlogPostSummary {
  return {
    id: String(post.id),
    code: post.code,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle ?? undefined,
    excerpt: post.excerpt ?? '',
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: post.authorName || post.author?.displayName || 'COVASOL Team',
    authorName: post.authorName ?? post.author?.displayName ?? undefined,
    authorAvatar: post.authorAvatar ?? post.author?.avatar ?? undefined,
    authorId: post.authorId ?? null,
    status: post.status,
    heroImage: post.imageUrl ?? null,
    category: post.category ?? undefined,
    isFeatured: post.isFeatured === 1,
    updatedAt: post.updatedAt?.toISOString()
  };
}

function toDetail(post: BlogWithAuthor): BlogPostDetail {
  return {
    ...toSummary(post),
    content: post.content,
    tags: parseStringArray(post.tags),
    keywords: parseStringArray(post.keywords),
    authorRole: post.authorRole ?? undefined,
    galleryMedia: (post.galleryMedia as any[]) ?? [],
    videoItems: (post.videoItems as any[]) ?? [],
    sourceLinks: (post.sourceLinks as any[]) ?? []
  };
}

export async function listPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: { in: ['published', 'PUBLISHED'] } },
    include: { author: true },
    orderBy: { publishedAt: 'desc' }
  });
  return posts.map(toSummary);
}

export async function listAllBlogPosts(): Promise<BlogPostDetail[]> {
  const posts = await prisma.blogPost.findMany({
    include: { author: true },
    orderBy: { updatedAt: 'desc' }
  });
  return posts.map(toDetail);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: true }
  });
  if (!post || post.status !== 'published') {
    return null;
  }
  return toDetail(post);
}

export async function getBlogPostById(id: number | string): Promise<BlogPostDetail | null> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const post = await prisma.blogPost.findUnique({ where: { id: numId }, include: { author: true } });
  return post ? toDetail(post) : null;
}

export async function createBlogPost(input: BlogUpsertInput): Promise<BlogPostDetail> {
  const slug = generateSlug(input.slug ?? input.title, { entity: 'blog' });
  const code = generateCode('BLOG');
  const status = normalizeBlogStatus(input.status);
  const publishedAt = input.publishedAt === null
    ? new Date()
    : input.publishedAt
    ? new Date(input.publishedAt)
    : new Date();
  
  const post = await prisma.blogPost.create({
    data: {
      code,
      slug,
      title: input.title,
      subtitle: input.subtitle ?? undefined,
      excerpt: input.excerpt ?? '',
      content: input.content,
      tags: input.tags ? JSON.stringify(input.tags) : null,
      keywords: input.keywords ? JSON.stringify(input.keywords) : null,
      imageUrl: input.imageUrl ?? null,
      category: input.category ?? undefined,
      authorName: input.authorName ?? undefined,
      authorRole: input.authorRole ?? undefined,
      authorAvatar: input.authorAvatar ?? undefined,
      status,
      publishedAt,
      authorId: input.authorId,
      galleryMedia: input.galleryMedia ?? Prisma.JsonNull,
      videoItems: input.videoItems ?? Prisma.JsonNull,
      sourceLinks: input.sourceLinks ?? Prisma.JsonNull,
      isFeatured: input.isFeatured ? 1 : 0
    },
    include: { author: true }
  });

  if (input.isFeatured) {
    await resetFeaturedFlag(post.id);
  }

  if (post.status === 'published') {
    void notifySitemapUpdated('blog-create');
  }
  return toDetail(post);
}

export async function updateBlogPost(id: number | string, input: Partial<BlogUpsertInput>): Promise<BlogPostDetail> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const slug = input.slug ? generateSlug(input.slug, { entity: 'blog' }) : undefined;
  const status = input.status ? normalizeBlogStatus(input.status) : undefined;
  const publishedAt = input.publishedAt === null
    ? undefined
    : input.publishedAt
    ? new Date(input.publishedAt)
    : undefined;
  
  const post = await prisma.blogPost.update({
    where: { id: numId },
    data: {
      slug,
      title: input.title,
      subtitle: input.subtitle ?? undefined,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags !== undefined ? JSON.stringify(input.tags) : undefined,
      keywords: input.keywords !== undefined ? JSON.stringify(input.keywords) : undefined,
      imageUrl: input.imageUrl ?? undefined,
      category: input.category ?? undefined,
      authorName: input.authorName ?? undefined,
      authorRole: input.authorRole ?? undefined,
      authorAvatar: input.authorAvatar ?? undefined,
      status,
      publishedAt,
      galleryMedia: input.galleryMedia === undefined ? undefined : input.galleryMedia ?? Prisma.JsonNull,
      videoItems: input.videoItems === undefined ? undefined : input.videoItems ?? Prisma.JsonNull,
      sourceLinks: input.sourceLinks === undefined ? undefined : input.sourceLinks ?? Prisma.JsonNull,
      isFeatured: input.isFeatured !== undefined ? (input.isFeatured ? 1 : 0) : undefined
    },
    include: { author: true }
  });

  if (input.isFeatured) {
    await resetFeaturedFlag(post.id);
  }

  if (post.status === 'published') {
    void notifySitemapUpdated('blog-update');
  }
  return toDetail(post);
}

export async function deleteBlogPost(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  await prisma.blogPost.delete({ where: { id: numId } });
}
