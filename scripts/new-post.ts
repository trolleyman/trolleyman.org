import { readFile, writeFile, access, readdir } from 'fs/promises';
import { join } from 'path';
import { createInterface } from 'readline';
import slugify from 'slugify';
import matter from 'gray-matter';
import { DateTime } from 'luxon';
import { generateCurrentDate, generateDatePrefix } from '../app/date';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const POSTS_DIR = join(process.cwd(), 'posts');

async function main() {
  console.log('🚀 Creating a new blog post...\n');

  try {
    // Get post title
    const title = await question('📝 Post title: ');
    if (!title.trim()) {
      console.log('❌ Title is required!');
      process.exit(1);
    }

    // Generate slug from title
    const autoSlug = slugify(title, { lower: true, strict: true });
    let slug = (await question(`🔗 Slug (${autoSlug}): `)) || autoSlug;

    // Validate slug is not empty
    if (!slug.trim()) {
      console.log('❌ Slug is required!');
      process.exit(1);
    }

    // Check if slug already exists
    const existingFiles = await readdir(POSTS_DIR);
    const existingSlugs = new Set<string>();

    for (const filename of existingFiles.filter((name) =>
      name.endsWith('.md'),
    )) {
      try {
        const filePath = join(POSTS_DIR, filename);
        const fileContents = await readFile(filePath, 'utf8');
        const { data } = matter(fileContents);
        const existingSlug = data.slug
          ? String(data.slug)
          : slugify(filename.replace('.md', ''), { lower: true, strict: true });
        existingSlugs.add(existingSlug);
      } catch {
        // Skip files that can't be parsed
      }
    }

    if (existingSlugs.has(slug)) {
      console.log(
        `❌ Slug "${slug}" already exists! Please choose a different slug.`,
      );
      process.exit(1);
    }

    // Get description
    const description = await question('📄 Description: ');

    // Get author
    const author =
      (await question('👤 Author (Callum Tolley): ')) || 'Callum Tolley';

    // Get date with time including seconds, milliseconds, and timezone in RFC 9557 format
    const defaultDateTime = generateCurrentDate();
    const date =
      (await question(`📅 Date & Time (${defaultDateTime}): `)) ||
      defaultDateTime;

    // Get tags
    const tagsInput = await question('🏷️  Tags (comma-separated): ');
    const tags = tagsInput
      ? tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    // Ask if it's a draft
    const isDraftInput = await question('📋 Draft? (y/N): ');
    const isDraft =
      isDraftInput.toLowerCase() === 'y' ||
      isDraftInput.toLowerCase() === 'yes';

    // Generate filename with date prefix
    const datePrefix = generateDatePrefix(); // YYYY-MM-DD
    const filename = `${datePrefix}-${slug}.md`;
    const filePath = join(POSTS_DIR, filename);

    // Check if file already exists
    try {
      await access(filePath);
      console.log(`❌ Post "${filename}" already exists!`);
      process.exit(1);
    } catch {
      // File doesn't exist, which is what we want
    }

    // Generate front matter
    const frontMatterLines = ['---', `title: '${title}'`, `slug: '${slug}'`];

    // Only add description if provided
    if (description.trim()) {
      frontMatterLines.push(`description: '${description}'`);
    }

    frontMatterLines.push(
      `author: '${author}'`,
      `date: '${date}'`,
      `draft: ${isDraft}`,
      `tags: [${tags.map((tag) => `'${tag}'`).join(', ')}]`,
      '---',
      '',
      'Write your post content here...',
      '',
    );

    const frontMatter = frontMatterLines.join('\n');

    // Write the file
    await writeFile(filePath, frontMatter, 'utf8');

    console.log('\n✅ Post created successfully!');
    console.log(`📁 Location: ${filePath}`);
    console.log(`🔗 Slug: ${slug}`);
    console.log(`📋 Draft: ${isDraft ? 'Yes' : 'No'}`);

    if (tags.length > 0) {
      console.log(`🏷️  Tags: ${tags.join(', ')}`);
    }

    console.log('\n🎉 Happy writing!');
  } catch (error) {
    console.error('❌ Error creating post:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
