import type { Route } from './+types/post';

import { useLoaderData } from 'react-router';

import { Article } from '~/components/Article';
import Markdown from '~/components/Markdown';
import { deserializePost, serializePost } from '~/serialization';

import { getPost } from './blog.server';

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

  return (
    <Article
      title={post.title}
      description={post.description}
      author={post.author}
      date={post.date}
      tags={post.tags.concat(post.draft ? ['draft'] : [])}
    >
      <Markdown bare allowHtml>
        {post.content}
      </Markdown>
    </Article>
  );
}
