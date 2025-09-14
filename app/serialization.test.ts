import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import {
  serializePost,
  deserializePost,
  customSerializer,
  customDeserializer,
} from './serialization';
import type { Post } from '~/routes/blog/types';

describe('serializePost', () => {
  it('should serialize a Post object correctly', () => {
    const post: Post = {
      filename: 'test.md',
      slug: 'test',
      title: 'Test Post',
      description: 'A test post',
      author: 'Test Author',
      date: DateTime.fromISO('2024-01-15T10:30:00.123+01:00', {
        zone: 'Europe/London',
      }),
      draft: false,
      tags: ['test', 'example'],
      content: '# Test\n\nThis is a test post.',
    };

    const result = serializePost(post);

    expect(result.filename).toBe('test.md');
    expect(result.slug).toBe('test');
    expect(result.title).toBe('Test Post');
    expect(result.description).toBe('A test post');
    expect(result.author).toBe('Test Author');
    expect(result.date).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}\[Europe\/London\]$/,
    );
    expect(result.draft).toBe(false);
    expect(result.tags).toEqual(['test', 'example']);
    expect(result.content).toBe('# Test\n\nThis is a test post.');
  });
});

describe('deserializePost', () => {
  it('should deserialize a SerializedPost back to Post', () => {
    const serializedPost = {
      filename: 'test.md',
      slug: 'test',
      title: 'Test Post',
      description: 'A test post',
      author: 'Test Author',
      date: '2024-01-15T10:30:00.123+01:00[Europe/London]',
      draft: false,
      tags: ['test', 'example'],
      content: '# Test\n\nThis is a test post.',
    };

    const result = deserializePost(serializedPost);

    expect(result.filename).toBe('test.md');
    expect(result.slug).toBe('test');
    expect(result.title).toBe('Test Post');
    expect(result.description).toBe('A test post');
    expect(result.author).toBe('Test Author');
    expect(result.date).toBeInstanceOf(DateTime);
    expect(result.date.isValid).toBe(true);
    expect(result.date.zoneName).toBe('Europe/London');
    expect(result.draft).toBe(false);
    expect(result.tags).toEqual(['test', 'example']);
    expect(result.content).toBe('# Test\n\nThis is a test post.');
  });
});

describe('customSerializer', () => {
  it('should serialize DateTime objects', () => {
    const date = DateTime.fromISO('2024-01-15T10:30:00.123+01:00', {
      zone: 'Europe/London',
    });
    const result = customSerializer('date', date);

    expect(result).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}\[Europe\/London\]$/,
    );
  });

  it('should pass through non-DateTime values', () => {
    const result = customSerializer('title', 'Test Title');
    expect(result).toBe('Test Title');
  });
});

describe('customDeserializer', () => {
  it('should deserialize date strings', () => {
    const dateString = '2024-01-15T10:30:00.123+01:00[Europe/London]';
    const result = customDeserializer('date', dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.zoneName).toBe('Europe/London');
  });

  it('should pass through non-date values', () => {
    const result = customDeserializer('title', 'Test Title');
    expect(result).toBe('Test Title');
  });
});

describe('Serialization round-trip', () => {
  it('should maintain data integrity through full serialization cycle', () => {
    const originalPost: Post = {
      filename: 'test.md',
      slug: 'test',
      title: 'Test Post',
      description: 'A test post',
      author: 'Test Author',
      date: DateTime.fromISO('2024-01-15T10:30:00.123+01:00', {
        zone: 'Europe/London',
      }),
      draft: false,
      tags: ['test', 'example'],
      content: '# Test\n\nThis is a test post.',
    };

    const serialized = serializePost(originalPost);
    const deserialized = deserializePost(serialized);

    expect(deserialized.filename).toBe(originalPost.filename);
    expect(deserialized.slug).toBe(originalPost.slug);
    expect(deserialized.title).toBe(originalPost.title);
    expect(deserialized.description).toBe(originalPost.description);
    expect(deserialized.author).toBe(originalPost.author);
    expect(deserialized.date.toMillis()).toBe(originalPost.date.toMillis());
    expect(deserialized.date.zoneName).toBe(originalPost.date.zoneName);
    expect(deserialized.draft).toBe(originalPost.draft);
    expect(deserialized.tags).toEqual(originalPost.tags);
    expect(deserialized.content).toBe(originalPost.content);
  });
});
