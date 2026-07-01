import { db } from '../shared/db/dexie';
import { generateId, nowISO } from '../shared/lib/id';
import type { RoutineSession, RoutineSessionStep, RoutineStep, Object, LifecycleMoment, Transition } from '../shared/types/domain';

/**
 * Start a new session for the given routine.
 * Computes which steps need attention (object not already at target moment)
 * and which can be skipped (already done).
 */
export async function startSession(routineId: string): Promise<RoutineSession | null> {
  const steps = await db.routineSteps
    .where('routineId').equals(routineId)
    .sortBy('sortOrder');

  if (steps.length === 0) return null;

  const now = nowISO();
  const sessionId = generateId();

  // Check each step's object state
  const sessionSteps: Omit<RoutineSessionStep, 'status'>[] = [];
  const statuses: RoutineSessionStep['status'][] = [];

  for (const step of steps) {
    const obj = await db.objects.get(step.objectId);
    if (!obj) {
      sessionSteps.push({ id: generateId(), sessionId, routineStepId: step.id, objectId: step.objectId, createdAt: now });
      statuses.push('blocked');
      continue;
    }
    if (obj.currentMomentId === step.toMomentId) {
      sessionSteps.push({ id: generateId(), sessionId, routineStepId: step.id, objectId: step.objectId, createdAt: now });
      statuses.push('skipped');
    } else {
      sessionSteps.push({ id: generateId(), sessionId, routineStepId: step.id, objectId: step.objectId, createdAt: now });
      statuses.push('pending');
    }
  }

  // Mark first pending as ready
  const firstPending = statuses.findIndex((s) => s === 'pending');
  if (firstPending >= 0) {
    statuses[firstPending] = 'ready';
  }

  // Create session
  const session: RoutineSession = {
    id: sessionId,
    routineId,
    status: statuses.every((s) => s === 'skipped' || s === 'blocked')
      ? 'completed'
      : 'active',
    currentStepOrder: firstPending >= 0 ? firstPending : 0,
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction('rw', db.routineSessions, db.routineSessionSteps, () => {
    db.routineSessions.add(session);
    db.routineSessionSteps.bulkAdd(
      sessionSteps.map((s, i) => ({
        ...s,
        status: statuses[i],
      })),
    );
  });

  return session;
}

/**
 * Get the currently ready step for a session, with its resolved transition.
 */
export async function getCurrentStep(session: RoutineSession) {
  const sessionSteps = await db.routineSessionSteps
    .where('sessionId').equals(session.id)
    .sortBy('createdAt');

  const readyStep = sessionSteps.find((s) => s.status === 'ready');
  if (!readyStep) return null;

  const routineStep = await db.routineSteps.get(readyStep.routineStepId);
  if (!routineStep) return null;

  const obj = await db.objects.get(routineStep.objectId);
  if (!obj) return null;

  const transitions = await db.transitions
    .where('lifecycleId').equals(obj.lifecycleId)
    .toArray();

  const transition = transitions.find(
    (t) => t.fromMomentId === obj.currentMomentId && t.toMomentId === routineStep.toMomentId,
  ) ?? null;

  const currentMoment = await db.moments.get(obj.currentMomentId) ?? null;
  const targetMoment = await db.moments.get(routineStep.toMomentId) ?? null;

  return {
    sessionStep: readyStep,
    routineStep,
    object: obj,
    transition,
    currentMoment,
    targetMoment,
    hasValidTransition: transition !== null,
  };
}

/**
 * Complete the current ready step in a session.
 * Advances the object through its transition and logs history.
 */
export async function completeStep(session: RoutineSession): Promise<boolean> {
  const sessionSteps = await db.routineSessionSteps
    .where('sessionId').equals(session.id)
    .sortBy('createdAt');

  const readyStep = sessionSteps.find((s) => s.status === 'ready');
  if (!readyStep) return false;

  const routineStep = await db.routineSteps.get(readyStep.routineStepId);
  if (!routineStep) return false;

  const obj = await db.objects.get(routineStep.objectId);
  if (!obj) return false;

  const transitions = await db.transitions
    .where('lifecycleId').equals(obj.lifecycleId)
    .toArray();

  const transition = transitions.find(
    (t) => t.fromMomentId === obj.currentMomentId && t.toMomentId === routineStep.toMomentId,
  );

  const now = nowISO();

  await db.transaction('rw', db.objects, db.history, db.routineSessionSteps, db.routineSessions, async () => {
    // Update object state
    await db.objects.update(obj.id, {
      currentMomentId: routineStep.toMomentId,
      updatedAt: now,
    });

    // Append history event
    await db.history.add({
      id: generateId(),
      objectId: obj.id,
      timestamp: now,
      fromMomentId: obj.currentMomentId,
      toMomentId: routineStep.toMomentId,
      fromStorageSpaceId: obj.currentStorageSpaceId,
      toStorageSpaceId: obj.currentStorageSpaceId,
      transitionId: transition?.id ?? generateId(),
      note: routineStep.label,
    });

    // Mark this step completed
    await db.routineSessionSteps.update(readyStep.id, {
      status: 'completed',
      completedAt: now,
    });

    // Find next pending step
    const updatedSteps = await db.routineSessionSteps
      .where('sessionId').equals(session.id)
      .sortBy('createdAt');

    const nextPending = updatedSteps.find((s) => s.status === 'pending');
    if (nextPending) {
      const nextIdx = updatedSteps.indexOf(nextPending);
      await db.routineSessionSteps.update(nextPending.id, { status: 'ready' });
      await db.routineSessions.update(session.id, {
        currentStepOrder: nextIdx,
        updatedAt: now,
      });
    } else {
      // All done
      await db.routineSessions.update(session.id, {
        status: 'completed',
        currentStepOrder: updatedSteps.length - 1,
        completedAt: now,
        updatedAt: now,
      });
    }
  });

  return true;
}

/**
 * Cancel an active session.
 */
export async function cancelSession(sessionId: string): Promise<void> {
  const now = nowISO();
  await db.routineSessions.update(sessionId, {
    status: 'cancelled',
    updatedAt: now,
  });
}

/**
 * Get the most recent active session, if any.
 */
export async function getActiveSession(): Promise<RoutineSession | null> {
  const sessions = await db.routineSessions
    .where('status').equals('active')
    .toArray();

  return sessions.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0] ?? null;
}

/**
 * Check if a routine has any actionable steps (non-skipped).
 */
export async function getRoutineActionableStepCount(routineId: string): Promise<number> {
  const steps = await db.routineSteps
    .where('routineId').equals(routineId)
    .sortBy('sortOrder');

  let count = 0;
  for (const step of steps) {
    const obj = await db.objects.get(step.objectId);
    if (obj && obj.currentMomentId !== step.toMomentId) {
      count++;
    }
  }
  return count;
}

/**
 * Get session step details for a session.
 */
export async function getSessionSteps(sessionId: string): Promise<RoutineSessionStep[]> {
  return db.routineSessionSteps
    .where('sessionId').equals(sessionId)
    .sortBy('createdAt');
}

/**
 * Get the total and completed step count for display.
 */
export async function getSessionProgress(session: RoutineSession): Promise<{ total: number; completed: number; skipped: number }> {
  const steps = await db.routineSessionSteps
    .where('sessionId').equals(session.id)
    .toArray();

  return {
    total: steps.length,
    completed: steps.filter((s) => s.status === 'completed').length,
    skipped: steps.filter((s) => s.status === 'skipped').length,
  };
}
