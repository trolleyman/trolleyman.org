import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import {
  parseDate,
  parseDateOrNull,
  generateCurrentDate,
  generateDatePrefix,
  formatDate,
} from './date';

describe('parseDate', () => {
  it('should parse date-only format', () => {
    const result = parseDate('2024-01-15');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
  });

  it('should parse date with time (T separator)', () => {
    const result = parseDate('2024-01-15T10:30:00');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.second).toBe(0);
  });

  it('should parse date with time (space separator)', () => {
    const result = parseDate('2024-01-15 10:30:00');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.second).toBe(0);
  });

  it('should parse with timezone identifier', () => {
    const result = parseDate('2024-01-15T10:30:00[Europe/London]');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.zoneName).toBe('Europe/London');
  });

  it('should parse with offset', () => {
    const result = parseDate('2024-01-15T10:30:00+01:00');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.zone.type).toBe('fixed');
    expect(result.offset).toBe(60);

    // Check UTC
    expect(result.toUTC().hour).toBe(9);
    expect(result.toUTC().minute).toBe(30);
    expect(result.toUTC().second).toBe(0);
    expect(result.toUTC().millisecond).toBe(0);
  });

  it('should parse with Z offset (UTC)', () => {
    const result = parseDate('2024-01-15T10:30:00Z');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.zoneName).toBe('UTC');
  });

  it('should parse with negative offset', () => {
    const result = parseDate('2024-01-15T10:30:00-05:00');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.zone.type).toBe('fixed');
    expect(result.offset).toBe(-300);

    // Check UTC
    expect(result.toUTC().hour).toBe(15);
    expect(result.toUTC().minute).toBe(30);
    expect(result.toUTC().second).toBe(0);
    expect(result.toUTC().millisecond).toBe(0);
  });

  it('should parse with milliseconds', () => {
    const result = parseDate('2024-01-15T10:30:00.123');

    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(10);
    expect(result.minute).toBe(30);
    expect(result.second).toBe(0);
    expect(result.millisecond).toBe(123);
  });

  it('should throw error for invalid date string', () => {
    expect(() => parseDate('invalid-date')).toThrow(
      'Invalid date: "invalid-date"',
    );
  });

  it('should throw error for empty string', () => {
    expect(() => parseDate('')).toThrow('Invalid date: ""');
  });
});

describe('parseDateOrNull', () => {
  it('should return DateTime for valid date strings', () => {
    const result = parseDateOrNull('2024-01-15');
    expect(result).toBeInstanceOf(DateTime);
    expect(result?.isValid).toBe(true);
  });

  it('should throw error for invalid date strings', () => {
    expect(() => parseDateOrNull('invalid-date')).toThrow(
      'Invalid date: "invalid-date"',
    );
  });
});

describe('formatDate', () => {
  it('should format DateTime with timezone identifier', () => {
    const date = DateTime.fromISO('2024-01-15T10:30:00.123+01:00', {
      zone: 'Europe/London',
    });
    const result = formatDate(date);

    expect(result).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}\[Europe\/London\]$/,
    );
  });

  it('should throw error for invalid DateTime', () => {
    const invalidDate = DateTime.invalid('test');

    expect(() => formatDate(invalidDate)).toThrow(
      'Invalid DateTime: cannot format invalid date',
    );
  });
});

describe('generateCurrentDate', () => {
  it('should generate a valid date string', () => {
    const result = generateCurrentDate();

    expect(typeof result).toBe('string');
    expect(result).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}\[[^\]]+\]$/,
    );
  });
});

describe('generateDatePrefix', () => {
  it('should generate YYYY-MM-DD format', () => {
    const result = generateDatePrefix();

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Serialization round-trip', () => {
  it('should maintain data integrity through serialization', () => {
    const original = DateTime.now().setZone('Europe/London');
    const serialized = formatDate(original);
    const deserialized = parseDate(serialized);

    expect(deserialized).toBeInstanceOf(DateTime);
    expect(deserialized?.isValid).toBe(true);
    expect(deserialized?.toMillis()).toBe(original.toMillis());
  });
});
