import { useEffect, useMemo, useState } from 'react';

import BodyLink from '~/components/BodyLink';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

import { CONTENT_WIDTH_CLASSES } from '..';
import AddCard from './components/AddCard';
import CardList from './components/CardList';
import ImportExport from './components/ImportExport';
import StudyView from './components/StudyView';
import TagFilter from './components/TagFilter';
import { dueCards } from './scheduler';
import { filterByTags, searchCards, tagCounts } from './store';
import { hintClasses, inputClasses, panelClasses } from './styles';
import { useFlashcards } from './useFlashcards';

type View = 'add' | 'study' | 'cards';

export default function Flashcards() {
  const { cards, loaded, saveError, add, update, remove, grade, replaceAll } =
    useFlashcards();
  const [view, setView] = useState<View>('add');
  const [pickedView, setPickedView] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  // Sticky across adds and across views, so a run of cards on one topic only
  // needs the tags typing once.
  const [addTagText, setAddTagText] = useState('');

  const tags = useMemo(() => tagCounts(cards), [cards]);
  const filtered = useMemo(
    () => filterByTags(cards, selectedTags),
    [cards, selectedTags],
  );
  const listed = useMemo(() => searchCards(filtered, query), [filtered, query]);
  const dueCount = useMemo(
    () => (loaded ? dueCards(filtered, new Date()).length : 0),
    [filtered, loaded],
  );

  // Land on adding when there is nothing here yet, otherwise on studying. Only
  // until the first deliberate choice, after which the pick is left alone.
  useEffect(() => {
    if (!loaded || pickedView) return;
    setView(cards.length > 0 ? 'study' : 'add');
    setPickedView(true);
  }, [loaded, pickedView, cards.length]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((existing) => existing !== tag)
        : [...current, tag],
    );
  }

  return (
    <>
      <title>Flashcards - trolleyman.org</title>
      <meta
        name="description"
        content="A small spaced repetition flashcard app with markdown and maths support. Cards are kept in your browser."
      />

      <PageTitle>Flashcards</PageTitle>

      <div className={cn('space-y-6', CONTENT_WIDTH_CLASSES)}>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          A small spaced repetition trainer, in the spirit of{' '}
          <BodyLink to="https://apps.ankiweb.net" external>
            Anki
          </BodyLink>
          . Cards take markdown and{' '}
          <span className="font-code text-sm">$LaTeX$</span> maths, and are
          scheduled with{' '}
          <BodyLink
            to="https://github.com/open-spaced-repetition/ts-fsrs"
            external
          >
            FSRS
          </BodyLink>
          . Everything is stored in this browser, so nothing is uploaded
          anywhere and nothing follows you to another device unless you export
          it.
        </p>

        {!loaded ? (
          <div className={cn(panelClasses, 'p-8 text-center', hintClasses)}>
            Loading your cards.
          </div>
        ) : (
          <>
            {saveError && (
              <p
                className="rounded-md border border-red-300 bg-red-50 px-3 py-2
                  text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40
                  dark:text-red-200"
              >
                {saveError}
              </p>
            )}

            <ViewPicker
              view={view}
              onChange={(next) => {
                setView(next);
                setPickedView(true);
              }}
              dueCount={dueCount}
              total={cards.length}
            />

            {view !== 'add' && (
              <TagFilter
                tags={tags}
                selected={selectedTags}
                onToggle={toggleTag}
                onClear={() => setSelectedTags([])}
              />
            )}

            {view === 'add' && (
              <AddCard
                onAdd={add}
                tagText={addTagText}
                onTagTextChange={setAddTagText}
                knownTags={tags}
              />
            )}

            {view === 'study' && (
              <StudyView
                cards={filtered}
                onGrade={grade}
                sessionKey={selectedTags.join(',')}
              />
            )}

            {view === 'cards' && (
              <div className="space-y-4">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search cards"
                  aria-label="Search cards"
                  className={cn(inputClasses, 'text-base')}
                />

                <CardList
                  cards={listed}
                  now={new Date()}
                  onSave={update}
                  onDelete={remove}
                  onSelectTag={(tag) => {
                    if (!selectedTags.includes(tag)) toggleTag(tag);
                  }}
                />

                <ImportExport cards={cards} onImport={replaceAll} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function ViewPicker({
  view,
  onChange,
  dueCount,
  total,
}: {
  view: View;
  onChange: (view: View) => void;
  dueCount: number;
  total: number;
}) {
  const options: { id: View; label: string; count?: number }[] = [
    { id: 'add', label: 'Add' },
    { id: 'study', label: 'Study', count: dueCount },
    { id: 'cards', label: 'Cards', count: total },
  ];

  // Toggle buttons rather than a tablist: a real tab pattern also needs
  // tabpanels, aria-controls and arrow key navigation, and a half implemented
  // one reads worse to a screen reader than an honest toggle.
  return (
    <div
      className="inline-flex rounded-md border border-gray-300
        dark:border-gray-600"
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={view === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            index === 0 && 'rounded-l-md',
            index === options.length - 1 && 'rounded-r-md',
            index > 0 && 'border-l border-gray-300 dark:border-gray-600',
            view === option.id
              ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900'
              : `text-gray-700 hover:bg-gray-100 dark:text-gray-300
                dark:hover:bg-gray-800`,
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1.5 opacity-60">{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
