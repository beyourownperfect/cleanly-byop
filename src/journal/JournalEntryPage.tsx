import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import HelpGuide from '../shared/components/HelpGuide';

export default function JournalEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = useLiveQuery(() => db.journalEntries.get(id ?? ''));

  if (!entry) {
    return (
      <div className="flex flex-col gap-4 pt-6 px-5">
        <button onClick={() => navigate('/journal')} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Journal</button>
        <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>Entry not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-6 px-5 pb-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/journal')} className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Journal</button>
        <HelpGuide
          tips={[
            'This is a read-only view of your journal entry.',
            'Use the back button to return to your journal list.',
            'To edit an entry, create a new one — entries are immutable.',
            'Your entries are stored locally on this device only.',
          ]}
        />
      </div>

      <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </div>

      {/* Gratitude */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--primary))' }}>
          <span>🙏</span> Grateful for
        </div>
        <p className="mt-2 text-lg leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
          {entry.gratitudeOpening}
        </p>
      </div>

      {/* Blocks */}
      {entry.blocks.map((block) => (
        <div key={block.id}>
          {block.header && (
            <h3 className="text-base font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              {block.header}
            </h3>
          )}
          <p className="text-lg leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
            {block.content}
          </p>
        </div>
      ))}

      {/* Optimism */}
      <div className="mt-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--accent))' }}>
          <span>✨</span> Looking forward to
        </div>
        <p className="mt-2 text-lg leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
          {entry.optimismClosing}
        </p>
      </div>
    </div>
  );
}
