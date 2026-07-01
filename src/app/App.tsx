import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import { seedData } from '../shared/db/seed';
import { calculateAtmosphere, applyAtmosphere } from '../design/atmosphere';
import AppShell from './AppShell';
import HomePage from '../homeos/HomePage';
import BrowsePage from '../homeos/components/BrowsePage';

const JournalPage = lazy(() => import('../journal/JournalPage'));
const JournalEntryPage = lazy(() => import('../journal/JournalEntryPage'));
const JournalEditorPage = lazy(() => import('../journal/JournalEditorPage'));
const SettingsPage = lazy(() => import('../settings/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <p style={{ color: 'hsl(var(--muted-foreground))' }}>...</p>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedData().then(() => setReady(true));
  }, []);

  const objects = useLiveQuery(() => db.objects.toArray()) ?? [];
  const moments = useLiveQuery(() => db.moments.toArray()) ?? [];
  const momentsMap = new Map<string, import('../shared/types/domain').LifecycleMoment>(moments.map((m) => [m.id, m]));

  const atmosphere = calculateAtmosphere(objects, momentsMap);

  useEffect(() => {
    applyAtmosphere(atmosphere);
  }, [atmosphere]);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="text-xl" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Home OS
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/journal" element={
            <Suspense fallback={<PageLoader />}>
              <JournalPage />
            </Suspense>
          } />
          <Route path="/journal/new" element={
            <Suspense fallback={<PageLoader />}>
              <JournalEditorPage />
            </Suspense>
          } />
          <Route path="/journal/:id" element={
            <Suspense fallback={<PageLoader />}>
              <JournalEntryPage />
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
