import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../shared/db/dexie';
import { generateId, nowISO } from '../shared/lib/id';
import { playComplete, playTap } from '../shared/lib/sounds';
import type { JournalBlock } from '../shared/types/domain';
import HelpGuide from '../shared/components/HelpGuide';

function MicButton({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef('');

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal) final += result[0]?.transcript + ' ';
      }
      if (final) { finalRef.current += final; onResult(finalRef.current); }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    finalRef.current = '';
    recognition.start();
    setListening(true);
  }, [listening, onResult]);

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all"
      style={{
        backgroundColor: listening ? 'hsla(0, 40%, 70%, 0.3)' : 'hsl(var(--muted))',
        color: listening ? 'hsl(0, 30%, 30%)' : 'hsl(var(--muted-foreground))',
      }}
    >
      {listening ? '◉' : '🎤'}
    </button>
  );
}

export default function JournalEditorPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]!);
  const [gratitude, setGratitude] = useState('');
  const [blocks, setBlocks] = useState<JournalBlock[]>([]);
  const [optimism, setOptimism] = useState('');
  const [saving, setSaving] = useState(false);

  const addBlock = () => setBlocks([...blocks, { id: generateId(), header: '', content: '', sortOrder: blocks.length }]);
  const updateBlock = (id: string, field: 'header' | 'content', value: string) => setBlocks(blocks.map((b) => b.id === id ? { ...b, [field]: value } : b));
  const removeBlock = (id: string) => setBlocks(blocks.filter((b) => b.id !== id));

  const save = async () => {
    if (!gratitude.trim() && !optimism.trim()) return;
    setSaving(true);
    playComplete();
    const now = nowISO();
    await db.journalEntries.add({
      id: generateId(), date, gratitudeOpening: gratitude.trim(),
      blocks: blocks.filter((b) => b.content.trim()), optimismClosing: optimism.trim(),
      createdAt: now, updatedAt: now,
    });
    setSaving(false);
    navigate('/journal');
  };

  return (
    <div className="flex flex-col gap-5 pt-6 px-5 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/journal')} className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Cancel</button>
          <HelpGuide
            tips={[
              'Write what you\'re grateful for and what you\'re looking forward to.',
              'Add custom sections for other thoughts using the "+ Add section" button.',
              'Use the microphone button for voice-to-text input on supported browsers.',
              'Your entry is saved locally and never leaves your device.',
              'Entries appear in your journal immediately after saving.',
            ]}
          />
        </div>
        <button
          onClick={save}
          disabled={saving || (!gratitude.trim() && !optimism.trim())}
          className="rounded-xl px-5 py-2 text-sm font-medium transition-all disabled:opacity-40"
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-fit rounded-xl border px-4 py-2 text-sm font-medium outline-none"
        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
      />

      {/* Gratitude */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--primary))' }}>🙏 Grateful for</span>
          <MicButton onResult={setGratitude} />
        </div>
        <textarea
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder="What are you grateful for today?"
          rows={3}
          className="w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed outline-none placeholder:text-base"
          style={{ color: 'hsl(var(--foreground))' }}
        />
      </div>

      {/* Blocks */}
      {blocks.map((block) => (
        <div key={block.id} className="relative rounded-2xl p-4" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          <button onClick={() => removeBlock(block.id)} className="absolute right-3 top-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>✕</button>
          <input
            value={block.header || ''}
            onChange={(e) => updateBlock(block.id, 'header', e.target.value)}
            placeholder="Section header (optional)"
            className="mb-1 w-full border-0 bg-transparent p-0 text-sm font-semibold outline-none"
            style={{ color: 'hsl(var(--foreground))' }}
          />
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
            placeholder="Write something..."
            rows={3}
            className="w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed outline-none"
            style={{ color: 'hsl(var(--foreground))' }}
          />
        </div>
      ))}
      <button onClick={addBlock} className="self-start rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
        + Add section
      </button>

      {/* Optimism */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--accent))' }}>✨ Looking forward to</span>
          <MicButton onResult={setOptimism} />
        </div>
        <textarea
          value={optimism}
          onChange={(e) => setOptimism(e.target.value)}
          placeholder="What are you looking forward to?"
          rows={3}
          className="w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed outline-none placeholder:text-base"
          style={{ color: 'hsl(var(--foreground))' }}
        />
      </div>
    </div>
  );
}
