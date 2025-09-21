import type { DateTime } from 'luxon';
import RawImg from './RawImg';
import type { Picture } from 'imagetools-core';
import { cn } from '~/utils';

export type Author = {
  name: string;
  profilePicture?: string | Picture;
};

export type ArticleHeaderProps = {
  className?: string;
  title: string | React.ReactNode;
  description?: string;
  author?: string | Author;
  date?: DateTime;
  tags?: string[];
};

export function ArticleHeader({
  className,
  title,
  description,
  author,
  date,
  tags,
}: ArticleHeaderProps) {
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

  const authorInfo = getAuthorInfo(author);

  return (
    <>
      {/* Main Title */}
      {/* <Title>{title}</Title> */}
      <h1 className={cn('mb-4', className)}>{title}</h1>
      <hr className="mt-0 mb-4 w-full text-gray-500" />

      {/* Author and Metadata Section */}
      {(author || date) && (
        <div className="mb-6 flex items-center gap-4">
          {/* Author Profile Picture */}
          <div
            className="flex h-12 w-12 items-center justify-center
              overflow-hidden rounded-full bg-gray-600"
          >
            {authorInfo.profilePicture ? (
              <RawImg
                src={authorInfo.profilePicture}
                alt={authorInfo.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-white">
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
        <div className="mb-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-700 px-3
                py-1 text-sm font-medium text-gray-300 transition-colors
                hover:bg-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
