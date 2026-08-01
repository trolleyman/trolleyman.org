import { useCallback, useEffect, useRef, useState } from 'react';
import type { Grade } from 'ts-fsrs';

import { loadCollection, saveCollection } from './.client/persist';
import { gradeCard as applyGrade } from './scheduler';
import { createCard, removeCard, upsertCard } from './store';
import { COLLECTION_VERSION, type Flashcard } from './types';

export interface FlashcardsApi {
  cards: Flashcard[];
  /**
   * False until the first read from storage has happened. The page renders a
   * placeholder until then, because storage is not readable during prerendering
   * and reading it during render would desync hydration.
   */
  loaded: boolean;
  saveError: string | null;
  add: (front: string, back: string, tags: string[]) => Flashcard;
  update: (card: Flashcard) => void;
  remove: (id: string) => void;
  grade: (id: string, grade: Grade) => void;
  replaceAll: (cards: Flashcard[]) => void;
}

export function useFlashcards(): FlashcardsApi {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setCards(loadCollection(new Date()).cards);
    setLoaded(true);
  }, []);

  // Persist on every change, but not before the first read has landed, or the
  // empty initial state would overwrite whatever is already stored.
  const skippedFirstSave = useRef(false);
  useEffect(() => {
    if (!loaded) return;
    if (!skippedFirstSave.current) {
      skippedFirstSave.current = true;
      return;
    }
    const result = saveCollection({ version: COLLECTION_VERSION, cards });
    setSaveError(result.ok ? null : result.error);
  }, [cards, loaded]);

  const add = useCallback((front: string, back: string, tags: string[]) => {
    const card = createCard(front, back, tags, new Date());
    setCards((current) => [...current, card]);
    return card;
  }, []);

  const update = useCallback((card: Flashcard) => {
    setCards((current) => upsertCard(current, card));
  }, []);

  const remove = useCallback((id: string) => {
    setCards((current) => removeCard(current, id));
  }, []);

  const grade = useCallback((id: string, grade: Grade) => {
    const now = new Date();
    setCards((current) =>
      current.map((card) =>
        card.id === id ? applyGrade(card, grade, now) : card,
      ),
    );
  }, []);

  const replaceAll = useCallback((next: Flashcard[]) => {
    setCards(next);
  }, []);

  return { cards, loaded, saveError, add, update, remove, grade, replaceAll };
}
