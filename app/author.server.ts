import type { Author } from './components/Article';

// @ts-ignore
import headshotImg from './routes/headshot.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';

export async function loadAuthor(author: string): Promise<Author | null> {
  if (author === 'Callum Tolley') {
    return {
      name: author,
      profilePicture: headshotImg,
    };
  }
  return null;
}
