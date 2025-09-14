import { cn } from '~/utils';
import PageTitle from './PageTitle';
import PageDate from './PageDate';
import PageAuthor from './PageAuthor';
import PageTags from './PageTags';
import type { Post } from '~/routes/blog/blog.server';

export interface BlogPostStyle1Props {
  post: Post;
  children: React.ReactNode;
  className?: string;
}

export default function BlogPostStyle1({
  post,
  children,
  className,
}: BlogPostStyle1Props) {
  return (
    <article className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <header className="mb-8">
        <PageTitle className="mb-4">{post.title}</PageTitle>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <PageAuthor author={post.author} />
            <PageDate date={post.date} />
          </div>
          <PageTags tags={post.tags} />
        </div>

        {post.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {post.description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">{children}</div>
    </article>
  );
}
