import type { DateTime } from 'luxon';
import type { Author } from '~/components/Article';

export interface Post {
  filename: string;
  slug: string;
  title: string;
  description: string;
  author: string | Author;
  date: DateTime;
  draft: boolean;
  tags: string[];
  content: string;
}
