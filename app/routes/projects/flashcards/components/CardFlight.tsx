import { useLayoutEffect, useRef, type RefObject } from 'react';

import Markdown from '~/components/Markdown';

export interface Flight {
  id: string;
  front: string;
  back: string;
  /** Where the card started, in viewport coordinates. */
  from: { top: number; left: number; width: number; height: number };
}

export interface CardFlightProps {
  flight: Flight;
  deckRef: RefObject<HTMLDivElement | null>;
  /** Passes the flight back rather than its id, so the handler needs no lookup and can stay stable. */
  onDone: (flight: Flight) => void;
}

const DURATION = 460;

/**
 * The card that flies from the fields onto the pile when one is added.
 *
 * It is fixed positioned over the page and never in the layout, so nothing
 * moves to make room for it and it cannot disturb the editor underneath. The
 * animation runs through the Web Animations API rather than a CSS class,
 * because the distance depends on where the fields and the pile happen to be
 * on screen and can only be known at the moment of adding.
 */
export default function CardFlight({
  flight,
  deckRef,
  onDone,
}: CardFlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const deck = deckRef.current;
    const finish = () => onDone(flight);

    const reduced =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!element || !deck || reduced || typeof element.animate !== 'function') {
      finish();
      return;
    }

    const to = deck.getBoundingClientRect();
    const { from } = flight;
    const scale = Math.min(1, to.width / from.width);
    // Aim at the top of the pile rather than its middle, since that is where a
    // newly added card actually comes to rest.
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + 12 - from.top;

    const animation = element.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate3d(${dx * 0.45}px, ${dy * 0.45}px, 0) scale(${(1 + scale) / 2}) rotate(-1.5deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale}) rotate(0deg)`,
          opacity: 0,
        },
      ],
      { duration: DURATION, easing: 'cubic-bezier(0.32, 0.72, 0.35, 1)' },
    );

    animation.finished.then(finish, () => {
      // Rejects when cancelled on unmount, which needs no follow up.
    });
    return () => animation.cancel();
    // Mount only: a flight is created for one card and never retargeted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed z-50 overflow-hidden rounded-lg
        border border-blue-400 bg-white px-3 py-2 shadow-lg dark:border-blue-500
        dark:bg-gray-800"
      style={{
        top: flight.from.top,
        left: flight.from.left,
        width: flight.from.width,
        maxHeight: flight.from.height,
      }}
    >
      <Markdown className="prose-sm">{flight.front}</Markdown>
    </div>
  );
}
