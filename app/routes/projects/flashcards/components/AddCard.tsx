import { useRef, useState, type RefObject } from 'react';

import { cn } from '~/utils';

import { normaliseTags, type TagCount } from '../store';
import { buttonPrimary, hintClasses, inputClasses } from '../styles';
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
  const [added, setAdded] = useState(0);
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);

  const tags = normaliseTags(tagText.split(/[\s,]+/));
  const ready = front.trim().length > 0 && back.trim().length > 0;

  function submit() {
    if (!ready) return;
    onAdd(front.trim(), back.trim(), tags);
    setFront('');
    setBack('');
    setAdded((count) => count + 1);
    frontRef.current?.focus();
  }

  /**
   * Enter advances and then commits, shift + enter inserts a newline. Enter
   * rather than tab because a phone's on screen keyboard reliably has a return
   * key and mostly does not have a tab key. Tab still works as usual for anyone
   * who prefers it, since these are ordinary focusable fields.
   */
  function onFrontKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (front.trim()) backRef.current?.focus();
    }
  }

  function onBackKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
    // An empty answer with the cursor at the start means the last keystroke was
    // probably a mistake, so step back rather than swallowing it.
    if (event.key === 'Backspace' && back.length === 0) {
      event.preventDefault();
      frontRef.current?.focus();
    }
  }

  /**
   * Inserts a line break at the caret. Enter is spoken for by the add flow and
   * a phone's on screen keyboard has no shift, so without this there would be
   * no way to write a multi-line card on mobile at all.
   */
  function insertNewline(
    ref: RefObject<HTMLTextAreaElement | null>,
    value: string,
    setValue: (next: string) => void,
  ) {
    const field = ref.current;
    if (!field) return;
    const start = field.selectionStart ?? value.length;
    const end = field.selectionEnd ?? start;
    // Focus synchronously, while still inside the click, or a mobile browser
    // will refuse to bring the keyboard back up.
    field.focus();
    setValue(`${value.slice(0, start)}\n${value.slice(end)}`);
    requestAnimationFrame(() => field.setSelectionRange(start + 1, start + 1));
  }

  function toggleTag(tag: string) {
    const next = tags.includes(tag)
      ? tags.filter((existing) => existing !== tag)
      : [...tags, tag];
    onTagTextChange(next.join(' '));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label onNewline={() => insertNewline(frontRef, front, setFront)}>
          Front
        </Label>
        <MarkdownInput
          value={front}
          onChange={setFront}
          onKeyDown={onFrontKeyDown}
          placeholder="capital of France"
          ariaLabel="Front of the card"
          inputRef={frontRef}
          rows={2}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label onNewline={() => insertNewline(backRef, back, setBack)}>
          Back
        </Label>
        <MarkdownInput
          value={back}
          onChange={setBack}
          onKeyDown={onBackKeyDown}
          placeholder="Paris"
          ariaLabel="Back of the card"
          inputRef={backRef}
          rows={2}
        />
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
        <p className={hintClasses}>
          Enter moves to the answer and then adds the card. For a line break use
          new line above, or shift and enter.
        </p>
        {added > 0 && (
          <span className="text-xs text-green-600 dark:text-green-400">
            {added} added
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The fields themselves carry an aria-label, since a `label` cannot point at
 * the textarea inside MarkdownInput without threading an id through it. This is
 * the visible caption, plus the line break control that sits alongside it.
 */
function Label({
  children,
  onNewline,
}: React.PropsWithChildren<{ onNewline: () => void }>) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        aria-hidden
        className="block text-xs font-medium text-gray-600 dark:text-gray-400"
      >
        {children}
      </span>
      <button
        type="button"
        // Keep the caret where it is: without this the field blurs on press and
        // the insertion point is lost before the click even lands.
        onMouseDown={(event) => event.preventDefault()}
        onClick={onNewline}
        className="text-xs text-gray-500 underline decoration-gray-400
          hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        new line
      </button>
    </div>
  );
}
