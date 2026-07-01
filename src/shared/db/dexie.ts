import Dexie, { type Table } from 'dexie';
import type {
  Zone,
  StorageSpace,
  Lifecycle,
  LifecycleMoment,
  Transition,
  Object,
  HistoryEvent,
  JournalEntry,
  Book,
  Routine,
  RoutineStep,
  RoutineSession,
  RoutineSessionStep,
} from '../types/domain';

export class HomeOSDB extends Dexie {
  zones!: Table<Zone, string>;
  storageSpaces!: Table<StorageSpace, string>;
  lifecycles!: Table<Lifecycle, string>;
  moments!: Table<LifecycleMoment, string>;
  transitions!: Table<Transition, string>;
  objects!: Table<Object, string>;
  history!: Table<HistoryEvent, string>;
  journalEntries!: Table<JournalEntry, string>;
  books!: Table<Book, string>;
  routines!: Table<Routine, string>;
  routineSteps!: Table<RoutineStep, string>;
  routineSessions!: Table<RoutineSession, string>;
  routineSessionSteps!: Table<RoutineSessionStep, string>;

  constructor() {
    super('homeos');
    this.version(2).stores({
      zones: 'id, sortOrder',
      storageSpaces: 'id, zoneId, parentId, sortOrder',
      lifecycles: 'id',
      moments: 'id, lifecycleId, sortOrder',
      transitions: 'id, lifecycleId, fromMomentId, toMomentId',
      objects: 'id, lifecycleId, homeStorageSpaceId, currentStorageSpaceId',
      history: 'id, objectId, timestamp, [objectId+timestamp]',
      journalEntries: 'id, date',
      books: 'id, status',
      routines: 'id, sortOrder',
      routineSteps: 'id, routineId, sortOrder',
      routineSessions: 'id, routineId, status, startedAt',
      routineSessionSteps: 'id, sessionId, routineStepId, status',
    });
  }
}

export const db = new HomeOSDB();
