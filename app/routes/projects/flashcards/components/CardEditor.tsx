import { useState } from 'react';

import Markdown from '~/components/Markdown';
import { cn } from '~/utils';

import { normaliseTags } from '../store';
import {
  buttonPrimary,
  buttonSecondary,
  hintClasses,
  inputClasses,
} from '../styles';
import type { Flashcard } from '../types';

export interface CardEditorProps {
  card: Flashcard;
  onSave: (card: Flashcard) => void;
  onCancel: () => void;
}

/** Full editor for longer cards, with a live preview of the rendered markdown. */
export default function CardEditor({
  card,
  onSave,
  onCancel,
}: CardEditorProps) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [tagText, setTagText] = useState(card.tags.join(' '));

  const canSave = front.trim().length > 0 && back.trim().length > 0;

  function save() {
    if (!canSave) return;
    onSave({
      ...card,
      front: front.trim(),
      back: back.trim(),
      tags: normaliseTags(tagText.split(/[\s,]+/)),
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Front">
            <textarea
              value={front}
              onChange={(event) => setFront(event.target.value)}
              rows={4}
              className={cn(inputClasses, 'font-code resize-y text-sm')}
            />
          </Field>
          <Field label="Back">
            <textarea
              value={back}
              onChange={(event) => setBack(event.target.value)}
              rows={4}
              className={cn(inputClasses, 'font-code resize-y text-sm')}
            />
          </Field>
          <Field label="Tags">
            <input
              type="text"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="geography capitals"
              className={cn(inputClasses, 'font-code text-sm')}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <Preview label="Front preview" content={front} />
          <Preview label="Back preview" content={back} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className={buttonPrimary}
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Cancel
        </button>
        {!canSave && (
          <span className={hintClasses}>
            Both sides need something in them.
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Preview({ label, content }: { label: string; content: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <div
        className="min-h-24 overflow-x-auto rounded-md border border-dashed
          border-gray-300 px-3 py-2 dark:border-gray-600"
      >
        {content.trim() ? (
          <Markdown className="prose-sm">{content}</Markdown>
        ) : (
          <span className={hintClasses}>Nothing to preview yet.</span>
        )}
      </div>
    </div>
  );
}
