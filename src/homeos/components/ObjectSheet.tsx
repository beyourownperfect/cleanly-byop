import { useState, useCallback, useMemo } from 'react';
import { useLiveQuery } from '../../shared/db/hooks';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../shared/db/dexie';
import { generateId, nowISO } from '../../shared/lib/id';
import { playTap, playComplete } from '../../shared/lib/sounds';
import type { Object as HomeOSObject } from '../../shared/types/domain';

interface Props {
  object: HomeOSObject;
  onClose: () => void;
}

export default function ObjectSheet({ object, onClose }: Props) {
  const [locSearch, setLocSearch] = useState('');

  const lifecycle = useLiveQuery(() => db.lifecycles.get(object.lifecycleId));
  const currentMoment = useLiveQuery(() => db.moments.get(object.currentMomentId));
  const allMoments = useLiveQuery(
    () => db.moments.where('lifecycleId').equals(object.lifecycleId).toArray(),
  ) ?? [];
  const transitions = useLiveQuery(
    () => db.transitions.where('lifecycleId').equals(object.lifecycleId).toArray(),
  ) ?? [];
  const homeSpace = useLiveQuery(() => db.storageSpaces.get(object.homeStorageSpaceId));
  const currentSpace = useLiveQuery(() => db.storageSpaces.get(object.currentStorageSpaceId));
  const allSpaces = useLiveQuery(() => db.storageSpaces.toArray()) ?? [];
  const zones = useLiveQuery(() => db.zones.toArray()) ?? [];
  const history = useLiveQuery(
    () => db.history.where('objectId').equals(object.id).reverse().toArray(),
  ) ?? [];

  const zoneMap = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);
  const sortedMoments = useMemo(() => [...allMoments].sort((a, b) => a.sortOrder - b.sortOrder), [allMoments]);

  const currentIdx = sortedMoments.findIndex((m) => m.id === object.currentMomentId);

  const handleAdvance = useCallback(async (toMomentId: string) => {
    const transition = transitions.find(
      (t) => t.fromMomentId === object.currentMomentId && t.toMomentId === toMomentId,
    );
    if (!transition) return;
    playTap();
    playComplete();
    const now = nowISO();
    await db.transaction('rw', db.objects, db.history, () => {
      db.objects.update(object.id, {
        currentMomentId: toMomentId,
        updatedAt: now,
      });
      db.history.add({
        id: generateId(),
        objectId: object.id,
        timestamp: now,
        transitionId: transition.id,
        fromMomentId: object.currentMomentId,
        toMomentId,
        fromStorageSpaceId: object.currentStorageSpaceId,
        toStorageSpaceId: object.currentStorageSpaceId,
      });
    });
  }, [object, transitions]);

  const handleMoveTo = useCallback(async (spaceId: string) => {
    playTap();
    const now = nowISO();
    await db.transaction('rw', db.objects, db.history, () => {
      db.objects.update(object.id, {
        currentStorageSpaceId: spaceId,
        updatedAt: now,
      });
      db.history.add({
        id: generateId(),
        objectId: object.id,
        timestamp: now,
        fromStorageSpaceId: object.currentStorageSpaceId,
        toStorageSpaceId: spaceId,
      });
    });
  }, [object]);

  const handleSendHome = useCallback(async () => {
    const restingMoment = sortedMoments.find((m) => m.atmosphereWeight >= 0.5) ?? sortedMoments[0];
    if (!restingMoment) return;
    playTap();
    playComplete();
    const now = nowISO();
    await db.transaction('rw', db.objects, db.history, () => {
      db.objects.update(object.id, {
        currentMomentId: restingMoment.id,
        currentStorageSpaceId: object.homeStorageSpaceId,
        updatedAt: now,
      });
      db.history.add({
        id: generateId(),
        objectId: object.id,
        timestamp: now,
        fromMomentId: object.currentMomentId,
        toMomentId: restingMoment.id,
        fromStorageSpaceId: object.currentStorageSpaceId,
        toStorageSpaceId: object.homeStorageSpaceId,
        note: 'Returned home',
      });
    });
  }, [object, sortedMoments]);

  const isHome = object.currentStorageSpaceId === object.homeStorageSpaceId;

  // Group spaces by zone for the location picker
  const filteredSpaces = useMemo(() => {
    let spaces = allSpaces.filter((s) => !s.isArchived);
    if (locSearch.trim()) {
      const q = locSearch.toLowerCase();
      spaces = spaces.filter((s) => s.name.toLowerCase().includes(q));
    }
    const grouped = new Map<string, typeof spaces>();
    spaces.forEach((s) => {
      const key = s.zoneId ?? 'ungrouped';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s);
    });
    return Array.from(grouped.entries()).sort(([a], [b]) => {
      if (a === 'ungrouped') return 1;
      if (b === 'ungrouped') return -1;
      return (zoneMap.get(a)?.sortOrder ?? 0) - (zoneMap.get(b)?.sortOrder ?? 0);
    });
  }, [allSpaces, locSearch, zoneMap]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-xl)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: 'hsl(var(--border))' }} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* ─── Header ─── */}
          <div className="flex items-center gap-3 pt-2 pb-4">
            <span className="text-3xl">{object.icon || '📄'}</span>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>
                {object.name}
              </h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <span>{lifecycle?.name}</span>
                {currentMoment && (
                  <><span>·</span><span>{currentMoment.icon} {currentMoment.name}</span></>
                )}
              </div>
            </div>
          </div>

          {/* ─── Location Status ─── */}
          <div className="mb-5 rounded-xl px-4 py-3" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <div className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Location</div>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'hsl(var(--card-foreground))' }}>
              <span>🏠 {homeSpace?.name || 'Unknown'}</span>
              {!isHome && <><span className="mx-1">→</span><span>📍 {currentSpace?.name || 'Unknown'}</span></>}
            </div>
            {!isHome && (
              <motion.button
                onClick={handleSendHome}
                className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                whileTap={{ scale: 0.97 }}
              >
                Send Home
              </motion.button>
            )}
          </div>

          {/* ─── Lifecycle Slider ─── */}
          {sortedMoments.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Lifecycle
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
                {sortedMoments.map((m, i) => {
                  const isCurrent = i === currentIdx;
                  const isPast = i < currentIdx;
                  const hasDirectTransition = currentIdx >= 0 && i === currentIdx + 1 &&
                    transitions.some((t) => t.fromMomentId === object.currentMomentId && t.toMomentId === m.id);
                  const canAdvance = hasDirectTransition;

                  return (
                    <div key={m.id} className="flex items-center gap-1 shrink-0">
                      {i > 0 && (
                        <div
                          className="w-4 h-px shrink-0"
                          style={{
                            backgroundColor: isPast || isCurrent
                              ? 'hsl(var(--progress-active))'
                              : 'hsl(var(--progress-track))',
                          }}
                        />
                      )}
                      <button
                        onClick={() => canAdvance && handleAdvance(m.id)}
                        disabled={!canAdvance}
                        className={`shrink-0 flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all`}
                        style={{
                          backgroundColor: isCurrent
                            ? 'hsl(var(--primary) / 0.15)'
                            : isPast
                              ? 'hsl(var(--muted))'
                              : 'hsl(var(--muted) / 0.5)',
                          boxShadow: isCurrent ? '0 0 0 2px hsl(var(--primary))' : 'none',
                          opacity: isCurrent || isPast ? 1 : 0.5,
                          cursor: canAdvance ? 'pointer' : 'default',
                        }}
                      >
                        <span className="text-lg">{m.icon || '○'}</span>
                        <span
                          className="text-[10px] font-medium whitespace-nowrap"
                          style={{ color: 'hsl(var(--card-foreground))' }}
                        >
                          {m.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              {currentIdx < sortedMoments.length - 1 && transitions.length > 0 && (
                <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Tap a moment ahead to advance
                </p>
              )}
            </div>
          )}

          {/* ─── History ─── */}
          {history.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Recent
              </div>
              <div className="flex flex-col gap-1">
                {history.slice(0, 5).map((event) => {
                  const from = sortedMoments.find((m) => m.id === event.fromMomentId);
                  const to = sortedMoments.find((m) => m.id === event.toMomentId);
                  return (
                    <div key={event.id} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      <span className="shrink-0">
                        {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {from && <span>{from.icon} {from.name}</span>}
                      {from && to && <span>→</span>}
                      {to && <span>{to.icon} {to.name}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Location Picker (all spaces, searchable) ─── */}
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Move to...
            </div>
            <input
              value={locSearch}
              onChange={(e) => setLocSearch(e.target.value)}
              placeholder="Search spaces..."
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none mb-3"
              style={{
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <div className="flex flex-col gap-2">
              {filteredSpaces.map(([zoneId, spaces]) => {
                const zone = zoneId === 'ungrouped' ? null : zoneMap.get(zoneId);
                const visibleSpaces = spaces.filter((s) => s.id !== object.currentStorageSpaceId);
                if (visibleSpaces.length === 0) return null;
                return (
                  <div key={zoneId}>
                    {zone && (
                      <div className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {zone.icon} {zone.name}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {visibleSpaces.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleMoveTo(s.id)}
                          className="rounded-full px-3 py-1.5 text-xs transition-colors whitespace-nowrap"
                          style={{
                            backgroundColor: 'hsl(var(--muted))',
                            color: 'hsl(var(--card-foreground))',
                          }}
                        >
                          {s.icon} {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredSpaces.every(([, spaces]) => spaces.filter((s) => s.id !== object.currentStorageSpaceId).length === 0) && (
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {locSearch ? 'No spaces match your search.' : 'Nowhere else to go.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
