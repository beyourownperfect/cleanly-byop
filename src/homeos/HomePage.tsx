import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import { getActiveSession, getRoutineActionableStepCount, startSession } from '../routines/engine';
import { playTap } from '../shared/lib/sounds';
import { motion } from 'motion/react';
import RoutineCard from '../routines/components/RoutineCard';
import RoutineSessionView from '../routines/components/RoutineSessionView';
import AddObjectFlow from './components/AddObjectFlow';
import type { Routine, RoutineSession } from '../shared/types/domain';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Welcome Back';
  return 'Good Evening';
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅';
  if (hour < 17) return '☀️';
  if (hour < 21) return '🌅';
  return '🌙';
}

export default function HomePage() {
  const [adding, setAdding] = useState(false);
  const [sessionRoutineMap, setSessionRoutineMap] = useState<Map<string, Routine>>(new Map());

  // Reactively fetch routines and active session
  const routines = useLiveQuery(() => db.routines.sortBy('sortOrder')) ?? [];
  const activeSession = useLiveQuery(async () => {
    const session = await getActiveSession();
    if (session) {
      const r = await db.routines.get(session.routineId);
      if (r) setSessionRoutineMap((prev) => { const m = new Map(prev); m.set(session.id, r); return m; });
    }
    return session;
  }) ?? null as RoutineSession | null;

  // Compute actionable step counts for each routine
  const [actionableCounts, setActionableCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    Promise.all(routines.map(async (r) => {
      const count = await getRoutineActionableStepCount(r.id);
      return [r.id, count] as const;
    })).then((results) => {
      setActionableCounts(new Map(results));
    });
  }, [routines]);

  // Refresh actionable counts when routines change
  const refreshCounts = useCallback(async () => {
    const results = await Promise.all(routines.map(async (r) => {
      const count = await getRoutineActionableStepCount(r.id);
      return [r.id, count] as const;
    }));
    setActionableCounts(new Map(results));
  }, [routines]);

  const activeRoutine = activeSession ? sessionRoutineMap.get(activeSession.id) ?? null : null;

  const handleStart = useCallback(async (routineId: string) => {
    playTap();
    const session = await startSession(routineId);
    if (session) {
      // Session state changes → useLiveQuery picks it up
      const r = await db.routines.get(routineId);
      if (r) setSessionRoutineMap((prev) => { const m = new Map(prev); m.set(session.id, r); return m; });
    }
  }, []);

  const handleSessionComplete = useCallback(() => {
    // Session is marked completed in DB → useLiveQuery picks it up
  }, []);

  const handleSessionCancel = useCallback(() => {
    // Session cancelled in DB → useLiveQuery picks it up
  }, []);

  const handleAddDone = useCallback((_name?: string) => {
    setAdding(false);
    refreshCounts();
  }, [refreshCounts]);

  // If currently adding an object
  if (adding) {
    return (
      <AddObjectFlow
        onDone={(name) => handleAddDone(name)}
      />
    );
  }

  // If there's an active session, show it full-screen
  if (activeSession && activeRoutine) {
    return (
      <RoutineSessionView
        session={activeSession}
        routine={activeRoutine}
        onComplete={handleSessionComplete}
        onCancel={handleSessionCancel}
      />
    );
  }

  // Count total actionable items across all routines
  const totalActionable = Array.from(actionableCounts.values()).reduce((a, b) => a + b, 0);
  const hasAnyActionable = totalActionable > 0;

  return (
    <div className="flex h-full flex-col px-5 pt-14 pb-6">
      {/* Greeting */}
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getGreetingEmoji()}</span>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {getGreeting()}
          </h1>
        </div>
        {totalActionable > 0 && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ backgroundColor: 'hsl(var(--muted))' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: hasAnyActionable
                  ? 'hsl(var(--status-progress))'
                  : 'hsl(var(--status-rest))',
              }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {totalActionable} {totalActionable === 1 ? 'thing' : 'things'}
            </span>
          </div>
        )}
      </div>

      {/* Routine cards */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <span className="text-4xl">✨</span>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Everything is at peace
            </h2>
            <p
              className="text-sm max-w-xs"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Create routines in the Workshop to start reducing entropy.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {routines.map((r, i) => (
              <RoutineCard
                key={r.id}
                routine={r}
                onStart={() => handleStart(r.id)}
                actionableCount={actionableCounts.get(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        className="fixed right-5 bottom-20 z-10 flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', damping: 15, stiffness: 400 }}
        onClick={() => {
          playTap();
          setAdding(true);
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.button>
    </div>
  );
}
