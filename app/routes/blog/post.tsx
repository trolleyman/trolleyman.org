import type { Route } from './+types/post';

import { Link, useLoaderData } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { Article } from '~/components/Article';
import { getPost } from './blog.server';
import { serializePost, deserializePost } from '~/serialization';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import hljs from 'highlight.js'; // TODO: Only import some languages?
import { cn } from '~/utils';

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
    h1: ({ node, children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h2: ({ node, children, ...props }: any) => <h3 {...props}>{children}</h3>,
    h3: ({ node, children, ...props }: any) => <h4 {...props}>{children}</h4>,
    a: ({ href, node, children, ...props }: any) => {
      const isExternal =
        href.startsWith('http://') || href.startsWith('https://');
      return (
        <Link
          to={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className={props.className}
        >
          {children}
        </Link>
      );
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      const content = String(children).replace(/\n$/, '');
      const highlightResult = match
        ? hljs.highlight(content, {
            language: match[1],
          })
        : hljs.highlightAuto(content);
      return (
        <code
          className={cn(className, 'language-' + highlightResult.language)}
          {...props}
          dangerouslySetInnerHTML={{ __html: highlightResult.value }}
        />
      );
    },
  };

  return (
    <Article
      title={post.title}
      description={post.description}
      author={post.author}
      date={post.date}
      tags={post.tags.concat(post.draft ? ['draft'] : [])}
    >
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {post.content}
      </ReactMarkdown>
    </Article>
  );
}
