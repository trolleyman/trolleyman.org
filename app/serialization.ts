import { DateTime } from 'luxon';
import { formatDate, parseDate } from './date';
import type { Post } from '~/routes/blog/types';

/**
 * Serialized version of Post for JSON transport
 */
export type SerializedPost = Omit<Post, 'date'> & { date: string };

/**
 * Serialize a Post object for JSON transport
 * @param post - The Post object to serialize
 * @returns A serialized version of the post
 */
export function serializePost(post: Post): SerializedPost {
  const { date, ...rest } = post;
  return {
    date: formatDate(date),
    ...rest,
  };
}

/**
 * Deserialize a SerializedPost back to a Post object
 * @param serializedPost - The serialized post data
 * @returns A Post object with proper DateTime
 */
export function deserializePost(serializedPost: SerializedPost): Post {
  const parsedDate = parseDate(serializedPost.date);
  if (!parsedDate) {
    throw new Error(`Invalid date string: ${serializedPost.date}`);
  }

  const { date, ...rest } = serializedPost;
  return {
    date: parsedDate,
    ...rest,
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
