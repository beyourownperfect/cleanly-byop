import { useState, useCallback } from 'react';
import { useLiveQuery } from '../../shared/db/hooks';
import { db } from '../../shared/db/dexie';
import { generateId, nowISO } from '../../shared/lib/id';
import { playTap, playComplete, playReturnHome } from '../../shared/lib/sounds';
import { motion, AnimatePresence } from 'motion/react';
import HelpGuide from '../../shared/components/HelpGuide';

interface Props {
  onDone: (name: string) => void;
}

const EMOJIS = ['👕', '📖', '🔨', '🍽️', '🧳', '👟', '🪥', '🔑', '💻', '📱', '🎒', '🧴', '🕶️', '⌚', '💼', '📓', '✂️', '🖊️', '🔌', '🎧'];

export default function AddObjectFlow({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📄');
  const [spaceId, setSpaceId] = useState('');

  const storageSpaces = useLiveQuery(() => db.storageSpaces.toArray()) ?? [];
  const lifecycles = useLiveQuery(() => db.lifecycles.toArray()) ?? [];
  const zones = useLiveQuery(() => db.zones.toArray()) ?? [];

  const zoneMap = new Map(zones.map((z) => [z.id, z]));
  const activeSpaces = storageSpaces.filter((s) => !s.isArchived);

  const groupedSpaces = new Map<string, typeof activeSpaces>();
  activeSpaces.forEach((s) => {
    const group = s.zoneId ?? 'ungrouped';
    if (!groupedSpaces.has(group)) groupedSpaces.set(group, []);
    groupedSpaces.get(group)!.push(s);
  });

  const handleFinish = useCallback(async () => {
    if (!name.trim() || !spaceId) return;
    playComplete();

    const defaultLifecycle = lifecycles[0]!;
    const defaultMoments = await db.moments.where('lifecycleId').equals(defaultLifecycle.id).sortBy('sortOrder');
    const firstMoment = defaultMoments[0]!;
    const now = nowISO();
    const objectId = generateId();

    await db.objects.add({
      id: objectId,
      name: name.trim(),
      icon: emoji,
      lifecycleId: defaultLifecycle.id,
      homeStorageSpaceId: spaceId,
      currentMomentId: firstMoment.id,
      currentStorageSpaceId: spaceId,
      createdAt: now,
      updatedAt: now,
    });

    await db.history.add({
      id: generateId(),
      objectId,
      timestamp: now,
      toMomentId: firstMoment.id,
      toStorageSpaceId: spaceId,
      note: 'Added to collection',
    });

    playReturnHome();
    setTimeout(() => onDone(name.trim()), 400);
  }, [name, emoji, spaceId, lifecycles, onDone]);

  return (
    <div className="flex h-full flex-col px-6 pt-8">
      <div className="flex items-center justify-between">
        <button onClick={() => onDone('')} className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          ✕
        </button>
        <div className="flex gap-1.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-1.5 w-8 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: step === i
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--border))',
              }}
            />
          ))}
        </div>
        <HelpGuide
          tips={[
            'Give your object a name and pick an emoji that represents it.',
            'Then choose where it lives — this is its home storage space.',
            'The object will start at the beginning of its lifecycle.',
            'You can always move it or change its details later in the Workshop.',
          ]}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            className="flex flex-1 flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          >
            <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              What should I call you?
            </h2>

            <div className="flex flex-wrap justify-center gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setEmoji(e); playTap(); }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-lg transition-all"
                  style={{
                    backgroundColor: emoji === e ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                    color: emoji === e ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                    transform: emoji === e ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Office Shirt"
              className="w-full rounded-2xl px-5 py-4 text-center text-xl outline-none"
              style={{
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && (setStep(1), playTap())}
            />

            <motion.button
              onClick={() => { setStep(1); playTap(); }}
              disabled={!name.trim()}
              className="mt-4 w-full rounded-2xl py-4 text-lg font-semibold transition-all disabled:opacity-30"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', boxShadow: 'var(--shadow-button)' }}
              whileTap={{ scale: 0.97 }}
            >
              Next
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            className="flex flex-1 flex-col items-center gap-6 pt-8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          >
            <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Where do you belong?
            </h2>

            <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto pb-4">
              {activeSpaces.length === 0 && (
                <div className="py-8 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  No storage spaces yet. Create one in the Workshop.
                </div>
              )}
              {Array.from(groupedSpaces.entries()).map(([zoneId, spaces]) => {
                const zone = zoneId === 'ungrouped' ? null : zoneMap.get(zoneId);
                return (
                  <div key={zoneId}>
                    {zone && (
                      <div className="px-1 pb-1 pt-3 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {zone.icon} {zone.name}
                      </div>
                    )}
                    {spaces.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSpaceId(s.id); playTap(); }}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all"
                        style={{
                          backgroundColor: spaceId === s.id ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          color: spaceId === s.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                        }}
                      >
                        <span className="text-xl">{s.icon || '📁'}</span>
                        <span className="text-base font-medium">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            <motion.button
              onClick={handleFinish}
              disabled={!spaceId}
              className="w-full rounded-2xl py-4 text-lg font-semibold transition-all disabled:opacity-30"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', boxShadow: 'var(--shadow-button)' }}
              whileTap={{ scale: 0.97 }}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
