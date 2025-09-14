import type { Route } from './+types/post';

import { useLoaderData } from 'react-router';

import BlogPostRenderer from '~/components/BlogPostRenderer';
import { getPost } from './blog.server';

export async function loader({ params: { postId } }: Route.LoaderArgs) {
  const post = await getPost(postId);
  if (!post) {
    throw new Response('Post not found', { status: 404 });
  }
  return {
    post,
  };
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>();

  return <BlogPostRenderer post={post} />;
}
