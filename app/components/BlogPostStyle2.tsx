import { cn } from '~/utils';
import PageTitle from './PageTitle';
import PageDate from './PageDate';
import PageAuthor from './PageAuthor';
import PageTags from './PageTags';
import type { Post } from '~/routes/blog/types';

export interface BlogPostStyle2Props {
  post: Post;
  children: React.ReactNode;
  className?: string;
}

export default function BlogPostStyle2({
  post,
  children,
  className,
}: BlogPostStyle2Props) {
  return (
    <article className={cn('max-w-4xl mx-auto', className)}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-8">
        <PageTitle className="mb-6 text-4xl md:text-5xl">
          {post.title}
        </PageTitle>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <PageAuthor author={post.author} />
          </div>
          <PageDate date={post.date} />
        </div>

        {post.description && (
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {post.description}
          </p>
        )}

        <PageTags tags={post.tags} className="mt-6" />
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">{children}</div>
    </article>
  );
}
