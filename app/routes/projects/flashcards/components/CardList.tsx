import { useState } from 'react';

import Markdown from '~/components/Markdown';
import { cn } from '~/utils';

import { formatDue } from '../scheduler';
import {
  buttonDanger,
  buttonQuiet,
  hintClasses,
  panelClasses,
} from '../styles';
import type { Flashcard } from '../types';
import CardEditor from './CardEditor';

export interface CardListProps {
  cards: Flashcard[];
  now: Date;
  onSave: (card: Flashcard) => void;
  onDelete: (id: string) => void;
  onSelectTag: (tag: string) => void;
}

export default function CardList({
  cards,
  now,
  onSave,
  onDelete,
  onSelectTag,
}: CardListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (cards.length === 0) {
    return (
      <p className={cn(hintClasses, 'py-8 text-center')}>No cards here yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {cards.map((card) => (
        <li key={card.id} className={cn(panelClasses, 'p-3 sm:p-4')}>
          {editingId === card.id ? (
            <CardEditor
              card={card}
              onSave={(updated) => {
                onSave(updated);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="overflow-x-auto">
                    <Markdown className="prose-sm">{card.front}</Markdown>
                  </div>
                  <div
                    className="overflow-x-auto border-l-2 border-gray-200 pl-3
                      text-gray-600 dark:border-gray-600 dark:text-gray-400"
                  >
                    <Markdown className="prose-sm">{card.back}</Markdown>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(card.id)}
                    className={cn(buttonQuiet, 'px-2 py-1')}
                  >
                    Edit
                  </button>
                  {confirmingId === card.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(card.id);
                          setConfirmingId(null);
                        }}
                        className={cn(buttonDanger, 'px-2 py-1')}
                      >
                        Really?
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className={cn(buttonQuiet, 'px-2 py-1')}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(card.id)}
                      className={cn(buttonQuiet, 'px-2 py-1')}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {card.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag(tag)}
                    className="rounded-full bg-blue-100 px-2 py-0.5 text-xs
                      font-medium text-blue-800 hover:bg-blue-200
                      dark:bg-blue-900 dark:text-blue-200
                      dark:hover:bg-blue-800"
                  >
                    #{tag}
                  </button>
                ))}
                <span className={cn(hintClasses, 'ml-auto')}>
                  {formatDue(card, now)}
                </span>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
