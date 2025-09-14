import type { Route } from './+types/blog';

import { Link, useLoaderData } from 'react-router';
import { getPosts } from './blog.server';

export async function loader({}: Route.LoaderArgs) {
  return {
    posts: await getPosts(),
  };
}

export default function Blog() {
  const { posts } = useLoaderData<typeof loader>();

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
