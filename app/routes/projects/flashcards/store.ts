/**
 * Pure operations over a flashcard collection.
 *
 * No browser APIs and no persistence: this is the layer that would stay
 * identical if the cards moved from localStorage to a database, so keep it
 * free of anything environment specific.
 */
import { newSrsState } from './scheduler';
import {
  COLLECTION_VERSION,
  type Collection,
  type Flashcard,
  emptyCollection,
} from './types';

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Tags are lowercased and whitespace becomes hyphens, so "Past Tense" and "past-tense" are one tag. */
export function normaliseTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '-');
}

export function normaliseTags(raw: string[]): string[] {
  const seen = new Set<string>();
  for (const tag of raw) {
    const normalised = normaliseTag(tag);
    if (normalised) seen.add(normalised);
  }
  return [...seen].sort();
}

export function createCard(
  front: string,
  back: string,
  tags: string[],
  now: Date,
): Flashcard {
  return {
    id: newId(),
    front: front.trim(),
    back: back.trim(),
    tags: normaliseTags(tags),
    createdAt: now.toISOString(),
    srs: newSrsState(now),
  };
}

export function upsertCard(cards: Flashcard[], card: Flashcard): Flashcard[] {
  const index = cards.findIndex((existing) => existing.id === card.id);
  if (index === -1) return [...cards, card];
  const next = [...cards];
  next[index] = card;
  return next;
}

export function removeCard(cards: Flashcard[], id: string): Flashcard[] {
  return cards.filter((card) => card.id !== id);
}

export interface TagCount {
  tag: string;
  count: number;
}

/** Every tag in use, most used first, then alphabetical. */
export function tagCounts(cards: Flashcard[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const card of cards) {
    for (const tag of card.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Cards carrying *all* of the selected tags, matching how a space separated
 * Anki search narrows rather than widens. An empty selection matches everything.
 */
export function filterByTags(
  cards: Flashcard[],
  selected: string[],
): Flashcard[] {
  if (selected.length === 0) return cards;
  return cards.filter((card) =>
    selected.every((tag) => card.tags.includes(tag)),
  );
}

/** Free text search across both sides of the card and its tags. */
export function searchCards(cards: Flashcard[], query: string): Flashcard[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return cards;
  return cards.filter(
    (card) =>
      card.front.toLowerCase().includes(needle) ||
      card.back.toLowerCase().includes(needle) ||
      card.tags.some((tag) => tag.includes(needle)),
  );
}

export interface QuickAddResult {
  front: string;
  back: string;
  tags: string[];
}

/**
 * Parses the one line quick add syntax:
 *
 *     question :: answer #tag1 #tag2
 *
 * Only `#tag` tokens in an unbroken run at the very end are treated as tags, so
 * a `#` inside the answer text (a C preprocessor directive, a markdown heading)
 * is left alone. Returns null if there is no `::` separator or either side is
 * empty, which is what the caller uses to keep the add button disabled.
 */
export function parseQuickAdd(raw: string): QuickAddResult | null {
  let rest = raw.trim();
  if (!rest) return null;

  const tags: string[] = [];
  const trailingTag = /\s+#([\p{L}\p{N}][\p{L}\p{N}_-]*)$/u;
  for (;;) {
    const match = rest.match(trailingTag);
    if (!match || match.index === undefined) break;
    tags.unshift(match[1]);
    rest = rest.slice(0, match.index).trimEnd();
  }

  const separator = rest.indexOf('::');
  if (separator === -1) return null;

  const front = rest.slice(0, separator).trim();
  const back = rest.slice(separator + 2).trim();
  if (!front || !back) return null;

  return { front, back, tags: normaliseTags(tags) };
}

/**
 * Validates parsed JSON from an imported file. Throws on anything structurally
 * wrong; repairs individual cards where a missing field has an obvious default,
 * so a hand written or older export still imports.
 */
export function parseCollection(data: unknown, now: Date): Collection {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected a JSON object.');
  }
  const raw = data as Record<string, unknown>;
  if (!Array.isArray(raw.cards)) {
    throw new Error('Expected a "cards" array.');
  }

  const cards: Flashcard[] = [];
  for (const entry of raw.cards) {
    if (typeof entry !== 'object' || entry === null) continue;
    const card = entry as Record<string, unknown>;
    if (typeof card.front !== 'string' || typeof card.back !== 'string') {
      continue;
    }
    const tags = Array.isArray(card.tags)
      ? normaliseTags(
          card.tags.filter((t): t is string => typeof t === 'string'),
        )
      : [];
    cards.push({
      id: typeof card.id === 'string' ? card.id : newId(),
      front: card.front,
      back: card.back,
      tags,
      createdAt:
        typeof card.createdAt === 'string' ? card.createdAt : now.toISOString(),
      srs: isSrsState(card.srs) ? card.srs : newSrsState(now),
    });
  }

  if (cards.length === 0 && raw.cards.length > 0) {
    throw new Error('No readable cards in that file.');
  }
  return { version: COLLECTION_VERSION, cards };
}

function isSrsState(value: unknown): value is Flashcard['srs'] {
  if (typeof value !== 'object' || value === null) return false;
  const srs = value as Record<string, unknown>;
  return (
    typeof srs.due === 'string' &&
    Number.isFinite(srs.stability) &&
    Number.isFinite(srs.difficulty) &&
    Number.isFinite(srs.reps) &&
    Number.isFinite(srs.state)
  );
}

export function exportCollection(cards: Flashcard[]): string {
  const collection: Collection = { version: COLLECTION_VERSION, cards };
  return JSON.stringify(collection, null, 2);
}

export { emptyCollection };
