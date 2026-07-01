export interface Zone {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorageSpace {
  id: string;
  name: string;
  description?: string;
  zoneId?: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lifecycle {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleMoment {
  id: string;
  lifecycleId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  atmosphereWeight: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transition {
  id: string;
  lifecycleId: string;
  fromMomentId: string;
  toMomentId: string;
  label?: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Object {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  lifecycleId: string;
  homeStorageSpaceId: string;
  currentMomentId: string;
  currentStorageSpaceId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEvent {
  id: string;
  objectId: string;
  timestamp: string;
  fromMomentId?: string;
  toMomentId?: string;
  fromStorageSpaceId?: string;
  toStorageSpaceId?: string;
  transitionId?: string;
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  gratitudeOpening: string;
  blocks: JournalBlock[];
  optimismClosing: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalBlock {
  id: string;
  header?: string;
  content: string;
  sortOrder: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'tbr' | 'reading' | 'read';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  estimatedDuration?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineStep {
  id: string;
  routineId: string;
  label: string;
  objectId: string;
  toMomentId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineSession {
  id: string;
  routineId: string;
  status: 'active' | 'completed' | 'cancelled';
  currentStepOrder: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineSessionStep {
  id: string;
  sessionId: string;
  routineStepId: string;
  objectId: string;
  status: 'pending' | 'ready' | 'completed' | 'skipped' | 'blocked';
  completedAt?: string;
  createdAt: string;
}
