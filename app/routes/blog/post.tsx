import type { Route } from './+types/post';

import { Link, useLoaderData } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { Article } from '~/components/Article';
import PageHeading from '~/components/PageHeading';
import PageSubHeading from '~/components/PageSubHeading';
import PageSubSubHeading from '~/components/PageSubSubHeading';
import PageUnorderedList from '~/components/PageUnorderedList';
import PageOrderedList from '~/components/PageOrderedList';
import PageListItem from '~/components/PageListItem';
import PageCodeBlock from '~/components/PageCodeBlock';
import PageCode from '~/components/PageCode';
import MarkdownLink from '~/components/MarkdownLink';
import { getPost } from './blog.server';
import { serializePost, deserializePost } from '~/serialization';
import type { DateTime } from 'luxon';
import BodyLink from '~/components/BodyLink';

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
    h1: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h2: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    h3: ({ children, ...props }: any) => <h4 {...props}>{children}</h4>,
    a: ({ href, children, ...props }: any) => {
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
    pre: ({ children, ...props }: any) => <pre {...props}>{children}</pre>,
    code: ({ children, ...props }: any) => <code {...props}>{children}</code>,
  };

  return (
    <Article
      title={post.title}
      description={post.description}
      author={post.author}
      date={post.date}
      tags={post.tags.concat(post.draft ? ['draft'] : [])}
    >
      <ReactMarkdown components={markdownComponents}>
        {post.content}
      </ReactMarkdown>
    </Article>
  );
}
