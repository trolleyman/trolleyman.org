import type { Route } from './+types/post';

import { useLoaderData } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { CONTENT_WIDTH_CLASSES } from '../projects';
import PageTitle from '~/components/PageTitle';
import PageHeading from '~/components/PageHeading';
import PageSubHeading from '~/components/PageSubHeading';
import PageSubSubHeading from '~/components/PageSubSubHeading';
import PageUnorderedList from '~/components/PageUnorderedList';
import PageOrderedList from '~/components/PageOrderedList';
import PageListItem from '~/components/PageListItem';
import PageCodeBlock from '~/components/PageCodeBlock';
import PageCode from '~/components/PageCode';
import MarkdownLink from '~/components/MarkdownLink';
import { cn } from '~/utils';
import { getPost } from './blog.server';
import { serializePost, deserializePost } from '~/serialization';

export async function loader({ params: { postId } }: Route.LoaderArgs) {
  const post = await getPost(postId);
  if (!post) {
    throw new Response('Post not found', { status: 404 });
  }
  return {
    post: serializePost(post),
  };
}

export default function Post() {
  const { post: serializedPost } = useLoaderData<typeof loader>();
  const post = deserializePost(serializedPost);

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

  return (
    <div className={cn('max-w-4xl mx-auto')}>
      {/* Header with title, tags, author, and date */}
      <PageTitle author={post.author} date={post.date} tags={post.tags}>
        {post.title}
      </PageTitle>

      {/* Description */}
      {post.description && (
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
          {post.description}
        </p>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
