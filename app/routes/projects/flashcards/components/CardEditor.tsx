import { useState } from 'react';

import Markdown from '~/components/Markdown';
import { cn } from '~/utils';

import { normaliseTags } from '../store';
import {
  buttonPrimary,
  buttonQuiet,
  buttonSecondary,
  hintClasses,
  inputClasses,
} from '../styles';
import type { Flashcard } from '../types';
import MarkdownInput from './MarkdownInput';

export interface CardEditorProps {
  card: Flashcard;
  onSave: (card: Flashcard) => void;
  onCancel: () => void;
}

export default function CardEditor({
  card,
  onSave,
  onCancel,
}: CardEditorProps) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [tagText, setTagText] = useState(card.tags.join(' '));
  // Off by default: the editor highlights as you type, so the preview is only
  // needed to check that something like a block of maths actually renders.
  const [preview, setPreview] = useState(false);

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
      <div className={cn('grid gap-3', preview && 'lg:grid-cols-2')}>
        <div className="space-y-3">
          <Field label="Front">
            <MarkdownInput
              value={front}
              onChange={setFront}
              ariaLabel="Front of the card"
              rows={3}
            />
          </Field>
          <Field label="Back">
            <MarkdownInput
              value={back}
              onChange={setBack}
              ariaLabel="Back of the card"
              rows={3}
            />
          </Field>
          <Field label="Tags">
            <input
              type="text"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="geography capitals"
              className={cn(inputClasses, 'font-writer text-base')}
            />
          </Field>
        </div>

        {preview && (
          <div className="space-y-3">
            <Preview label="Front preview" content={front} />
            <Preview label="Back preview" content={back} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          aria-pressed={preview}
          className={buttonQuiet}
        >
          {preview ? 'Hide preview' : 'Preview'}
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
    <div className="space-y-1">
      <span
        className="block text-xs font-medium text-gray-600 dark:text-gray-400"
      >
        {label}
      </span>
      {children}
    </div>
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
