import { DateTime } from 'luxon';
import { formatDate, parseDate } from './date';
import type { Post } from '~/routes/blog/types';

/**
 * Serialized version of Post for JSON transport
 */
export interface SerializedPost {
  filename: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string; // RFC 9557 format with timezone
  draft: boolean;
  tags: string[];
  content: string;
}

/**
 * Serialize a Post object for JSON transport
 * @param post - The Post object to serialize
 * @returns A serialized version of the post
 */
export function serializePost(post: Post): SerializedPost {
  return {
    filename: post.filename,
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    date: formatDate(post.date),
    draft: post.draft,
    tags: post.tags,
    content: post.content,
  };
}

/**
 * Deserialize a SerializedPost back to a Post object
 * @param serializedPost - The serialized post data
 * @returns A Post object with proper DateTime
 */
export function deserializePost(serializedPost: SerializedPost): Post {
  console.log('deserializePost date', serializedPost.date);
  const parsedDate = parseDate(serializedPost.date);
  console.log('deserializePost parsedDate', parsedDate);
  if (!parsedDate) {
    console.log('deserializePost error', parsedDate);
    throw new Error(`Invalid date string: ${serializedPost.date}`);
  }

  return {
    filename: serializedPost.filename,
    slug: serializedPost.slug,
    title: serializedPost.title,
    description: serializedPost.description,
    author: serializedPost.author,
    date: parsedDate,
    draft: serializedPost.draft,
    tags: serializedPost.tags,
    content: serializedPost.content,
  };
}

/**
 * Custom JSON serializer that handles DateTime objects
 * @param key - The property key
 * @param value - The property value
 * @returns The serialized value
 */
export function customSerializer(key: string, value: any): any {
  if (DateTime.isDateTime(value)) {
    return formatDate(value);
  }
  return value;
}

/**
 * Custom JSON deserializer that handles DateTime strings
 * @param key - The property key
 * @param value - The property value
 * @returns The deserialized value
 */
export function customDeserializer(key: string, value: any): any {
  if (key === 'date' && typeof value === 'string') {
    const parsed = parseDate(value);
    if (!parsed) {
      throw new Error(`Invalid date string: ${value}`);
    }
    return parsed;
  }
  return value;
}
