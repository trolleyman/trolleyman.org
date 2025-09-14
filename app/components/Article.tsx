import type { DateTime } from 'luxon';
import RawImg from './RawImg';
import type { Picture } from 'imagetools-core';

export type Author = {
  name: string;
  profilePicture?: string | Picture;
};

export type ArticleProps = React.PropsWithChildren<{
  title: string | React.ReactNode;
  description?: string;
  author?: string | Author;
  date?: DateTime;
  tags?: string[];
}>;

export function Article({
  title,
  description,
  author,
  date,
  tags,
  children,
}: ArticleProps) {
  tags ??= [];

  // Helper function to get author name and profile picture
  const getAuthorInfo = (author: string | Author | undefined) => {
    if (!author) return { name: '', profilePicture: undefined };
    if (typeof author === 'string') {
      return { name: author, profilePicture: undefined };
    }
    return { name: author.name, profilePicture: author.profilePicture };
  };

  // Helper function to get initials (first name + surname)
  const getInitials = (name: string) => {
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 0) return 'A';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    // Return first letter of first name + first letter of last name
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Format date for display
  const formatDateShort = (date: DateTime) => {
    return date.toFormat('MMM d, yyyy');
  };

  const formatDateLong = (date: DateTime) => {
    return date.toFormat('yyyy-MM-dd HH:mm:ss ZZ');
  };

  // Calculate read time (rough estimate: 200 words per minute)
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const authorInfo = getAuthorInfo(author);

  return (
    <article className="prose dark:prose-invert">
      {/* Main Title */}
      <h1>{title}</h1>

      {/* Author and Metadata Section */}
      {(author || date) && (
        <div className="flex items-center gap-4 mb-6">
          {/* Author Profile Picture */}
          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
            {authorInfo.profilePicture ? (
              <RawImg
                src={authorInfo.profilePicture}
                alt={authorInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-lg font-semibold">
                {authorInfo.name ? getInitials(authorInfo.name) : 'A'}
              </span>
            )}
          </div>

          {/* Author */}
          {authorInfo.name && <span>{authorInfo.name}</span>}

          {/* Date */}
          {date && (
            <span title={formatDateLong(date)}>{formatDateShort(date)}</span>
          )}
        </div>
      )}

      {/* Description/Lead Paragraph */}
      {description && <p className="lead">{description}</p>}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {children}
    </article>
  );
}
