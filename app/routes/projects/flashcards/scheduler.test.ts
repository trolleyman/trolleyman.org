import { Rating, State } from 'ts-fsrs';
import { describe, expect, it } from 'vitest';

import {
  dueCards,
  formatDue,
  formatInterval,
  gradeCard,
  gradeIntervals,
  isDue,
  newSrsState,
} from './scheduler';
import { createCard } from './store';
import type { Flashcard } from './types';

const NOW = new Date('2026-01-01T12:00:00.000Z');

function card(front = 'front'): Flashcard {
  return createCard(front, 'back', [], NOW);
}

function at(offsetMs: number): Date {
  return new Date(NOW.getTime() + offsetMs);
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('newSrsState', () => {
  it('starts in the new state, due immediately', () => {
    const srs = newSrsState(NOW);
    expect(srs.state).toBe(State.New);
    expect(srs.reps).toBe(0);
    expect(srs.lapses).toBe(0);
    expect(new Date(srs.due).getTime()).toBeLessThanOrEqual(NOW.getTime());
  });

  it('is JSON safe', () => {
    const srs = newSrsState(NOW);
    expect(JSON.parse(JSON.stringify(srs))).toEqual(srs);
  });
});

describe('gradeCard', () => {
  it('records a review and moves the due date forward', () => {
    const graded = gradeCard(card(), Rating.Good, NOW);
    expect(graded.srs.reps).toBe(1);
    expect(new Date(graded.srs.due).getTime()).toBeGreaterThan(NOW.getTime());
    expect(graded.srs.last_review).toBe(NOW.toISOString());
  });

  it('leaves the card content untouched', () => {
    const original = card();
    const graded = gradeCard(original, Rating.Good, NOW);
    expect(graded.id).toBe(original.id);
    expect(graded.front).toBe(original.front);
    expect(graded.back).toBe(original.back);
  });

  it('does not mutate the card it was given', () => {
    const original = card();
    const before = JSON.stringify(original);
    gradeCard(original, Rating.Easy, NOW);
    expect(JSON.stringify(original)).toBe(before);
  });

  it('schedules Easy further out than Again', () => {
    const again = gradeCard(card(), Rating.Again, NOW);
    const easy = gradeCard(card(), Rating.Easy, NOW);
    expect(new Date(easy.srs.due).getTime()).toBeGreaterThan(
      new Date(again.srs.due).getTime(),
    );
  });

  it('stays JSON safe after grading', () => {
    const graded = gradeCard(card(), Rating.Good, NOW);
    expect(JSON.parse(JSON.stringify(graded))).toEqual(graded);
  });

  it('counts a lapse when a reviewed card is forgotten', () => {
    let subject = gradeCard(card(), Rating.Easy, NOW);
    subject = gradeCard(subject, Rating.Again, at(10 * DAY));
    expect(subject.srs.lapses).toBe(1);
  });
});

describe('gradeIntervals', () => {
  it('gives a label for every grade', () => {
    const intervals = gradeIntervals(card(), NOW);
    expect(Object.keys(intervals)).toHaveLength(4);
    for (const label of Object.values(intervals)) {
      expect(label).toMatch(/^(<1m|[\d.]+(m|h|d|mo|y))$/);
    }
  });

  it('matches what grading actually does, since fuzz is off', () => {
    const subject = card();
    const previewed = gradeIntervals(subject, NOW)[Rating.Good];
    const graded = gradeCard(subject, Rating.Good, NOW);
    expect(
      formatInterval(new Date(graded.srs.due).getTime() - NOW.getTime()),
    ).toBe(previewed);
  });
});

describe('isDue', () => {
  it('treats a brand new card as due', () => {
    expect(isDue(card(), NOW)).toBe(true);
  });

  it('is false before the due date and true after', () => {
    const graded = gradeCard(card(), Rating.Easy, NOW);
    expect(isDue(graded, NOW)).toBe(false);
    expect(isDue(graded, at(365 * DAY))).toBe(true);
  });
});

describe('dueCards', () => {
  it('leaves out cards that are not due', () => {
    const pending = gradeCard(card('later'), Rating.Easy, NOW);
    const fresh = card('now');
    expect(dueCards([pending, fresh], NOW).map((entry) => entry.front)).toEqual(
      ['now'],
    );
  });

  it('puts review cards before new ones', () => {
    const review = gradeCard(card('review'), Rating.Good, NOW);
    const fresh = card('fresh');
    const order = dueCards([fresh, review], at(30 * DAY)).map(
      (entry) => entry.front,
    );
    expect(order).toEqual(['review', 'fresh']);
  });

  it('puts the most overdue card first', () => {
    const older = gradeCard(card('older'), Rating.Good, NOW);
    const newer = gradeCard(card('newer'), Rating.Easy, NOW);
    const order = dueCards([newer, older], at(400 * DAY)).map(
      (entry) => entry.front,
    );
    expect(order).toEqual(['older', 'newer']);
  });
});

describe('formatInterval', () => {
  it.each([
    [30 * 1000, '<1m'],
    [10 * MINUTE, '10m'],
    [3 * HOUR, '3h'],
    [4 * DAY, '4d'],
    [45 * DAY, '1.5mo'],
    [2 * 365 * DAY, '2y'],
  ])('formats %ims as %s', (ms, expected) => {
    expect(formatInterval(ms)).toBe(expected);
  });
});

describe('formatDue', () => {
  it('calls a new card new', () => {
    expect(formatDue(card(), NOW)).toBe('new');
  });

  it('reports an overdue card as due now', () => {
    const graded = gradeCard(card(), Rating.Good, NOW);
    expect(formatDue(graded, at(400 * DAY))).toBe('due now');
  });

  it('reports how long until a scheduled card comes up', () => {
    const graded = gradeCard(card(), Rating.Easy, NOW);
    expect(formatDue(graded, NOW)).toMatch(/^in /);
  });
});
