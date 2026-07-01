import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from '../../shared/db/hooks';
import { db } from '../../shared/db/dexie';
import { completeStep, cancelSession, getSessionProgress, getCurrentStep } from '../engine';
import { playTap, playComplete, playRailAdvance, playPeace, playMomentComplete } from '../../shared/lib/sounds';
import { motion, AnimatePresence } from 'motion/react';
import type { Routine, RoutineSession, RoutineSessionStep, LifecycleMoment } from '../../shared/types/domain';

interface RoutineSessionViewProps {
  session: RoutineSession;
  routine: Routine;
  onComplete: () => void;
  onCancel: () => void;
}

export default function RoutineSessionView({ session, routine, onComplete, onCancel }: RoutineSessionViewProps) {
  const [animating, setAnimating] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [stepDirection, setStepDirection] = useState(0);

  // Reactively watch for session/step changes
  const currentSession = useLiveQuery(() => db.routineSessions.get(session.id)) ?? session;
  const sessionSteps: RoutineSessionStep[] = useLiveQuery(
    () => db.routineSessionSteps.where('sessionId').equals(session.id).toArray(),
    [session.id],
  ) ?? [];
  const progress = useLiveQuery(() => getSessionProgress(session.id), [session.id])
    ?? { total: 0, completed: 0, skipped: 0 };

  // Current step details
  const [stepData, setStepData] = useState<Awaited<ReturnType<typeof getCurrentStep>>>(null);

  useEffect(() => {
    if (currentSession.status === 'active') {
      getCurrentStep(currentSession.id).then(setStepData);
    }
  }, [currentSession, sessionSteps]);

  const handleComplete = useCallback(async () => {
    if (animating || currentSession.status !== 'active') return;
    setAnimating(true);

    playTap();
    playRailAdvance();

    await completeStep(session.id);

    playComplete();
    playMomentComplete();

    // Check if session is now completed
    const updatedSession = await db.routineSessions.get(session.id);
    if (updatedSession?.status === 'completed') {
      playPeace();
      setShowCompletion(true);
      setAnimating(false);
    } else {
      setStepDirection(1);
      setStepData(null);
      // Re-fetch step data after a brief delay for animation
      setTimeout(() => {
        if (updatedSession) getCurrentStep(updatedSession.id).then(setStepData);
        setAnimating(false);
      }, 300);
    }
  }, [session.id, animating, currentSession]);

  const handleCancel = useCallback(async () => {
    playTap();
    await cancelSession(session.id);
    onCancel();
  }, [session.id, onCancel]);

  const handleCompletionDone = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // All lifecycle moments for the current object (for the railway)
  const currentObjectId = stepData?.object?.id;
  const lifecycleMoments: LifecycleMoment[] = useLiveQuery(
    async () => {
      if (!currentObjectId) return [];
      const obj = await db.objects.get(currentObjectId);
      if (!obj) return [];
      const all = await db.moments.where('lifecycleId').equals(obj.lifecycleId).toArray();
      return all.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    [currentObjectId],
  ) ?? [];

  const currentMomentIndex = lifecycleMoments.findIndex(
    (m) => m.id === stepData?.currentMoment?.id,
  );

  if (showCompletion) {
    return (
      <CompletionOverlay
        routine={routine}
        totalSteps={progress.total - progress.skipped}
        onDone={handleCompletionDone}
      />
    );
  }

  if (!stepData && currentSession.status === 'completed') {
    return <CompletionOverlay routine={routine} totalSteps={0} onDone={handleCompletionDone} />;
  }

  if (!stepData || !stepData.object) {
    return (
      <div className="flex h-full items-center justify-center px-6 pt-14 pb-6">
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Loading...</p>
      </div>
    );
  }

  const hasTransition = stepData.hasValidTransition;

  return (
    <div className="flex h-full flex-col px-6 pt-12 pb-8">
      {/* Top bar: close + routine name + progress */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={handleCancel}
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {routine.name}
          </span>
        </div>
        <span
          className="text-xs font-medium tabular-nums"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {progress.completed + 1} of {progress.total - progress.skipped}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={stepDirection}>
          <motion.div
            key={stepData.object.id + stepData.sessionStep.id}
            className="flex flex-col gap-6"
            custom={stepDirection}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            {/* Object emoji + name */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">{stepData.object.icon || '📄'}</span>
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight text-center"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {stepData.object.name}
              </h1>
            </div>

            {/* Action label */}
            <div className="text-center">
              <p
                className="text-lg font-semibold"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {stepData.routineStep.label}
              </p>
            </div>

            {/* Currently / Next */}
            <div className="flex justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Currently
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--status-progress))' }} />
                  <span className="text-base font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    {stepData.currentMoment?.icon && (
                      <span className="mr-1">{stepData.currentMoment.icon}</span>
                    )}
                    {stepData.currentMoment?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Next
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--status-rest))' }} />
                  <span className="text-base font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    {stepData.targetMoment?.icon && (
                      <span className="mr-1">{stepData.targetMoment.icon}</span>
                    )}
                    {stepData.targetMoment?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle railway */}
            {lifecycleMoments.length > 0 && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {lifecycleMoments.map((m, i) => {
                    const isActive = i === currentMomentIndex;
                    const isCompleted = i < currentMomentIndex;
                    return (
                      <div key={m.id} className="flex items-center gap-2">
                        {i > 0 && (
                          <div
                            className="w-6 h-px"
                            style={{
                              backgroundColor: isCompleted || isActive
                                ? 'hsl(var(--progress-active))'
                                : 'hsl(var(--progress-track))',
                            }}
                          />
                        )}
                        <div
                          className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: isActive
                              ? 'hsl(var(--progress-active))'
                              : isCompleted
                                ? 'hsl(var(--progress-completed))'
                                : 'hsl(var(--progress-track))',
                            boxShadow: isActive ? '0 0 8px hsla(var(--progress-active), 0.5)' : 'none',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  {lifecycleMoments.map((m, i) => (
                    <span
                      key={m.id}
                      className="text-[9px] font-medium tracking-tight"
                      style={{
                        color: i === currentMomentIndex
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                        opacity: i === currentMomentIndex ? 1 : 0.5,
                      }}
                    >
                      {m.icon} {m.name.length > 6 ? m.name.slice(0, 6) + '…' : m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked warning */}
            {!hasTransition && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
              >
                ⚠️ Can't advance — {stepData.object.name} isn't ready for this step yet.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA button */}
      <motion.button
        onClick={handleComplete}
        disabled={animating || !hasTransition || currentSession.status !== 'active'}
        className="w-full h-16 rounded-2xl text-lg font-bold tracking-wide transition-all disabled:opacity-40"
        style={{
          backgroundColor: hasTransition ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          color: hasTransition ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
          boxShadow: 'var(--shadow-button)',
        }}
        whileTap={hasTransition ? { scale: 0.95 } : undefined}
      >
        {stepData.routineStep.label}
      </motion.button>
    </div>
  );
}

/* ─── Completion Overlay ────────────────────────────────── */

function CompletionOverlay({
  routine,
  totalSteps,
  onDone,
}: {
  routine: Routine;
  totalSteps: number;
  onDone: () => void;
}) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex h-28 w-28 items-center justify-center rounded-full"
        style={{ backgroundColor: 'hsl(var(--muted))' }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      >
        <span className="text-5xl">✨</span>
      </motion.div>
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {routine.name}
        </h2>
        <p
          className="text-lg font-medium mt-1"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Complete!
        </p>
        {totalSteps > 0 && (
          <p
            className="text-sm mt-2"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {totalSteps} {totalSteps === 1 ? 'step' : 'steps'} done
          </p>
        )}
      </div>
      <motion.button
        onClick={onDone}
        className="rounded-xl px-10 py-4 text-base font-bold"
        style={{
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          boxShadow: 'var(--shadow-button)',
        }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Today
      </motion.button>
    </motion.div>
  );
}
