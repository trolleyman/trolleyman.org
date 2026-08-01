/**
 * Spaced repetition scheduling, wrapping ts-fsrs.
 *
 * Pure and free of browser APIs so it can be unit tested and, if the storage
 * ever moves server side, reused there unchanged. `now` is always passed in
 * rather than read from the clock, which keeps the tests deterministic.
 */
import { Rating, State, createEmptyCard, fsrs, type Grade } from 'ts-fsrs';

import type { Flashcard, SrsState } from './types';

/**
 * Fuzz randomises intervals by a few percent to stop cards clumping together on
 * the same day. It is off here so that the interval shown on a grade button is
 * exactly the interval the card gets when you press it.
 */
const scheduler = fsrs({ enable_fuzz: false });

/** The four grades, in the order they are shown to the user. */
export const GRADES: Grade[] = [
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
];

export const GRADE_LABELS: Record<Grade, string> = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy',
};

function toSrsState(card: {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: Date;
}): SrsState {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString(),
  };
}

export function newSrsState(now: Date): SrsState {
  return toSrsState(createEmptyCard(now));
}

/** Applies a grade to a card, returning a new card with updated scheduling. */
export function gradeCard(card: Flashcard, grade: Grade, now: Date): Flashcard {
  const { card: next } = scheduler.next(card.srs, now, grade);
  return { ...card, srs: toSrsState(next) };
}

/**
 * What each grade would do to this card, as a display string like "10m" or
 * "4d". Used to label the grade buttons the way Anki does.
 */
export function gradeIntervals(
  card: Flashcard,
  now: Date,
): Record<Grade, string> {
  const preview = scheduler.repeat(card.srs, now);
  const result = {} as Record<Grade, string>;
  for (const grade of GRADES) {
    result[grade] = formatInterval(
      preview[grade].card.due.getTime() - now.getTime(),
    );
  }
  return result;
}

export function isDue(card: Flashcard, now: Date): boolean {
  return new Date(card.srs.due).getTime() <= now.getTime();
}

/**
 * Cards ready to review, most overdue first. New cards sort last so that
 * revision of existing material happens before new material is introduced.
 */
export function dueCards(cards: Flashcard[], now: Date): Flashcard[] {
  return cards
    .filter((card) => isDue(card, now))
    .sort((a, b) => {
      const aNew = a.srs.state === State.New;
      const bNew = b.srs.state === State.New;
      if (aNew !== bNew) return aNew ? 1 : -1;
      return new Date(a.srs.due).getTime() - new Date(b.srs.due).getTime();
    });
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Formats a duration in milliseconds the way Anki labels its buttons. */
export function formatInterval(ms: number): string {
  if (ms < MINUTE) return '<1m';
  if (ms < HOUR) return `${Math.round(ms / MINUTE)}m`;
  if (ms < DAY) return `${Math.round(ms / HOUR)}h`;
  if (ms < MONTH) return `${Math.round(ms / DAY)}d`;
  if (ms < YEAR) return `${round1(ms / MONTH)}mo`;
  return `${round1(ms / YEAR)}y`;
}

function round1(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

/** Human readable "when is this card next due" for the card list. */
export function formatDue(card: Flashcard, now: Date): string {
  if (card.srs.state === State.New) return 'new';
  const delta = new Date(card.srs.due).getTime() - now.getTime();
  if (delta <= 0) return 'due now';
  return `in ${formatInterval(delta)}`;
}
