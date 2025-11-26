import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { BlogPostDetail, BlogPostSummary } from '@/types/content';
import { generateSlug } from '../utils/slug';

type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type BlogWithAuthor = Prisma.BlogPostGetPayload<{ include: { author: true } }>;

export interface BlogUpsertInput {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
  heroImage?: string | null;
  status?: BlogStatus;
  publishedAt?: Date | string | null;
  authorId: string;
  slug?: string;
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

function toSummary(post: BlogWithAuthor): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: post.author?.displayName || 'COVASOL Team',
    status: post.status,
    heroImage: post.heroImage ?? null
  };
}

function toDetail(post: BlogWithAuthor): BlogPostDetail {
  return {
    ...toSummary(post),
    content: post.content,
    tags: parseStringArray(post.tags)
  };
}

export async function listPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
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
  if (!post || post.status !== 'PUBLISHED') {
    return null;
  }
  return toDetail(post);
}

export async function getBlogPostById(id: string): Promise<BlogPostDetail | null> {
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { author: true } });
  return post ? toDetail(post) : null;
}

export async function createBlogPost(input: BlogUpsertInput): Promise<BlogPostDetail> {
  const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.title);
  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags ?? [],
      heroImage: input.heroImage ?? null,
      status: input.status ?? 'DRAFT',
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      authorId: input.authorId
    },
    include: { author: true }
  });
  return toDetail(post);
}

export async function updateBlogPost(id: string, input: Partial<BlogUpsertInput>): Promise<BlogPostDetail> {
  const slug = input.slug ? generateSlug(input.slug) : undefined;
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags,
      heroImage: input.heroImage,
      status: input.status,
      publishedAt: input.publishedAt === undefined ? undefined : input.publishedAt ? new Date(input.publishedAt) : null
    },
    include: { author: true }
  });
  return toDetail(post);
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.delete({ where: { id } });
}
