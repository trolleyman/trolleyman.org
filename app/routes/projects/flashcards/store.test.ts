import { describe, expect, it } from 'vitest';

import {
  createCard,
  filterByTags,
  normaliseTag,
  normaliseTags,
  parseCollection,
  parseQuickAdd,
  removeCard,
  searchCards,
  tagCounts,
  upsertCard,
} from './store';
import type { Flashcard } from './types';

const NOW = new Date('2026-01-01T12:00:00.000Z');

function card(front: string, tags: string[] = []): Flashcard {
  return createCard(front, `${front} answer`, tags, NOW);
}

describe('normaliseTag', () => {
  it('lowercases and hyphenates', () => {
    expect(normaliseTag('  Past Tense ')).toBe('past-tense');
  });

  it('collapses runs of whitespace', () => {
    expect(normaliseTag('a   b')).toBe('a-b');
  });
});

describe('normaliseTags', () => {
  it('deduplicates after normalising and sorts', () => {
    expect(normaliseTags(['Maths', 'maths', 'Algebra'])).toEqual([
      'algebra',
      'maths',
    ]);
  });

  it('drops empty tags', () => {
    expect(normaliseTags(['', '  ', 'ok'])).toEqual(['ok']);
  });
});

describe('parseQuickAdd', () => {
  it('splits on the first ::', () => {
    expect(parseQuickAdd('capital of France :: Paris')).toEqual({
      front: 'capital of France',
      back: 'Paris',
      tags: [],
    });
  });

  it('pulls trailing tags off the back', () => {
    expect(parseQuickAdd('a :: b #geo #capitals')).toEqual({
      front: 'a',
      back: 'b',
      tags: ['capitals', 'geo'],
    });
  });

  it('leaves a hash inside the answer alone', () => {
    expect(parseQuickAdd('include guard :: #include <stdio.h>')).toEqual({
      front: 'include guard',
      back: '#include <stdio.h>',
      tags: [],
    });
  });

  it('only takes hashes in an unbroken run at the end', () => {
    const result = parseQuickAdd('a :: see #1 below #tag');
    expect(result?.back).toBe('see #1 below');
    expect(result?.tags).toEqual(['tag']);
  });

  it('keeps later :: in the answer', () => {
    expect(parseQuickAdd('scope :: std::vector')?.back).toBe('std::vector');
  });

  it('returns null without a separator', () => {
    expect(parseQuickAdd('just some text')).toBeNull();
  });

  it('returns null when either side is empty', () => {
    expect(parseQuickAdd(':: b')).toBeNull();
    expect(parseQuickAdd('a ::')).toBeNull();
    expect(parseQuickAdd('   ')).toBeNull();
  });

  it('normalises the tags it finds', () => {
    expect(parseQuickAdd('a :: b #Maths #maths')?.tags).toEqual(['maths']);
  });
});

describe('createCard', () => {
  it('trims both sides and normalises tags', () => {
    const created = createCard('  front  ', '  back  ', ['B', 'a'], NOW);
    expect(created.front).toBe('front');
    expect(created.back).toBe('back');
    expect(created.tags).toEqual(['a', 'b']);
  });

  it('starts due immediately so new cards can be studied at once', () => {
    expect(
      new Date(createCard('a', 'b', [], NOW).srs.due).getTime(),
    ).toBeLessThanOrEqual(NOW.getTime());
  });
});

describe('upsertCard', () => {
  it('appends a card that is not there yet', () => {
    const a = card('a');
    expect(upsertCard([], a)).toEqual([a]);
  });

  it('replaces in place, preserving order', () => {
    const [a, b] = [card('a'), card('b')];
    const edited = { ...a, front: 'edited' };
    expect(upsertCard([a, b], edited)).toEqual([edited, b]);
  });
});

describe('removeCard', () => {
  it('drops only the matching id', () => {
    const [a, b] = [card('a'), card('b')];
    expect(removeCard([a, b], a.id)).toEqual([b]);
  });
});

describe('tagCounts', () => {
  it('counts each tag and sorts by frequency then name', () => {
    const cards = [card('a', ['x']), card('b', ['x', 'y']), card('c', ['y'])];
    expect(tagCounts(cards)).toEqual([
      { tag: 'x', count: 2 },
      { tag: 'y', count: 2 },
    ]);
  });

  it('is empty when nothing is tagged', () => {
    expect(tagCounts([card('a')])).toEqual([]);
  });
});

describe('filterByTags', () => {
  const cards = [card('a', ['x']), card('b', ['x', 'y']), card('c', ['y'])];

  it('returns everything for an empty selection', () => {
    expect(filterByTags(cards, [])).toHaveLength(3);
  });

  it('requires every selected tag', () => {
    const result = filterByTags(cards, ['x', 'y']);
    expect(result.map((entry) => entry.front)).toEqual(['b']);
  });
});

describe('searchCards', () => {
  const cards = [card('photosynthesis', ['biology']), card('mitosis')];

  it('matches the front', () => {
    expect(searchCards(cards, 'photo')).toHaveLength(1);
  });

  it('matches the back', () => {
    expect(searchCards(cards, 'mitosis answer')).toHaveLength(1);
  });

  it('matches tags', () => {
    expect(searchCards(cards, 'biology')).toHaveLength(1);
  });

  it('ignores case and surrounding space', () => {
    expect(searchCards(cards, '  MITOSIS ')).toHaveLength(1);
  });

  it('returns everything for an empty query', () => {
    expect(searchCards(cards, '')).toHaveLength(2);
  });
});

describe('parseCollection', () => {
  it('round-trips a collection', () => {
    const cards = [card('a', ['x'])];
    const parsed = parseCollection(JSON.parse(JSON.stringify({ cards })), NOW);
    expect(parsed.cards).toEqual(cards);
  });

  it('rejects a non-object', () => {
    expect(() => parseCollection('nope', NOW)).toThrow();
  });

  it('rejects an object with no cards array', () => {
    expect(() => parseCollection({ version: 1 }, NOW)).toThrow();
  });

  it('accepts a bare list of fronts and backs', () => {
    const parsed = parseCollection({ cards: [{ front: 'a', back: 'b' }] }, NOW);
    expect(parsed.cards).toHaveLength(1);
    expect(parsed.cards[0].id).toBeTruthy();
    expect(parsed.cards[0].srs.reps).toBe(0);
  });

  it('skips entries missing a side, and throws if that leaves nothing', () => {
    expect(() => parseCollection({ cards: [{ front: 'a' }] }, NOW)).toThrow();
  });

  it('allows a genuinely empty collection', () => {
    expect(parseCollection({ cards: [] }, NOW).cards).toEqual([]);
  });
});
