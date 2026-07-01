import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import BooksSection from '../books/BooksSection';
import HelpGuide from '../shared/components/HelpGuide';

export default function JournalPage() {
  const navigate = useNavigate();
  const [showBooks, setShowBooks] = useState(false);

  const entries = useLiveQuery(
    () => db.journalEntries.orderBy('date').reverse().toArray(),
  ) ?? [];

  return (
    <div className="flex flex-col gap-5 pt-6 px-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
            Journal
          </h1>
          <HelpGuide
            tips={[
              'Your journal entries appear here in reverse chronological order.',
              'Tap any entry to read it in full.',
              'Tap the + button to write a new entry.',
              'The Books section tracks your reading list.',
              'All data stays on your device — nothing is sent anywhere.',
            ]}
          />
        </div>
        <button
          onClick={() => navigate('/journal/new')}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-medium"
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          +
        </button>
      </header>

      <div className="flex flex-col gap-3">
        {entries.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>No entries yet.</p>
            <p className="mt-1 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Start writing what you're grateful for.</p>
          </div>
        )}
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => navigate(`/journal/${entry.id}`)}
            className="w-full rounded-2xl px-5 py-4 text-left transition-colors"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              {entry.blocks.length > 0 && (
                <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {entry.blocks.length} section{entry.blocks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {entry.gratitudeOpening && (
              <p className="mt-2 text-base leading-relaxed line-clamp-2" style={{ color: 'hsl(var(--foreground))' }}>
                {entry.gratitudeOpening}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Books collapsible */}
      <div className="my-2 border-t" style={{ borderColor: 'hsl(var(--border))' }} />
      <button
        onClick={() => setShowBooks(!showBooks)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="text-base" style={{ color: 'hsl(var(--foreground))' }}>📚</span>
        <span className="text-base font-medium" style={{ color: 'hsl(var(--foreground))' }}>Books</span>
        <span
          className="ml-auto text-sm transition-transform"
          style={{ transform: showBooks ? 'rotate(90deg)' : 'rotate(0deg)', color: 'hsl(var(--muted-foreground))' }}
        >
          ›
        </span>
      </button>
      {showBooks && <BooksSection />}
    </div>
  );
}
