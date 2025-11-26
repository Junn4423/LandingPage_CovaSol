import { notFound } from 'next/navigation';
import { fetchBlogPost, fetchBlogSummaries } from '@/lib/api/blog';

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await fetchBlogSummaries();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return {
      title: 'Bài viết không tồn tại'
    };
  }

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.4em] text-brand-primary">Blog</p>
      <h1 className="mt-6 text-4xl font-semibold text-slate-900">{post.title}</h1>
      <p className="mt-4 text-slate-500">
        {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
      </p>
      {post.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="prose prose-slate mt-10 max-w-none">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
