import { useState } from 'react';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import { generateId, nowISO } from '../shared/lib/id';
import type { Book } from '../shared/types/domain';

export default function BooksSection() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'tbr' | 'reading' | 'read'>('all');
  const [showForm, setShowForm] = useState(false);

  const books = useLiveQuery(
    () => db.books.orderBy('createdAt').reverse().toArray(),
  ) ?? [];

  const filtered = statusFilter === 'all' ? books : books.filter((b) => b.status === statusFilter);

  const filters = [
    { value: 'all' as const, label: 'All' },
    { value: 'tbr' as const, label: 'TBR' },
    { value: 'reading' as const, label: 'Reading' },
    { value: 'read' as const, label: 'Read' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Filter pills */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className="rounded-full px-3 py-1 text-xs transition-colors"
            style={{
              backgroundColor: statusFilter === f.value
                ? 'hsl(var(--atmos-hue), 20%, 85%)'
                : 'transparent',
              color: statusFilter === f.value
                ? 'hsl(var(--atmos-hue), 20%, 25%)'
                : 'hsl(var(--atmos-hue), 10%, 50%)',
            }}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto rounded-full px-3 py-1 text-xs transition-colors"
          style={{ backgroundColor: 'hsl(var(--atmos-hue), 15%, 90%)', color: 'hsl(var(--atmos-hue), 15%, 40%)' }}
        >
          + Add
        </button>
      </div>

      {/* Add form */}
      {showForm && <BookForm onDone={() => setShowForm(false)} />}

      {/* Book list */}
      <div className="flex flex-col gap-2">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
        {filtered.length === 0 && (
          <div className="py-4 text-center text-xs" style={{ color: 'hsl(var(--atmos-hue), 10%, 55%)' }}>
            No books yet.
          </div>
        )}
      </div>
    </div>
  );
}

function BookForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<'tbr' | 'reading' | 'read'>('tbr');
  const [notes, setNotes] = useState('');

  const save = async () => {
    if (!title.trim()) return;
    const now = nowISO();
    await db.books.add({ id: generateId(), title: title.trim(), author: author.trim(), status, notes: notes.trim() || undefined, createdAt: now, updatedAt: now });
    onDone();
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl p-3" style={{ backgroundColor: 'hsl(var(--atmos-hue), 15%, 93%)' }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm outline-none" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm outline-none" />
      <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm outline-none">
        <option value="tbr">To Be Read</option>
        <option value="reading">Currently Reading</option>
        <option value="read">Read</option>
      </select>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full resize-none rounded-lg border-0 bg-white px-3 py-2 text-sm outline-none" />
      <div className="flex gap-2">
        <button onClick={onDone} className="rounded-full px-3 py-1 text-xs" style={{ color: 'hsl(var(--atmos-hue), 10%, 50%)' }}>Cancel</button>
        <button onClick={save} disabled={!title.trim()} className="rounded-full px-3 py-1 text-xs transition-colors disabled:opacity-40" style={{ backgroundColor: 'hsl(var(--atmos-hue), 20%, 80%)', color: 'hsl(var(--atmos-hue), 20%, 25%)' }}>Save</button>
      </div>
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const [expanded, setExpanded] = useState(false);

  const statusLabel = { tbr: 'TBR', reading: 'Reading', read: 'Read' }[book.status];
  const statusColor = { tbr: 'hsl(200, 30%, 80%)', reading: 'hsl(40, 40%, 80%)', read: 'hsl(120, 20%, 80%)' }[book.status];

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full rounded-xl px-3 py-2 text-left"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-medium" style={{ color: 'hsl(var(--atmos-hue), 15%, 30%)' }}>{book.title}</span>
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: statusColor, color: 'hsl(var(--atmos-hue), 20%, 25%)' }}>{statusLabel}</span>
      </div>
      {book.author && (
        <div className="text-xs" style={{ color: 'hsl(var(--atmos-hue), 10%, 50%)' }}>{book.author}</div>
      )}
      {expanded && book.notes && (
        <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed" style={{ color: 'hsl(var(--atmos-hue), 10%, 45%)' }}>{book.notes}</div>
      )}
    </button>
  );
}
