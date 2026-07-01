import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Object, LifecycleMoment, Transition, StorageSpace } from '../../shared/types/domain';
import { LifecycleRailway } from './LifecycleRailway';

interface HeroCardProps {
  object: Object;
  moments: LifecycleMoment[];
  transitions: Transition[];
  storageSpaces: StorageSpace[];
  onComplete: () => void;
  isAnimating?: boolean;
  disabled?: boolean;
  onStationTap?: (momentId: string) => void;
}

function getMorphColors(atmosphereWeight: number) {
  if (atmosphereWeight < -0.1) {
    return {
      bg: 'hsl(var(--morph-waiting-bg))',
      accent: 'hsl(var(--morph-waiting-accent))',
      label: 'needs attention',
    };
  }
  if (atmosphereWeight < 0.3) {
    return {
      bg: 'hsl(var(--morph-airy-bg))',
      accent: 'hsl(var(--morph-airy-accent))',
      label: 'in progress',
    };
  }
  return {
    bg: 'hsl(var(--morph-ready-bg))',
    accent: 'hsl(var(--morph-ready-accent))',
    label: 'at rest',
  };
}

export function HeroCard({
  object,
  moments,
  transitions,
  storageSpaces,
  onComplete,
  isAnimating = false,
  disabled = false,
  onStationTap,
}: HeroCardProps) {
  const currentMoment = moments.find(
    (m) => m.id === object.currentMomentId,
  );

  // The lifecycle's moments sorted
  const lifecycleMoments = useMemo(
    () =>
      moments
        .filter((m) => m.lifecycleId === object.lifecycleId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [moments, object.lifecycleId],
  );

  // The next transition available from the current moment
  const nextTransition = useMemo(() => {
    if (!currentMoment) return null;
    return transitions.find(
      (t) =>
        t.lifecycleId === object.lifecycleId &&
        t.fromMomentId === object.currentMomentId,
    );
  }, [transitions, object.lifecycleId, currentMoment, object.lifecycleId]);

  const nextMoment = useMemo(
    () =>
      nextTransition
        ? moments.find((m) => m.id === nextTransition.toMomentId)
        : null,
    [nextTransition, moments],
  );

  const currentSpace = storageSpaces.find(
    (s) => s.id === object.currentStorageSpaceId,
  );

  const morph = currentMoment
    ? getMorphColors(currentMoment.atmosphereWeight)
    : { bg: 'hsl(var(--card))', accent: 'hsl(var(--primary))', label: '' };

  return (
    <motion.div
      layout
      className="flex flex-col rounded-xl border-2 overflow-hidden"
      style={{
        backgroundColor: morph.bg,
        borderColor: morph.accent,
        boxShadow: 'var(--shadow-card)',
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
    >
      {/* Accent bar at top */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ backgroundColor: morph.accent }}
      />

      {/* Content area */}
      <div className="flex flex-col gap-5 p-6">
        {/* Row: emoji + name */}
        <div className="flex items-start gap-4">
          {/* Emoji circle */}
          <motion.div
            className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-xl border-2"
            style={{
              backgroundColor: morph.bg,
              borderColor: morph.accent,
            }}
            animate={
              isAnimating
                ? { scale: [1, 0.9, 1], rotate: [0, -3, 0] }
                : {}
            }
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <span className="text-3xl">{object.icon || '📄'}</span>
          </motion.div>

          <div className="flex min-w-0 flex-col gap-1">
            {/* Object name — dominant */}
            <h2
              className="text-3xl font-bold tracking-tight leading-tight truncate"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {object.name}
            </h2>

            {/* Current moment + location */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: morph.accent }}
              >
                Currently
              </span>
              <span
                className="text-sm font-medium truncate"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {currentMoment?.name ?? 'Unknown'}
              </span>
              {currentSpace && (
                <>
                  <span
                    className="text-xs"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    ·
                  </span>
                  <span
                    className="text-sm truncate"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {currentSpace.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lifecycle railway */}
        <div className="py-1">
          <LifecycleRailway
            moments={lifecycleMoments}
            currentMomentId={object.currentMomentId}
            onStationTap={onStationTap}
          />
        </div>

        {/* Next action */}
        {nextTransition && nextMoment && (
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Next
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {nextTransition.label || nextMoment.name}
            </span>
          </div>
        )}

        {/* Primary CTA */}
        <motion.button
          onClick={onComplete}
          disabled={disabled || isAnimating}
          className="w-full rounded-xl py-5 text-lg font-bold tracking-wide transition-all"
          style={{
            backgroundColor: morph.accent,
            color: 'hsl(40, 10%, 94%)',
            boxShadow: 'var(--shadow-button)',
            opacity: disabled || isAnimating ? 0.5 : 1,
          }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
        >
          {nextTransition?.label || 'Put Away'}
        </motion.button>
      </div>
    </motion.div>
  );
}
