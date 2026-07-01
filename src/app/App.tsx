import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import { seedData } from '../shared/db/seed';
import { calculateAtmosphere, applyAtmosphere } from '../design/atmosphere';
import AppShell from './AppShell';
import HomePage from '../homeos/HomePage';
import BrowsePage from '../homeos/components/BrowsePage';
import JournalPage from '../journal/JournalPage';
import JournalEntryPage from '../journal/JournalEntryPage';
import JournalEditorPage from '../journal/JournalEditorPage';
import SettingsPage from '../settings/SettingsPage';

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
      <div className="flex h-dvh items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-xl" style={{ color: 'hsl(var(--atmos-hue), 20%, 40%)' }}>
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
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/new" element={<JournalEditorPage />} />
          <Route path="/journal/:id" element={<JournalEntryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
