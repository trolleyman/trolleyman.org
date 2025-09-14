import { DateTime } from 'luxon';

/**
 * Parse a date string using multiple supported formats
 * @param dateString - The date string to parse
 * @returns A valid DateTime object or null if parsing fails
 */
export function parseDate(dateString: string): DateTime | null {
  if (!dateString) {
    return null;
  }

  // Try parsing as RFC 9557 format first (ISO + timezone identifier in brackets)
  let parsedDate = DateTime.fromISO(dateString);

  // If that fails, try parsing as "YYYY-MM-DDTHH:mm:ss.sss+HH:mm[Timezone]" format
  if (!parsedDate.isValid) {
    const rfc9557Match = dateString.match(/^(.+)\[([^\]]+)\]$/);
    if (rfc9557Match) {
      const [, isoPart, timezoneId] = rfc9557Match;
      parsedDate = DateTime.fromISO(isoPart, { zone: timezoneId });
    }
  }

  // If ISO parsing fails, try parsing as "YYYY-MM-DD HH:mm:ss.SSS Europe/London" format
  if (!parsedDate.isValid) {
    parsedDate = DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm:ss.SSS z', {
      zone: 'local',
    });
  }

  // If that fails, try "YYYY-MM-DD HH:mm:ss Europe/London" format
  if (!parsedDate.isValid) {
    parsedDate = DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm:ss z', {
      zone: 'local',
    });
  }

  // If that fails, try "YYYY-MM-DD HH:mm:ss.SSS" format (without timezone)
  if (!parsedDate.isValid) {
    parsedDate = DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm:ss.SSS', {
      zone: 'local',
    });
  }

  // If that fails, try "YYYY-MM-DD HH:mm:ss" format (without timezone)
  if (!parsedDate.isValid) {
    parsedDate = DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm:ss', {
      zone: 'local',
    });
  }

  // If that fails, try "YYYY-MM-DD" format
  if (!parsedDate.isValid) {
    parsedDate = DateTime.fromFormat(dateString, 'yyyy-MM-dd', {
      zone: 'local',
    });
  }

  return parsedDate.isValid ? parsedDate : null;
}

/**
 * Parse a date string and throw an error if invalid
 * @param dateString - The date string to parse
 * @param context - Context for error messages (e.g., filename)
 * @returns A valid DateTime object
 * @throws Error if the date string is invalid
 */
export function parseDateOrThrow(
  dateString: string,
  context?: string,
): DateTime {
  const parsedDate = parseDate(dateString);

  if (!parsedDate) {
    const contextStr = context ? ` in ${context}` : '';
    throw new Error(
      `Invalid date "${dateString}"${contextStr}. Please use a valid date format (e.g., "2024-01-15T10:30:00.123+01:00[America/New_York]", "2024-01-15 10:30:00.123 America/New_York", or "2024-01-15").`,
    );
  }

  return parsedDate;
}

/**
 * Generate a current date in RFC 9557 format with local timezone
 * @returns Date string in format "YYYY-MM-DDTHH:mm:ss.sss+HH:mm[Timezone]"
 */
export function generateCurrentDate(): string {
  const now = DateTime.now(); // Use local timezone
  const isoFormat = now.toISO({
    includeOffset: true,
    suppressMilliseconds: false,
  });
  const timezoneId = now.zoneName; // Local timezone
  return `${isoFormat}[${timezoneId}]`;
}

/**
 * Generate a date prefix for filenames (YYYY-MM-DD format)
 * @returns Date string in format "YYYY-MM-DD"
 */
export function generateDatePrefix(): string {
  return DateTime.now().toISODate()!;
}

/**
 * Check if a date string is in RFC 9557 format
 * @param dateString - The date string to check
 * @returns True if the string matches RFC 9557 format
 */
export function isRFC9557Format(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?[+-]\d{2}:\d{2}\[[^\]]+\]$/.test(
    dateString,
  );
}

/**
 * Extract timezone identifier from RFC 9557 format
 * @param dateString - The date string in RFC 9557 format
 * @returns The timezone identifier or null if not found
 */
export function extractTimezoneId(dateString: string): string | null {
  const match = dateString.match(/^(.+)\[([^\]]+)\]$/);
  return match ? match[2] : null;
}
