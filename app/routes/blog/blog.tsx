import type { Route } from './+types/blog';

import { Link, useLoaderData } from 'react-router';
import { getPosts } from './blog.server';
import { serializePost, deserializePost } from '~/serialization';

export async function loader({}: Route.LoaderArgs) {
  const posts = await getPosts();
  return {
    posts: posts.map(serializePost),
  };
}

export default function Blog() {
  const { posts: serializedPosts } = useLoaderData<typeof loader>();
  const posts = serializedPosts.map(deserializePost);

  return (
    <>
      <div>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`./${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
