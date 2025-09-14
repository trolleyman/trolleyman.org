import { DateTime, IANAZone, FixedOffsetZone, Zone } from 'luxon';

const WHITESPACE = '\\s+';
const WHITESPACE_OR_EMPTY = '\\s*';
const YEAR = '(?<year>\\d{4})';
const MONTH = '(?<month>\\d{1,2})';
const DAY = '(?<day>\\d{1,2})';
const TIME_SEPARATOR = `(T|${WHITESPACE})`;
const HOUR = '(?<hour>\\d{1,2})';
const MINUTE = '(?<minute>\\d{1,2})';
const SECONDS = '(?<seconds>\\d{1,2})';
const MILLISECONDS = '\\.(?<milliseconds>\\d{1,6})';
const SECONDS_PART = `:${SECONDS}(${MILLISECONDS})?`;
const OFFSET_SIGN = '(?<offsetSign>[+-])';
const OFFSET_HOURS = '(?<offsetHours>\\d{1,2})';
const OFFSET_MINUTES = '(?<offsetMinutes>\\d{2})';
const OFFSET_PART = `(${OFFSET_SIGN}${OFFSET_HOURS}:?${OFFSET_MINUTES}?|Z)`;
const TIMEZONE_NAME = '(?<timezoneName>[a-zA-Z_/]+)';
const TIMEZONE_PART = `\\[${TIMEZONE_NAME}\\]`;

const DATE_REGEX = new RegExp(
  `^${WHITESPACE_OR_EMPTY}${YEAR}-${MONTH}-${DAY}${TIME_SEPARATOR}${HOUR}:${MINUTE}(${SECONDS_PART})?${WHITESPACE_OR_EMPTY}(${OFFSET_PART})?${WHITESPACE_OR_EMPTY}(${TIMEZONE_PART})?${WHITESPACE_OR_EMPTY}$`,
);

/**
 * Parse a date string using regex pattern matching
 * @param dateString - The date string to parse
 * @returns A valid DateTime object or null if parsing fails
 */
export function parseDate(dateString: string): DateTime<true> {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error(`Invalid date: "${dateString}"`);
  }

  const match = dateString.match(DATE_REGEX);
  if (!match) {
    // Fallback to ISO parsing
    const isoParsed = DateTime.fromISO(dateString, { zone: 'utc' });
    if (isoParsed.isValid) {
      return isoParsed;
    }
    throw new Error(`Invalid date: "${dateString}"`);
  }

  const {
    year,
    month,
    day,
    hour,
    minute,
    seconds,
    milliseconds,
    offsetSign,
    offsetHours,
    offsetMinutes,
    timezoneName,
  } = match.groups || {};

  // Build the DateTime object
  const dateTimeObj: any = {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
  };

  // Add time components if present
  if (hour && minute) {
    dateTimeObj.hour = parseInt(hour);
    dateTimeObj.minute = parseInt(minute);

    if (seconds) {
      dateTimeObj.second = parseInt(seconds);
      if (milliseconds) {
        // Convert milliseconds to proper format (0-999)
        dateTimeObj.millisecond = parseInt(milliseconds.padEnd(3, '0'));
      }
    }
  }

  // Determine the zone
  let ianaZone: IANAZone | null = null;
  let fixedOffset: number | null = null;
  if (timezoneName) {
    // Check if IANA zone is valid
    if (!IANAZone.isValidZone(timezoneName)) {
      throw new Error(`Invalid timezone name: "${timezoneName}"`);
    }
    ianaZone = IANAZone.create(timezoneName);
  }
  if (offsetSign) {
    if (offsetSign === 'Z') {
      fixedOffset = 0;
    } else if (offsetHours) {
      // Calculate offset in minutes
      const offsetH = parseInt(offsetHours);
      const offsetM = offsetMinutes ? parseInt(offsetMinutes) : 0;
      const totalMinutes = offsetH * 60 + offsetM;
      const offsetMinutesTotal =
        offsetSign === '+' ? totalMinutes : -totalMinutes;
      fixedOffset = offsetMinutesTotal;
    }
  }
  const fixedOffsetZone =
    fixedOffset === null
      ? null
      : fixedOffset === 0
        ? FixedOffsetZone.utcInstance
        : FixedOffsetZone.instance(fixedOffset);
  const zone: Zone = ianaZone || fixedOffsetZone || FixedOffsetZone.utcInstance; // Default to UTC

  // Create DateTime from object
  console.log('dateString', dateString);
  console.log('dateTimeObj', dateTimeObj);
  console.log('zone', zone);
  const parsed = DateTime.fromObject(dateTimeObj, { zone });
  console.log('parsed', parsed);
  console.log('parsed.isValid', parsed.isValid);
  console.log('parsed.zoneName', parsed.zoneName);
  console.log('parsed.zone.name', parsed.zone.name);
  console.log('parsed.offset', parsed.offset);

  if (parsed.isValid) {
    // If we have both IANA zone and fixed offset, verify they match
    if (
      ianaZone !== null &&
      fixedOffset !== null &&
      parsed.offset !== fixedOffset
    ) {
      console.log('throwing time zone mismatch error');
      throw new Error(
        `Timezone offset mismatch: "${ianaZone.name}" ${parsed.offset}m !== ${fixedOffset}m (at ${formatDate(parsed)})`,
      );
    }
    console.log('returning!', parsed);
    return parsed;
  }
  throw new Error(`Invalid date: "${dateString}"`);
}

/**
 * Parse a date string and throw an error if invalid
 * @param dateString - The date string to parse
 * @returns A valid DateTime object
 * @throws Error if the date string is invalid
 */
export function parseDateOrNull(dateString: string): DateTime<true> | null {
  return parseDate(dateString);
}

/**
 * Generate current date in RFC 9557 format with local timezone
 * @returns Current date as RFC 9557 formatted string
 */
export function generateCurrentDate(): string {
  return formatDate(DateTime.now());
}

/**
 * Generate date prefix for filenames (YYYY-MM-DD format)
 * @returns Current date in YYYY-MM-DD format
 */
export function generateDatePrefix(): string {
  return DateTime.now().toISODate()!;
}

/**
 * Check if a string matches RFC 9557 format
 * @param dateString - The string to check
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

/**
 * Format a DateTime using the standard format with timezone
 * @param date - The DateTime object to format
 * @returns Formatted date string
 */
export function formatDate(date: DateTime): string {
  if (!date.isValid) {
    throw new Error('Invalid DateTime: cannot format invalid date');
  }

  return date.toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]");
}
