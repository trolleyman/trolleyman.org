import { cn } from '~/utils';
import PageTitle from './PageTitle';
import PageDate from './PageDate';
import PageAuthor from './PageAuthor';
import PageTags from './PageTags';
import type { Post } from '~/routes/blog/blog.server';

export interface BlogPostStyle3Props {
  post: Post;
  children: React.ReactNode;
  className?: string;
}

export default function BlogPostStyle3({
  post,
  children,
  className,
}: BlogPostStyle3Props) {
  return (
    <article className={cn('max-w-4xl mx-auto', className)}>
      {/* Minimal Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <PageTitle className="flex-1 mr-4">{post.title}</PageTitle>
          <PageDate date={post.date} className="text-right flex-shrink-0" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageAuthor author={post.author} />
          <PageTags tags={post.tags} />
        </div>

        {post.description && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
            {post.description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">{children}</div>
    </article>
  );
}
