/**
 * Core flashcard types.
 *
 * Everything here is JSON-safe so the whole collection can round-trip through
 * localStorage (and later, a database) without a serialization layer. Dates are
 * ISO strings rather than Date objects for the same reason.
 */

/**
 * Scheduling state for a single card.
 *
 * The field names are snake_case because they map 1:1 onto the `CardInput`
 * shape that ts-fsrs accepts, which lets us hand a stored card straight to the
 * scheduler without converting field by field.
 */
export interface SrsState {
  /** ISO timestamp of when this card is next due. */
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  /** ts-fsrs State: 0 new, 1 learning, 2 review, 3 relearning. */
  state: number;
  /** ISO timestamp of the last review, absent if never reviewed. */
  last_review?: string;
}

export interface Flashcard {
  id: string;
  /** Markdown, may contain `$…$` / `$$…$$` math. */
  front: string;
  /** Markdown, may contain `$…$` / `$$…$$` math. */
  back: string;
  tags: string[];
  /** ISO timestamp. */
  createdAt: string;
  srs: SrsState;
}

/** The whole collection, as stored. */
export interface Collection {
  /** Bumped when the on-disk shape changes so old data can be migrated. */
  version: number;
  cards: Flashcard[];
}

export const COLLECTION_VERSION = 1;

export function emptyCollection(): Collection {
  return { version: COLLECTION_VERSION, cards: [] };
}
