import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rating, type Grade } from 'ts-fsrs';

import Markdown from '~/components/Markdown';
import { cn } from '~/utils';

import {
  GRADES,
  GRADE_LABELS,
  dueCards,
  formatInterval,
  gradeIntervals,
} from '../scheduler';
import {
  buttonBase,
  buttonPrimary,
  buttonSecondary,
  hintClasses,
  panelClasses,
} from '../styles';
import type { Flashcard } from '../types';

export interface StudyViewProps {
  /** The cards in scope, already narrowed by the tag filter. */
  cards: Flashcard[];
  onGrade: (id: string, grade: Grade) => void;
  /**
   * Changes whenever the pool of cards being studied changes, which starts a
   * fresh queue. Grading a card must not change this, or the queue would
   * rebuild underneath the user on every answer.
   */
  sessionKey: string;
}

const GRADE_STYLES: Record<Grade, string> = {
  [Rating.Again]: `bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/60
    dark:text-red-200 dark:hover:bg-red-900`,
  [Rating.Hard]: `bg-amber-100 text-amber-800 hover:bg-amber-200
    dark:bg-amber-900/60 dark:text-amber-200 dark:hover:bg-amber-900`,
  [Rating.Good]: `bg-green-100 text-green-800 hover:bg-green-200
    dark:bg-green-900/60 dark:text-green-200 dark:hover:bg-green-900`,
  [Rating.Easy]: `bg-blue-100 text-blue-800 hover:bg-blue-200
    dark:bg-blue-900/60 dark:text-blue-200 dark:hover:bg-blue-900`,
};

export default function StudyView({
  cards,
  onGrade,
  sessionKey,
}: StudyViewProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  // The queue is a snapshot taken when a session starts, so that answering a
  // card does not rebuild it underneath the user. Reading the cards through a
  // ref keeps `startSession` stable while still seeing the current collection,
  // which is what makes "Check again" pick up cards graded since the session
  // began rather than replaying a stale snapshot.
  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  const startSession = useCallback(() => {
    setQueue(dueCards(cardsRef.current, new Date()).map((card) => card.id));
    setRevealed(false);
    setReviewed(0);
  }, []);

  useEffect(startSession, [startSession, sessionKey]);

  const byId = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards],
  );

  // Skip over anything deleted while the session was open.
  const currentId = queue.find((id) => byId.has(id));
  const current = currentId ? byId.get(currentId) : undefined;

  const intervals = useMemo(
    () => (current && revealed ? gradeIntervals(current, new Date()) : null),
    [current, revealed],
  );

  const answer = useCallback(
    (grade: Grade) => {
      if (!current) return;
      onGrade(current.id, grade);
      setReviewed((count) => count + 1);
      setRevealed(false);
      setQueue((currentQueue) => {
        const rest = currentQueue.filter((id) => id !== current.id);
        // A forgotten card comes back before the session ends, the way Anki
        // keeps relearning cards in the current sitting.
        return grade === Rating.Again ? [...rest, current.id] : rest;
      });
    },
    [current, onGrade],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      if (!current) return;

      if (!revealed) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          setRevealed(true);
        }
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        answer(Rating.Good);
        return;
      }
      const index = Number(event.key);
      if (index >= 1 && index <= GRADES.length) {
        event.preventDefault();
        answer(GRADES[index - 1]);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [answer, current, revealed]);

  if (cards.length === 0) {
    return (
      <Empty>Nothing to study. Add a card, or clear the tag filter.</Empty>
    );
  }

  if (!current) {
    return (
      <Empty>
        <p className="text-gray-900 dark:text-gray-100">
          {reviewed > 0
            ? `Done, ${reviewed} ${reviewed === 1 ? 'card' : 'cards'} reviewed.`
            : 'Nothing due right now.'}
        </p>
        <NextDue cards={cards} />
        <button
          type="button"
          onClick={startSession}
          className={cn(buttonSecondary, 'mt-4')}
        >
          Check again
        </button>
      </Empty>
    );
  }

  const remaining = queue.filter((id) => byId.has(id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {remaining} left
        </span>
        {reviewed > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            {reviewed} done
          </span>
        )}
      </div>

      <div className={cn(panelClasses, 'p-4 sm:p-6')}>
        <div className="overflow-x-auto">
          <Markdown>{current.front}</Markdown>
        </div>

        {revealed && (
          <>
            <hr className="my-4 border-gray-200 dark:border-gray-600" />
            <div className="overflow-x-auto">
              <Markdown>{current.back}</Markdown>
            </div>
          </>
        )}

        {current.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs
                  text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((grade, index) => (
            <button
              key={grade}
              type="button"
              onClick={() => answer(grade)}
              className={cn(
                buttonBase,
                GRADE_STYLES[grade],
                'flex flex-col items-center gap-0.5 py-3',
              )}
            >
              <span>{GRADE_LABELS[grade]}</span>
              <span className="text-xs font-normal opacity-70">
                {intervals?.[grade]}
              </span>
              <span className="text-xs font-normal opacity-50 max-sm:hidden">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={cn(buttonPrimary, 'w-full py-3')}
        >
          Show answer
        </button>
      )}

      <p className={cn(hintClasses, 'text-center max-sm:hidden')}>
        space to reveal and to answer Good, 1 to 4 for the other grades
      </p>
    </div>
  );
}

function Empty({ children }: React.PropsWithChildren) {
  return (
    <div className={cn(panelClasses, 'space-y-1 p-8 text-center')}>
      {children}
    </div>
  );
}

function NextDue({ cards }: { cards: Flashcard[] }) {
  const now = new Date();
  const upcoming = cards
    .map((card) => new Date(card.srs.due).getTime())
    .filter((due) => due > now.getTime())
    .sort((a, b) => a - b)[0];

  if (upcoming === undefined) return null;
  return (
    <p className={hintClasses}>
      Next card due in {formatInterval(upcoming - now.getTime())}.
    </p>
  );
}
