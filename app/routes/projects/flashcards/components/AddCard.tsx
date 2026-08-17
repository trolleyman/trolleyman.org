import { useCallback, useRef, useState } from 'react';

import { cn } from '~/utils';

import { newId, normaliseTags, type TagCount } from '../store';
import { buttonPrimary, hintClasses, inputClasses } from '../styles';
import AddedStack, { type StackedCard } from './AddedStack';
import CardFlight, { type Flight } from './CardFlight';
import MarkdownInput from './MarkdownInput';

export interface AddCardProps {
  onAdd: (front: string, back: string, tags: string[]) => void;
  /**
   * Raw tag text, held by the page rather than here so that it survives moving
   * between views. Tags are sticky on purpose: entering a run of cards on one
   * topic should mean typing the tags once.
   */
  tagText: string;
  onTagTextChange: (value: string) => void;
  knownTags: TagCount[];
}

export default function AddCard({
  onAdd,
  tagText,
  onTagTextChange,
  knownTags,
}: AddCardProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [stack, setStack] = useState<StackedCard[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  const tags = normaliseTags(tagText.split(/[\s,]+/));
  const ready = front.trim().length > 0 && back.trim().length > 0;

  function submit() {
    if (!ready) return;
    const card: StackedCard = {
      id: newId(),
      front: front.trim(),
      back: back.trim(),
    };
    onAdd(card.front, card.back, tags);

    // Measure before clearing the fields, while they are still the size the
    // card should fly from.
    const origin = fieldsRef.current?.getBoundingClientRect();
    if (origin) {
      setFlights((current) => [
        ...current,
        {
          ...card,
          from: {
            top: origin.top,
            left: origin.left,
            width: origin.width,
            height: origin.height,
          },
        },
      ]);
    } else {
      setStack((current) => [card, ...current]);
    }

    setFront('');
    setBack('');
    frontRef.current?.focus();
  }

  /**
   * The card reaches the pile, so the pile is what shows it from now on.
   * Stable, so a flight in progress never sees a stale version of it.
   */
  const land = useCallback((flight: Flight) => {
    setStack((cards) =>
      // Idempotent on purpose. React runs effects twice in development, and the
      // reduced motion path reports back from inside the effect rather than
      // from an animation, so this would otherwise stack the card twice.
      cards.some((card) => card.id === flight.id)
        ? cards
        : [{ id: flight.id, front: flight.front, back: flight.back }, ...cards],
    );
    setFlights((current) =>
      current.filter((pending) => pending.id !== flight.id),
    );
  }, []);

  /**
   * Enter inserts a line break, the way an ordinary textarea does, so writing a
   * multi-line card needs nothing special and works the same on a phone. Moving
   * between the fields is left to tapping them, tab, or the up and down arrows
   * that iOS puts above its keyboard, and adding is the button's job.
   *
   * The one shortcut is the conventional one: ctrl or cmd with enter submits,
   * which no on screen keyboard can produce and so takes nothing away.
   */
  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }

  function toggleTag(tag: string) {
    const next = tags.includes(tag)
      ? tags.filter((existing) => existing !== tag)
      : [...tags, tag];
    onTagTextChange(next.join(' '));
  }

  return (
    <div className="space-y-4">
      {/* The flight is measured from this box, so it wraps both fields. */}
      <div ref={fieldsRef} className="space-y-4">
        <div className="space-y-2">
          <Label>Front</Label>
          <MarkdownInput
            value={front}
            onChange={setFront}
            onKeyDown={onKeyDown}
            placeholder="capital of France"
            ariaLabel="Front of the card"
            inputRef={frontRef}
            rows={2}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>Back</Label>
          <MarkdownInput
            value={back}
            onChange={setBack}
            onKeyDown={onKeyDown}
            placeholder="Paris"
            ariaLabel="Back of the card"
            inputRef={backRef}
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="add-tags"
          className="block text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          Tags
        </label>
        <input
          id="add-tags"
          type="text"
          value={tagText}
          onChange={(event) => onTagTextChange(event.target.value)}
          placeholder="geography capitals"
          className={cn(inputClasses, 'font-writer text-base')}
        />
        {knownTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {knownTags.map(({ tag }) => (
              <button
                key={tag}
                type="button"
                aria-pressed={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
                className={cn(
                  `rounded-full px-2.5 py-0.5 text-xs font-medium
                  transition-colors`,
                  tags.includes(tag)
                    ? `bg-blue-600 text-white dark:bg-blue-500
                      dark:text-gray-900`
                    : `bg-blue-100 text-blue-800 hover:bg-blue-200
                      dark:bg-blue-900 dark:text-blue-200
                      dark:hover:bg-blue-800`,
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          className={buttonPrimary}
        >
          Add card
        </button>
        <p className={hintClasses}>Ctrl or cmd with enter adds the card too.</p>
      </div>

      <AddedStack cards={stack} deckRef={deckRef} />

      {/*
        Announced politely rather than through the animation, which is
        decorative and invisible to a screen reader.
      */}
      <p aria-live="polite" className="sr-only">
        {stack.length > 0
          ? `Card added, ${stack.length} ${stack.length === 1 ? 'card' : 'cards'} this session.`
          : ''}
      </p>

      {flights.map((flight) => (
        <CardFlight
          key={flight.id}
          flight={flight}
          deckRef={deckRef}
          onDone={land}
        />
      ))}
    </div>
  );
}

/**
 * The fields themselves carry an aria-label, since a `label` cannot point at
 * the textarea inside MarkdownInput without threading an id through it. This is
 * the visible caption only.
 */
function Label({ children }: React.PropsWithChildren) {
  return (
    <span
      aria-hidden
      className="block text-xs font-medium text-gray-600 dark:text-gray-400"
    >
      {children}
    </span>
  );
}
