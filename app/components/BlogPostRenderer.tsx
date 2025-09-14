import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { CONTENT_WIDTH_CLASSES } from '~/routes/projects';
import PageHeading from '~/components/PageHeading';
import PageSubHeading from '~/components/PageSubHeading';
import PageSubSubHeading from '~/components/PageSubSubHeading';
import PageUnorderedList from '~/components/PageUnorderedList';
import PageOrderedList from '~/components/PageOrderedList';
import PageListItem from '~/components/PageListItem';
import PageCodeBlock from '~/components/PageCodeBlock';
import PageCode from '~/components/PageCode';
import MarkdownLink from '~/components/MarkdownLink';
import BlogPostStyle1 from '~/components/BlogPostStyle1';
import BlogPostStyle2 from '~/components/BlogPostStyle2';
import BlogPostStyle3 from '~/components/BlogPostStyle3';
import { cn } from '~/utils';
import type { Post } from '~/routes/blog/blog.server';

export interface BlogPostRendererProps {
  post: Post;
  className?: string;
}

export default function BlogPostRenderer({
  post,
  className,
}: BlogPostRendererProps) {
  const [currentStyle, setCurrentStyle] = useState(1);

  // Handle keyboard shortcuts for style switching
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '1') {
        setCurrentStyle(1);
      } else if (event.key === '2') {
        setCurrentStyle(2);
      } else if (event.key === '3') {
        setCurrentStyle(3);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const markdownComponents = {
    h1: ({ children, ...props }: any) => (
      <PageHeading {...props}>{children}</PageHeading>
    ),
    h2: ({ children, ...props }: any) => (
      <PageSubHeading {...props}>{children}</PageSubHeading>
    ),
    h3: ({ children, ...props }: any) => (
      <PageSubSubHeading {...props}>{children}</PageSubSubHeading>
    ),
    ul: ({ children, ...props }: any) => (
      <PageUnorderedList {...props}>{children}</PageUnorderedList>
    ),
    ol: ({ children, ...props }: any) => (
      <PageOrderedList {...props}>{children}</PageOrderedList>
    ),
    li: ({ children, ...props }: any) => (
      <PageListItem {...props}>{children}</PageListItem>
    ),
    a: ({ href, children, ...props }: any) => (
      <MarkdownLink href={href} {...props}>
        {children}
      </MarkdownLink>
    ),
    pre: ({ children, ...props }: any) => (
      <PageCodeBlock {...props}>{children}</PageCodeBlock>
    ),
    code: ({ children, className, ...props }: any) => (
      <PageCode className={className} {...props}>
        {children}
      </PageCode>
    ),
  };

  const renderStyle = () => {
    const content = (
      <ReactMarkdown components={markdownComponents}>
        {post.content}
      </ReactMarkdown>
    );

    switch (currentStyle) {
      case 1:
        return (
          <BlogPostStyle1 post={post} className={className}>
            {content}
          </BlogPostStyle1>
        );
      case 2:
        return (
          <BlogPostStyle2 post={post} className={className}>
            {content}
          </BlogPostStyle2>
        );
      case 3:
        return (
          <BlogPostStyle3 post={post} className={className}>
            {content}
          </BlogPostStyle3>
        );
      default:
        return (
          <BlogPostStyle1 post={post} className={className}>
            {content}
          </BlogPostStyle1>
        );
    }
  };

  return (
    <div className="relative">
      {/* Style indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Style
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((style) => (
              <button
                key={style}
                onClick={() => setCurrentStyle(style)}
                className={cn(
                  'w-8 h-8 rounded-full text-xs font-medium transition-colors',
                  currentStyle === style
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
                )}
              >
                {style}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Press 1, 2, or 3
          </div>
        </div>
      </div>

      {renderStyle()}
    </div>
  );
}
