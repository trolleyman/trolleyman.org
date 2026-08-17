import { useRef, useState } from 'react';

import { cn } from '~/utils';

import { exportCollection, parseCollection } from '../store';
import { buttonSecondary, hintClasses } from '../styles';
import type { Flashcard } from '../types';

export interface ImportExportProps {
  cards: Flashcard[];
  onImport: (cards: Flashcard[]) => void;
}

/**
 * Cards live in this browser only, so a file export is both the backup and the
 * way to move a collection between devices.
 */
export default function ImportExport({ cards, onImport }: ImportExportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function download() {
    const blob = new Blob([exportCollection(cards)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `flashcards-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    setMessage(null);
    setError(null);
    try {
      const imported = parseCollection(
        JSON.parse(await file.text()),
        new Date(),
      );
      // Merging rather than replacing, because there is no undo here and
      // silently wiping a collection would be an unpleasant surprise.
      const existing = new Set(cards.map((card) => card.id));
      const added = imported.cards.filter((card) => !existing.has(card.id));
      onImport([...cards, ...added]);
      setMessage(
        added.length === 0
          ? 'Those cards are already here.'
          : `Added ${added.length} ${added.length === 1 ? 'card' : 'cards'}.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not read that file.',
      );
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={download}
          disabled={cards.length === 0}
          className={buttonSecondary}
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={buttonSecondary}
        >
          Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
            event.target.value = '';
          }}
        />
        {message && (
          <span className="text-xs text-green-600 dark:text-green-400">
            {message}
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
      <p className={cn(hintClasses)}>
        Importing adds to what is already here, it never replaces it.
      </p>
    </div>
  );
}
