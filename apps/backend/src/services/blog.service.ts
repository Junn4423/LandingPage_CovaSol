import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { BlogPostDetail, BlogPostSummary } from '@covasol/types';
import { generateSlug, generateCode } from '../utils/slug';

type BlogWithAuthor = Prisma.BlogPostGetPayload<{ include: { author: true } }>;

export interface BlogUpsertInput {
  id?: number;
  title: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  imageUrl?: string | null;
  category?: string;
  authorName?: string;
  authorRole?: string;
  status?: string;
  publishedAt?: Date | string | null;
  authorId?: number;
  slug?: string;
  isFeatured?: boolean;
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
    status: post.status,
    heroImage: post.imageUrl ?? null,
    category: post.category ?? undefined,
    isFeatured: post.isFeatured === 1
  };
}

function toDetail(post: BlogWithAuthor): BlogPostDetail {
  return {
    ...toSummary(post),
    content: post.content,
    tags: parseStringArray(post.tags),
    keywords: parseStringArray(post.keywords),
    authorRole: post.authorRole ?? undefined,
    galleryMedia: post.galleryMedia as any[] ?? [],
    videoItems: post.videoItems as any[] ?? [],
    sourceLinks: post.sourceLinks as any[] ?? []
  };
}

export async function listPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
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
  const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.title);
  const code = generateCode('BLOG');
  
  const post = await prisma.blogPost.create({
    data: {
      code,
      slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt ?? '',
      content: input.content,
      tags: input.tags ? JSON.stringify(input.tags) : null,
      imageUrl: input.imageUrl ?? null,
      category: input.category,
      authorName: input.authorName,
      authorRole: input.authorRole,
      status: input.status ?? 'draft',
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      authorId: input.authorId,
      isFeatured: input.isFeatured ? 1 : 0
    },
    include: { author: true }
  });
  return toDetail(post);
}

export async function updateBlogPost(id: number | string, input: Partial<BlogUpsertInput>): Promise<BlogPostDetail> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const slug = input.slug ? generateSlug(input.slug) : undefined;
  
  const post = await prisma.blogPost.update({
    where: { id: numId },
    data: {
      slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags ? JSON.stringify(input.tags) : undefined,
      imageUrl: input.imageUrl,
      category: input.category,
      authorName: input.authorName,
      authorRole: input.authorRole,
      status: input.status,
      publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null,
      isFeatured: input.isFeatured !== undefined ? (input.isFeatured ? 1 : 0) : undefined
    },
    include: { author: true }
  });
  return toDetail(post);
}

export async function deleteBlogPost(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  await prisma.blogPost.delete({ where: { id: numId } });
}
