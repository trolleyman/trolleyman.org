import { type RefObject } from 'react';

import Markdown from '~/components/Markdown';
import { cn } from '~/utils';

import { hintClasses } from '../styles';

export interface StackedCard {
  id: string;
  front: string;
  back: string;
}

export interface AddedStackProps {
  /** Most recently added first. */
  cards: StackedCard[];
  deckRef: RefObject<HTMLDivElement | null>;
}

/** How many cards of the pile are drawn. Anything deeper is not visible anyway. */
const VISIBLE = 3;

/**
 * The pile that added cards land on, showing each one rendered rather than as
 * the markdown that was typed. It is always in the layout, even when empty, so
 * that the flight animation has somewhere to aim at from the very first card.
 */
export default function AddedStack({ cards, deckRef }: AddedStackProps) {
  const visible = cards.slice(0, VISIBLE);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Added
        </span>
        {cards.length > 0 && (
          <span className={hintClasses}>{cards.length} this session</span>
        )}
      </div>

      <div ref={deckRef} className="relative h-28">
        {visible.length === 0 ? (
          <div
            className="flex h-20 items-center justify-center rounded-lg border
              border-dashed border-gray-300 dark:border-gray-600"
          >
            <span className={hintClasses}>Cards you add land here.</span>
          </div>
        ) : (
          visible.map((card, index) => (
            <div
              key={card.id}
              className={cn(
                `absolute inset-x-0 top-0 h-20 overflow-hidden rounded-lg border
                  border-gray-200 bg-white px-3 py-2 dark:border-gray-700
                  dark:bg-gray-800`,
                // Only the card on top animates in; the ones beneath it are
                // just sliding down a step, which the transition covers.
                index === 0 && 'motion-safe:animate-[land_260ms_ease-out]',
              )}
              style={{
                zIndex: VISIBLE - index,
                // Each card below peeks out at the bottom and is inset a little
                // at the sides, which is what reads as a pile rather than as one
                // card with a shadow.
                transform: `translateY(${index * 10}px) scale(${1 - index * 0.03})`,
                opacity: 1 - index * 0.25,
                transition: 'transform 260ms ease-out, opacity 260ms ease-out',
              }}
            >
              <div className="pointer-events-none overflow-hidden">
                <Markdown className="prose-sm">{card.front}</Markdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
