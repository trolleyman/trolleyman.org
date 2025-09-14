import type { Route } from './+types/post';

import ReactMarkdown from 'react-markdown';
import { useLoaderData } from 'react-router';

import { CONTENT_WIDTH_CLASSES } from '../projects';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';
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

  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        {post.title}
      </PageTitle>

      <div
        className={cn(
          'space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <ReactMarkdown>{post.content}</ReactMarkdown>

        {/* <FancyLinks
          className="text-right"
          links={[{ text: 'Demo', to: 'demo' }]}
        /> */}
      </div>
    </>
  );
}
