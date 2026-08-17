/**
 * localStorage persistence.
 *
 * This is the only file that knows where cards actually live. Swapping it for a
 * database adapter later means implementing the same two functions against a
 * fetch call and making them async, without touching anything else.
 *
 * It sits under `.client/` so it is stripped from the server bundle, matching
 * the convention used by the Flappy demo. Nothing here may run during render or
 * prerendering, only from effects and event handlers.
 */
import { parseCollection } from '../store';
import { emptyCollection, type Collection } from '../types';

const STORAGE_KEY = 'trolleyman.flashcards';

/**
 * Reads the collection, falling back to an empty one if storage is unavailable
 * (private browsing, storage disabled) or the stored value is unreadable. Cards
 * are worth preserving but not worth breaking the page over.
 */
export function loadCollection(now: Date): Collection {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyCollection();
  }
  if (!stored) return emptyCollection();

  try {
    return parseCollection(JSON.parse(stored), now);
  } catch {
    return emptyCollection();
  }
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export function saveCollection(collection: Collection): SaveResult {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    return { ok: true };
  } catch (error) {
    const quotaExceeded =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {
      ok: false,
      error: quotaExceeded
        ? 'Out of browser storage. Export your cards and remove some.'
        : 'Could not save to this browser. Changes will be lost on reload.',
    };
  }
}
