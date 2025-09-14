import { describe, it, expect, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  parseDate,
  parseDateOrThrow,
  generateCurrentDate,
  generateDatePrefix,
  isRFC9557Format,
  extractTimezoneId,
} from './date';

describe('parseDate', () => {
  it('should parse RFC 9557 format with timezone identifier', () => {
    const dateString = '2024-01-15T10:30:00.123+01:00[Europe/London]';
    const result = parseDate(dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result?.isValid).toBe(true);
    expect(result?.zoneName).toBe('Europe/London');
    expect(result?.toISODate()).toBe('2024-01-15');
  });

  it('should parse ISO format without timezone identifier', () => {
    const dateString = '2024-01-15T10:30:00.123+01:00';
    const result = parseDate(dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result?.isValid).toBe(true);
  });

  it('should parse space-separated format with timezone', () => {
    const dateString = '2024-01-15 10:30:00.123 Europe/London';
    const result = parseDate(dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result?.isValid).toBe(true);
    expect(result?.zoneName).toBe('Europe/London');
  });

  it('should parse space-separated format without timezone', () => {
    const dateString = '2024-01-15 10:30:00.123';
    const result = parseDate(dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result?.isValid).toBe(true);
  });

  it('should parse date-only format', () => {
    const dateString = '2024-01-15';
    const result = parseDate(dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result?.isValid).toBe(true);
    expect(result?.toISODate()).toBe('2024-01-15');
  });

  it('should return null for invalid date strings', () => {
    const invalidDates = [
      'invalid-date',
      '2024-13-45', // Invalid month/day
      'not-a-date',
      '',
    ];

    invalidDates.forEach((dateString) => {
      const result = parseDate(dateString);
      expect(result).toBeNull();
    });
  });

  it('should return null for empty or null input', () => {
    expect(parseDate('')).toBeNull();
    expect(parseDate(null as any)).toBeNull();
    expect(parseDate(undefined as any)).toBeNull();
  });
});

describe('parseDateOrThrow', () => {
  it('should return DateTime for valid date strings', () => {
    const dateString = '2024-01-15T10:30:00.123+01:00[Europe/London]';
    const result = parseDateOrThrow(dateString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
  });

  it('should throw error for invalid date strings', () => {
    const invalidDate = 'invalid-date';

    expect(() => parseDateOrThrow(invalidDate)).toThrow(
      'Invalid date "invalid-date"',
    );
  });

  it('should include context in error message', () => {
    const invalidDate = 'invalid-date';
    const context = 'post "test.md"';

    expect(() => parseDateOrThrow(invalidDate, context)).toThrow(
      'Invalid date "invalid-date" in post "test.md"',
    );
  });
});

describe('generateCurrentDate', () => {
  it('should generate RFC 9557 format with local timezone', () => {
    const result = generateCurrentDate();

    expect(isRFC9557Format(result)).toBe(true);
    expect(result).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?[+-]\d{2}:\d{2}\[[^\]]+\]$/,
    );
  });

  it('should generate a valid DateTime when parsed', () => {
    const result = generateCurrentDate();
    const parsed = parseDate(result);

    expect(parsed).toBeInstanceOf(DateTime);
    expect(parsed?.isValid).toBe(true);
  });

  it('should include timezone identifier', () => {
    const result = generateCurrentDate();
    const timezoneId = extractTimezoneId(result);

    expect(timezoneId).toBeTruthy();
    expect(typeof timezoneId).toBe('string');
  });
});

describe('generateDatePrefix', () => {
  it('should generate YYYY-MM-DD format', () => {
    const result = generateDatePrefix();

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should generate a valid date', () => {
    const result = generateDatePrefix();
    const parsed = DateTime.fromISO(result);

    expect(parsed.isValid).toBe(true);
  });
});

describe('isRFC9557Format', () => {
  it('should return true for valid RFC 9557 formats', () => {
    const validFormats = [
      '2024-01-15T10:30:00.123+01:00[Europe/London]',
      '2024-01-15T10:30:00+01:00[America/New_York]',
      '2024-01-15T10:30:00.000-05:00[Asia/Tokyo]',
    ];

    validFormats.forEach((format) => {
      expect(isRFC9557Format(format)).toBe(true);
    });
  });

  it('should return false for invalid formats', () => {
    const invalidFormats = [
      '2024-01-15T10:30:00.123+01:00', // Missing timezone identifier
      '2024-01-15 10:30:00.123 Europe/London', // Space instead of T
      '2024-01-15', // Date only
      'invalid-date',
      '',
    ];

    invalidFormats.forEach((format) => {
      expect(isRFC9557Format(format)).toBe(false);
    });
  });
});

describe('extractTimezoneId', () => {
  it('should extract timezone identifier from RFC 9557 format', () => {
    const dateString = '2024-01-15T10:30:00.123+01:00[Europe/London]';
    const result = extractTimezoneId(dateString);

    expect(result).toBe('Europe/London');
  });

  it('should extract timezone identifier from different timezones', () => {
    const testCases = [
      {
        input: '2024-01-15T10:30:00.123+01:00[America/New_York]',
        expected: 'America/New_York',
      },
      {
        input: '2024-01-15T10:30:00.123+09:00[Asia/Tokyo]',
        expected: 'Asia/Tokyo',
      },
      { input: '2024-01-15T10:30:00.123+00:00[UTC]', expected: 'UTC' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(extractTimezoneId(input)).toBe(expected);
    });
  });

  it('should return null for strings without timezone identifier', () => {
    const testCases = [
      '2024-01-15T10:30:00.123+01:00',
      '2024-01-15 10:30:00.123 Europe/London',
      '2024-01-15',
      'invalid-date',
      '',
    ];

    testCases.forEach((input) => {
      expect(extractTimezoneId(input)).toBeNull();
    });
  });
});

describe('Integration tests', () => {
  it('should handle round-trip conversion', () => {
    const original = generateCurrentDate();
    const parsed = parseDate(original);
    const regenerated = parsed?.toISO({
      includeOffset: true,
      suppressMilliseconds: false,
    });
    const timezoneId = parsed?.zoneName;
    const roundTrip = `${regenerated}[${timezoneId}]`;

    expect(roundTrip).toBe(original);
  });

  it('should maintain timezone information through parsing', () => {
    const original = generateCurrentDate();
    const parsed = parseDate(original);
    const timezoneId = extractTimezoneId(original);

    expect(parsed?.zoneName).toBe(timezoneId);
  });
});
