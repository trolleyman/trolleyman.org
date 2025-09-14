import { readdir, readFile, access } from 'fs/promises';
import { join, resolve, relative } from 'path';
import matter from 'gray-matter';
import { DateTime } from 'luxon';
import { parseDateOrThrow } from '~/date';

// Constants
export const POSTS_DIRECTORY = join(process.cwd(), 'posts');

// Cache for posts manifest (slug => filename mapping)
let postsManifestCache: Map<string, string> | null = null;

// Custom error classes
export class InvalidFilenameError extends Error {
  constructor(filename: string) {
    super(
      `Invalid filename "${filename}". Filename must not contain path separators (/, \\) and must be a simple filename.`,
    );
    this.name = 'InvalidFilenameError';
  }
}

export class PostNotFoundError extends Error {
  constructor(filename: string) {
    super(`Post "${filename}" not found.`);
    this.name = 'PostNotFoundError';
  }
}

export class PostOutsideDirectoryError extends Error {
  constructor(filename: string, postsDirectory: string) {
    super(
      `Post "${filename}" is outside the posts directory "${postsDirectory}".`,
    );
    this.name = 'PostOutsideDirectoryError';
  }
}

export class DuplicateSlugError extends Error {
  constructor(slug: string, filename1: string, filename2: string) {
    super(
      `Duplicate slug "${slug}" found in posts "${filename1}" and "${filename2}". Each post must have a unique slug.`,
    );
    this.name = 'DuplicateSlugError';
  }
}

export class MissingSlugError extends Error {
  constructor(filename: string) {
    super(
      `Post "${filename}" is missing a required slug in front matter. Please add a slug field.`,
    );
    this.name = 'MissingSlugError';
  }
}

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

export async function getPosts(): Promise<Post[]> {
  const filenames = await readdir(POSTS_DIRECTORY);

  const posts = await Promise.all(
    filenames
      .filter((name) => name.endsWith('.md'))
      .map(async (filename) => {
        try {
          return await getPostByFilename(filename);
        } catch (error) {
          // If there's an error parsing a specific post, log it and skip it
          console.error(`Error parsing post "${filename}":`, error);
          return null;
        }
      }),
  );

  // Filter out null results (failed parses) and drafts in production
  const isDev = process.env.NODE_ENV === 'development';
  const validPosts = posts.filter((post): post is Post => post !== null);
  const filteredPosts = isDev
    ? validPosts
    : validPosts.filter((post) => !post.draft);

  // Sort by date (newest first)
  return filteredPosts.sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

export async function getPostByFilename(filename: string): Promise<Post> {
  // Ensure filename ends with .md
  const normalizedFilename = filename.endsWith('.md')
    ? filename
    : `${filename}.md`;

  // Construct the full path by joining with posts directory
  const filePath = join(POSTS_DIRECTORY, normalizedFilename);

  // Resolve the absolute path and check if it's within the posts directory
  const resolvedPath = resolve(filePath);
  const postsDirResolved = resolve(POSTS_DIRECTORY);
  const relativePath = relative(postsDirResolved, resolvedPath);

  // Check if the resolved path is outside the posts directory
  if (relativePath.startsWith('..') || relativePath.includes('..')) {
    throw new PostOutsideDirectoryError(normalizedFilename, POSTS_DIRECTORY);
  }

  try {
    // Check if file exists
    await access(filePath);
  } catch {
    throw new PostNotFoundError(normalizedFilename);
  }

  // Read and parse the file
  const fileContents = await readFile(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Parse and validate front matter data (same logic as getPosts)
  if (!data.slug) {
    throw new MissingSlugError(normalizedFilename);
  }

  const slug = String(data.slug);
  const title = data.title ? String(data.title) : 'Untitled';
  const description = data.description ? String(data.description) : '';
  const author = data.author ? String(data.author) : 'Unknown';
  const draft = Boolean(data.draft);

  // Parse date and ensure it's a valid DateTime object
  let date: DateTime;
  if (data.date) {
    try {
      date = parseDateOrThrow(data.date, `post "${normalizedFilename}"`);
    } catch (error) {
      throw error; // Re-throw the error from parseDateOrThrow
    }
  } else {
    date = DateTime.now(); // Use local timezone
  }

  // Ensure tags is an array of strings
  let tags: string[];
  if (Array.isArray(data.tags)) {
    tags = data.tags.map((tag) => String(tag));
  } else if (data.tags) {
    tags = [String(data.tags)];
  } else {
    tags = [];
  }

  return {
    filename: normalizedFilename,
    slug,
    title,
    description,
    author,
    date,
    draft,
    tags,
    content,
  };
}

export async function getPostsManifest(): Promise<Map<string, string>> {
  // Return cached manifest in production, rebuild in development
  if (postsManifestCache && import.meta.env.PROD) {
    return postsManifestCache;
  }

  const filenames = await readdir(POSTS_DIRECTORY);
  const manifest = new Map<string, string>();
  const slugToFilenames = new Map<string, string[]>();

  await Promise.all(
    filenames
      .filter((name) => name.endsWith('.md'))
      .map(async (filename) => {
        try {
          const post = await getPostByFilename(filename);

          // Track which files have this slug
          if (!slugToFilenames.has(post.slug)) {
            slugToFilenames.set(post.slug, []);
          }
          slugToFilenames.get(post.slug)!.push(filename);

          manifest.set(post.slug, post.filename);
        } catch (error) {
          // Skip posts that fail to parse
          console.error(
            `Error parsing post "${filename}" for manifest:`,
            error,
          );
        }
      }),
  );

  // Check for duplicate slugs
  for (const [slug, filenames] of slugToFilenames) {
    if (filenames.length > 1) {
      throw new DuplicateSlugError(slug, filenames[0], filenames[1]);
    }
  }

  // Cache the manifest
  postsManifestCache = manifest;
  return manifest;
}

export async function getPost(slug: string): Promise<Post | null> {
  const manifest = await getPostsManifest();
  const filename = manifest.get(slug);

  if (!filename) {
    return null;
  }

  try {
    return await getPostByFilename(filename);
  } catch (error) {
    console.error(`Error loading post "${slug}" (${filename}):`, error);
    return null;
  }
}
