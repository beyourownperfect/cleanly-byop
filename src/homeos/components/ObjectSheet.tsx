import { useCallback } from 'react';
import { useLiveQuery } from '../../shared/db/hooks';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../shared/db/dexie';
import { generateId, nowISO } from '../../shared/lib/id';
import type { Object as HomeOSObject, Transition, StorageSpace } from '../../shared/types/domain';

interface Props {
  object: HomeOSObject;
  onClose: () => void;
}

export default function ObjectSheet({ object, onClose }: Props) {
  const lifecycle = useLiveQuery(() => db.lifecycles.get(object.lifecycleId));
  const currentMoment = useLiveQuery(() => db.moments.get(object.currentMomentId));
  const transitions = useLiveQuery(
    () => db.transitions
      .where('lifecycleId')
      .equals(object.lifecycleId)
      .filter((t) => t.fromMomentId === object.currentMomentId)
      .toArray(),
  ) ?? [];
  const allMoments = useLiveQuery(() => db.moments.where('lifecycleId').equals(object.lifecycleId).toArray()) ?? [];
  const homeSpace = useLiveQuery(() => db.storageSpaces.get(object.homeStorageSpaceId));
  const currentSpace = useLiveQuery(() => db.storageSpaces.get(object.currentStorageSpaceId));
  const history = useLiveQuery(
    () => db.history
      .where('objectId')
      .equals(object.id)
      .reverse()
      .toArray(),
  ) ?? [];

  const storageSpaces = useLiveQuery(() => db.storageSpaces.toArray()) ?? [];

  // Find a resting moment (atmosphereWeight >= 0.5) for "send home" target
  const restingMoment = allMoments.find((m) => m.atmosphereWeight >= 0.5) ?? allMoments[0];

  const handleTransition = useCallback(async (transition: Transition) => {
    const now = nowISO();
    await db.transaction('rw', db.objects, db.history, () => {
      db.objects.update(object.id, {
        currentMomentId: transition.toMomentId,
        updatedAt: now,
      });
      db.history.add({
        id: generateId(),
        objectId: object.id,
        timestamp: now,
        transitionId: transition.id,
        fromMomentId: object.currentMomentId,
        toMomentId: transition.toMomentId,
        fromStorageSpaceId: object.currentStorageSpaceId,
        toStorageSpaceId: object.currentStorageSpaceId,
      });
    });
  }, [object.id, object.currentMomentId, object.currentStorageSpaceId]);

  const handleSendHome = useCallback(async () => {
    if (!restingMoment) return;
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
    onClose();
  }, [object, restingMoment, onClose]);

  const isHome = object.currentStorageSpaceId === object.homeStorageSpaceId;

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
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-3xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          backgroundColor: 'hsl(var(--card))',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: 'hsl(var(--border))' }} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Header */}
          <div className="flex items-center gap-3 pt-2 pb-4">
            <span className="text-3xl">{object.icon || '📄'}</span>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>
                {object.name}
              </h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <span>{lifecycle?.name}</span>
                {currentMoment && (
                  <>
                    <span>·</span>
                    <span>{currentMoment.icon} {currentMoment.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4 rounded-xl px-3 py-2" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <div className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Location</div>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'hsl(var(--card-foreground))' }}>
              <span>🏠 {homeSpace?.name || 'Unknown'}</span>
              {!isHome && (
                <>
                  <span className="mx-1">→</span>
                  <span>📍 {currentSpace?.name || 'Unknown'}</span>
                </>
              )}
            </div>
          </div>

          {/* Send Home */}
          {!isHome && restingMoment && (
            <button
              onClick={handleSendHome}
              className="mb-4 w-full rounded-xl py-3.5 text-center text-base font-medium transition-colors"
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                opacity: 0.9,
              }}
            >
              Send Home
            </button>
          )}

          {/* Transitions */}
          <div className="mb-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
              What's next?
            </div>
            <div className="flex flex-wrap gap-2">
              {transitions.length === 0 && (
                <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  No available transitions
                </span>
              )}
              {transitions.map((t) => {
                const target = allMoments.find((m) => m.id === t.toMomentId);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTransition(t)}
                    className="rounded-full px-3 py-1.5 text-sm transition-colors"
                    style={{
                      backgroundColor: 'hsl(var(--muted))',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  >
                    {target?.icon} {t.label || target?.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Move to... */}
          <div className="mb-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Move to...
            </div>
            <div className="flex flex-wrap gap-2">
              {storageSpaces
                .filter((s) => s.id !== object.currentStorageSpaceId && !s.isArchived)
                .slice(0, 8)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={async () => {
                      const now = nowISO();
                      await db.transaction('rw', db.objects, db.history, () => {
                        db.objects.update(object.id, {
                          currentStorageSpaceId: s.id,
                          updatedAt: now,
                        });
                        db.history.add({
                          id: generateId(),
                          objectId: object.id,
                          timestamp: now,
                          fromStorageSpaceId: object.currentStorageSpaceId,
                          toStorageSpaceId: s.id,
                        });
                      });
                    }}
                    className="rounded-full px-3 py-1.5 text-sm transition-colors"
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

          {/* Recent History */}
          {history.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Recent
              </div>
              <div className="flex flex-col gap-1.5">
                {history.slice(0, 5).map((event) => {
                  const from = allMoments.find((m) => m.id === event.fromMomentId);
                  const to = allMoments.find((m) => m.id === event.toMomentId);
                  return (
                    <div key={event.id} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      <span>{new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {from && <span>{from.icon} {from.name}</span>}
                      {from && to && <span>→</span>}
                      {to && <span>{to.icon} {to.name}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
