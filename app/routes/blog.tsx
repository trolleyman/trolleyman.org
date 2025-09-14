import type { Route } from './+types/blog';

import { useLoaderData } from 'react-router';

export function loader({}: Route.LoaderArgs) {
  return {
    posts: [
      { id: 1, title: 'Post 1', content: 'Post 1 content' },
      { id: 2, title: 'Post 2', content: 'Post 2 content' },
    ],
  };
}

export default function Blog() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <>
      <div>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
