import type { DateTime } from 'luxon';

export interface Post {
  filename: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  date: DateTime;
  draft: boolean;
  tags: string[];
  content: string;
}
