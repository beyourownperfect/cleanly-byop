import { useState } from 'react';
import { useLiveQuery } from '../shared/db/hooks';
import { db } from '../shared/db/dexie';
import { generateId, nowISO } from '../shared/lib/id';
import { playTap, playComplete } from '../shared/lib/sounds';
import { motion, AnimatePresence } from 'motion/react';
import HelpGuide from '../shared/components/HelpGuide';
import type { Routine } from '../shared/types/domain';

type View = 'menu' | 'objects' | 'lifecycles' | 'spaces' | 'zones' | 'data' | 'routines';

export default function WorkshopPage() {
  const [view, setView] = useState<View>('menu');
  return (
    <div className="flex h-full flex-col px-5 pb-8">
      <AnimatePresence mode="wait">
        {view === 'menu' && <WorkshopMenu key="menu" onSelect={setView} />}
        {view === 'objects' && <ObjectsView key="ob" onBack={() => setView('menu')} />}
        {view === 'lifecycles' && <LifecyclesView key="lc" onBack={() => setView('menu')} />}
        {view === 'spaces' && <SpacesView key="sp" onBack={() => setView('menu')} />}
        {view === 'zones' && <ZonesView key="zn" onBack={() => setView('menu')} />}
        {view === 'routines' && <RoutinesView key="rt" onBack={() => setView('menu')} />}
        {view === 'data' && <DataView key="dt" onBack={() => setView('menu')} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Menu — large, substantial tiles ───────────────────────

const tiles = [
  { id: 'objects' as View, icon: '📦', title: 'Objects', desc: 'Everything you look after', countKey: 'objects' as const },
  { id: 'lifecycles' as View, icon: '🔄', title: 'Lifecycles', desc: 'Laundry, Kitchen, Travel', countKey: 'lifecycles' as const },
  { id: 'spaces' as View, icon: '📍', title: 'Storage Spaces', desc: 'Where things live', countKey: 'storageSpaces' as const },
  { id: 'zones' as View, icon: '🏠', title: 'Rooms', desc: 'Bedroom, Office, Kitchen', countKey: 'zones' as const },
  { id: 'routines' as View, icon: '📋', title: 'Routines', desc: 'Morning, Reset, Laundry', countKey: 'routines' as const },
  { id: 'data' as View, icon: '💾', title: 'Data', desc: 'Export, import, backup', countKey: null },
];

function WorkshopMenu({ onSelect }: { onSelect: (v: View) => void }) {
  const counts = {
    objects: useLiveQuery(() => db.objects.count()) ?? 0,
    lifecycles: useLiveQuery(() => db.lifecycles.count()) ?? 0,
    storageSpaces: useLiveQuery(() => db.storageSpaces.count()) ?? 0,
    zones: useLiveQuery(() => db.zones.count()) ?? 0,
    routines: useLiveQuery(() => db.routines.count()) ?? 0,
  };

  return (
    <motion.div
      key="menu"
      className="flex flex-col gap-5 pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
          Workshop
        </h1>
        <HelpGuide
          tips={[
            'Objects: View and edit all objects, their names, icons, and home spaces.',
            'Lifecycles: Create and edit the journeys objects can go through.',
            'Storage Spaces: Manage where things live and organize by room.',
            'Rooms: Group your storage spaces by physical location.',
            'Data: Export everything as JSON or import previously saved data.',
            'Changes here affect how objects behave everywhere in the app.',
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <motion.button
            key={tile.id}
            onClick={() => { playTap(); onSelect(tile.id); }}
            className="flex flex-col items-start gap-1.5 rounded-2xl px-5 py-6 text-left"
            style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-md)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-2xl">{tile.icon}</span>
            <span className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {tile.title}
            </span>
            <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {tile.desc}
            </span>
            {tile.countKey && (
              <span className="mt-1 text-xs font-medium" style={{ color: 'hsl(var(--secondary))' }}>
                {counts[tile.countKey]} items
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Routines ────────────────────────────────────────────────

function RoutinesView({ onBack }: { onBack: () => void }) {
  const routines: Routine[] = useLiveQuery(
    () => db.routines.orderBy('sortOrder').toArray(),
  ) ?? [];
  const steps = useLiveQuery(() => db.routineSteps.toArray()) ?? [];
  const objects = useLiveQuery(() => db.objects.toArray()) ?? [];
  const moments = useLiveQuery(() => db.moments.toArray()) ?? [];
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [addingStep, setAddingStep] = useState<string | null>(null);
  const [stepLabel, setStepLabel] = useState('');
  const [stepObject, setStepObject] = useState('');
  const [stepTarget, setStepTarget] = useState('');

  const objMap = new Map(objects.map((o) => [o.id, o]));
  const momentMap = new Map(moments.map((m) => [m.id, m]));

  const addRoutine = async () => {
    if (!newName.trim()) return;
    playComplete();
    const now = nowISO();
    await db.routines.add({
      id: generateId(), name: newName.trim(), emoji: '📋',
      sortOrder: routines.length, createdAt: now, updatedAt: now,
    });
    setNewName('');
  };

  const removeRoutine = async (id: string) => {
    playComplete();
    await db.transaction('rw', db.routines, db.routineSteps, () => {
      db.routines.delete(id);
      db.routineSteps.where('routineId').equals(id).delete();
    });
  };

  const addStepToRoutine = async (routineId: string) => {
    if (!stepLabel.trim() || !stepObject || !stepTarget) return;
    playComplete();
    const routineSteps = steps.filter((s) => s.routineId === routineId);
    const now = nowISO();
    await db.routineSteps.add({
      id: generateId(), routineId, label: stepLabel.trim(),
      objectId: stepObject, toMomentId: stepTarget,
      sortOrder: routineSteps.length, createdAt: now, updatedAt: now,
    });
    setAddingStep(null);
    setStepLabel('');
    setStepObject('');
    setStepTarget('');
  };

  const removeStep = async (id: string) => {
    playComplete();
    await db.routineSteps.delete(id);
  };

  const moveStep = async (stepId: string, direction: -1 | 1) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const routineSteps = steps
      .filter((s) => s.routineId === step.routineId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = routineSteps.indexOf(step);
    const target = idx + direction;
    if (target < 0 || target >= routineSteps.length) return;
    playTap();
    const temp = routineSteps[target].sortOrder;
    await db.routineSteps.update(routineSteps[target].id, { sortOrder: step.sortOrder });
    await db.routineSteps.update(step.id, { sortOrder: temp });
  };

  // Filter available moments for selected object
  const selectedObj = objects.find((o) => o.id === stepObject);
  const availableMoments = selectedObj
    ? moments.filter((m) => m.lifecycleId === selectedObj.lifecycleId)
    : [];

  return (
    <motion.div
      key="rt"
      className="flex flex-col gap-3 pt-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <button onClick={onBack} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Workshop</button>
      <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Routines</h2>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New routine name"
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
          onKeyDown={(e) => e.key === 'Enter' && addRoutine()}
        />
        <button onClick={addRoutine} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          + Add
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pb-4">
        {routines.map((r) => {
          const isExpanded = expanded === r.id;
          const routineSteps = steps
            .filter((s) => s.routineId === r.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          const isEditing = editingName === r.id;

          return (
            <div key={r.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { playTap(); setExpanded(isExpanded ? null : r.id); }}
                  className="text-sm transition-transform"
                  style={{ color: 'hsl(var(--muted-foreground))', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  ▶
                </button>
                <span className="text-xl">{r.emoji || '📋'}</span>
                {isEditing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
                    style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        await db.routines.update(r.id, { name: editName.trim() || r.name });
                        setEditingName(null);
                      }
                      if (e.key === 'Escape') setEditingName(null);
                    }}
                  />
                ) : (
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{r.name}</div>
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {routineSteps.length} steps
                      {r.estimatedDuration && ` · ${r.estimatedDuration} min`}
                    </div>
                  </div>
                )}
                <div className="flex gap-1">
                  {!isEditing && (
                    <button onClick={() => { setEditingName(r.id); setEditName(r.name); playTap(); }} className="rounded-lg px-2.5 py-1 text-xs" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>✏️</button>
                  )}
                  <button onClick={() => removeRoutine(r.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>✕</button>
                </div>
              </div>

              {/* Expanded steps */}
              {isExpanded && (
                <div className="mt-3 pl-8 flex flex-col gap-1.5">
                  {routineSteps.map((s, i) => {
                    const obj = objMap.get(s.objectId);
                    const targetMoment = momentMap.get(s.toMomentId);
                    return (
                      <div key={s.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveStep(s.id, -1)} disabled={i === 0} className="text-[9px] leading-none disabled:opacity-20" style={{ color: 'hsl(var(--muted-foreground))' }}>▲</button>
                          <button onClick={() => moveStep(s.id, 1)} disabled={i === routineSteps.length - 1} className="text-[9px] leading-none disabled:opacity-20" style={{ color: 'hsl(var(--muted-foreground))' }}>▼</button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
                            {s.label}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {obj?.icon} {obj?.name || '?'} → {targetMoment?.icon} {targetMoment?.name || '?'}
                          </div>
                        </div>
                        <button onClick={() => removeStep(s.id)} className="rounded-lg px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>✕</button>
                      </div>
                    );
                  })}

                  {/* Add step form */}
                  {addingStep === r.id ? (
                    <div className="flex flex-col gap-2 rounded-xl px-3 py-3" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                      <input
                        value={stepLabel}
                        onChange={(e) => setStepLabel(e.target.value)}
                        placeholder="Label (e.g. Pack Watch)"
                        className="rounded-lg border px-3 py-2 text-xs outline-none"
                        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                      />
                      <select
                        value={stepObject}
                        onChange={(e) => { setStepObject(e.target.value); setStepTarget(''); }}
                        className="rounded-lg border px-3 py-2 text-xs outline-none"
                        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                      >
                        <option value="">Pick object</option>
                        {objects.map((o) => (
                          <option key={o.id} value={o.id}>{o.icon} {o.name}</option>
                        ))}
                      </select>
                      <select
                        value={stepTarget}
                        onChange={(e) => setStepTarget(e.target.value)}
                        className="rounded-lg border px-3 py-2 text-xs outline-none"
                        style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                        disabled={!stepObject}
                      >
                        <option value="">Target moment</option>
                        {availableMoments.map((m) => (
                          <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAddingStep(null); setStepLabel(''); setStepObject(''); setStepTarget(''); }}
                          className="flex-1 rounded-lg py-2 text-xs font-medium"
                          style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => addStepToRoutine(r.id)}
                          disabled={!stepLabel.trim() || !stepObject || !stepTarget}
                          className="flex-1 rounded-lg py-2 text-xs font-medium disabled:opacity-40"
                          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                        >
                          Add Step
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { playTap(); setAddingStep(r.id); }}
                      className="rounded-xl py-2 text-xs font-medium"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      + Add Step
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Objects ────────────────────────────────────────────────

function ObjectsView({ onBack }: { onBack: () => void }) {
  const objects = useLiveQuery(() => db.objects.toArray()) ?? [];
  const storageSpaces = useLiveQuery(() => db.storageSpaces.toArray()) ?? [];
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const spaceMap = new Map(storageSpaces.map((s) => [s.id, s]));

  const remove = async (id: string) => {
    playComplete();
    await db.transaction('rw', db.objects, db.history, () => {
      db.objects.delete(id);
      db.history.where('objectId').equals(id).delete();
    });
  };

  const move = async (id: string, spaceId: string) => {
    const now = nowISO();
    await db.transaction('rw', db.objects, db.history, () => {
      db.objects.update(id, { currentStorageSpaceId: spaceId, updatedAt: now });
      db.history.add({ id: generateId(), objectId: id, timestamp: now, toStorageSpaceId: spaceId, note: 'Moved in Workshop' });
    });
  };

  return (
    <motion.div
      key="ob"
      className="flex flex-col gap-3 pt-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <button onClick={onBack} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Workshop</button>
      <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Objects</h2>
      <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{objects.length} total</p>

      <div className="flex flex-col gap-2 overflow-y-auto pb-4">
        {objects.map((o) => {
          const isEditing = editing === o.id;
          return (
            <div key={o.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{o.icon || '📄'}</span>
                {isEditing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
                    style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        await db.objects.update(o.id, { name: editName.trim() || o.name });
                        setEditing(null);
                      }
                      if (e.key === 'Escape') setEditing(null);
                    }}
                  />
                ) : (
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{o.name}</div>
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {spaceMap.get(o.currentStorageSpaceId)?.name || '?'} · Home: {spaceMap.get(o.homeStorageSpaceId)?.name || '?'}
                    </div>
                  </div>
                )}
                <div className="flex gap-1">
                  {!isEditing && (
                    <button
                      onClick={() => { setEditing(o.id); setEditName(o.name); playTap(); }}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                    >
                      ✏️
                    </button>
                  )}
                  <select
                    value={o.currentStorageSpaceId}
                    onChange={(e) => move(o.id, e.target.value)}
                    className="rounded-lg border-0 px-2 py-1 text-xs outline-none"
                    style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                  >
                    {storageSpaces.map((s) => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(o.id)}
                    className="rounded-lg px-2.5 py-1 text-xs"
                    style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Lifecycles ────────────────────────────────────────────

function LifecyclesView({ onBack }: { onBack: () => void }) {
  const lifecycles = useLiveQuery(() => db.lifecycles.toArray()) ?? [];
  const moments = useLiveQuery(() => db.moments.toArray()) ?? [];
  const transitions = useLiveQuery(() => db.transitions.toArray()) ?? [];
  const [newName, setNewName] = useState('');
  const [editingLc, setEditingLc] = useState<string | null>(null);
  const [editLcName, setEditLcName] = useState('');

  const addLc = async () => {
    if (!newName.trim()) return;
    playComplete();
    const now = nowISO();
    const lcId = generateId();
    await db.lifecycles.add({ id: lcId, name: newName.trim(), icon: '🔄', createdAt: now, updatedAt: now });
    await db.moments.bulkAdd([
      { id: generateId(), lifecycleId: lcId, name: 'Stored', icon: '📦', atmosphereWeight: 0.5, sortOrder: 0, createdAt: now, updatedAt: now },
      { id: generateId(), lifecycleId: lcId, name: 'In Use', icon: '🔨', atmosphereWeight: 0, sortOrder: 1, createdAt: now, updatedAt: now },
    ]);
    setNewName('');
  };

  const removeLc = async (id: string) => {
    const objectsUsing = await db.objects.where('lifecycleId').equals(id).count();
    if (objectsUsing > 0) { alert(`Cannot delete: ${objectsUsing} objects use this lifecycle.`); return; }
    playComplete();
    await db.transaction('rw', db.lifecycles, db.moments, db.transitions, () => {
      db.lifecycles.delete(id);
      db.moments.where('lifecycleId').equals(id).delete();
      db.transitions.where('lifecycleId').equals(id).delete();
    });
  };

  return (
    <motion.div
      key="lc"
      className="flex flex-col gap-3 pt-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <button onClick={onBack} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Workshop</button>
      <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Lifecycles</h2>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New lifecycle name"
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
          onKeyDown={(e) => e.key === 'Enter' && addLc()}
        />
        <button onClick={addLc} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          + Add
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pb-4">
        {lifecycles.map((lc) => {
          const lcMoments = moments.filter((m) => m.lifecycleId === lc.id);
          const lcTransitions = transitions.filter((t) => t.lifecycleId === lc.id);
          const isEditing = editingLc === lc.id;
          return (
            <div key={lc.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{lc.icon || '🔄'}</span>
                {isEditing ? (
                  <input
                    value={editLcName}
                    onChange={(e) => setEditLcName(e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
                    style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        await db.lifecycles.update(lc.id, { name: editLcName.trim() || lc.name });
                        setEditingLc(null);
                      }
                      if (e.key === 'Escape') setEditingLc(null);
                    }}
                  />
                ) : (
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{lc.name}</div>
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {lcMoments.length} moments · {lcTransitions.length} transitions
                    </div>
                  </div>
                )}
                <div className="flex gap-1">
                  {!isEditing && (
                    <button onClick={() => { setEditingLc(lc.id); setEditLcName(lc.name); playTap(); }} className="rounded-lg px-2.5 py-1 text-xs" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>✏️</button>
                  )}
                  <button onClick={() => removeLc(lc.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>✕</button>
                </div>
              </div>
              {/* Moments inline */}
              {lcMoments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
                  {lcMoments.map((m) => (
                    <span key={m.id} className="rounded-lg px-2 py-0.5 text-xs" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}>
                      {m.icon} {m.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Storage Spaces ───────────────────────────────────────

function SpacesView({ onBack }: { onBack: () => void }) {
  const spaces = useLiveQuery(() => db.storageSpaces.toArray()) ?? [];
  const zones = useLiveQuery(() => db.zones.toArray()) ?? [];
  const zoneMap = new Map(zones.map((z) => [z.id, z]));
  const [newName, setNewName] = useState('');
  const [newZone, setNewZone] = useState('');

  const add = async () => {
    if (!newName.trim()) return;
    playComplete();
    const now = nowISO();
    await db.storageSpaces.add({
      id: generateId(), name: newName.trim(), zoneId: newZone || undefined,
      parentId: null, icon: '📦', sortOrder: spaces.length, isArchived: false,
      createdAt: now, updatedAt: now,
    });
    setNewName('');
  };

  const remove = async (id: string) => {
    const objectsUsing = await db.objects.where('homeStorageSpaceId').equals(id).count();
    if (objectsUsing > 0) { alert(`Cannot delete: ${objectsUsing} objects call this home.`); return; }
    playComplete();
    await db.storageSpaces.delete(id);
  };

  return (
    <motion.div
      key="sp"
      className="flex flex-col gap-3 pt-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <button onClick={onBack} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Workshop</button>
      <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Storage Spaces</h2>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name"
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <select
          value={newZone}
          onChange={(e) => setNewZone(e.target.value)}
          className="rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
        >
          <option value="">No room</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <button onClick={add} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>+</button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto pb-4">
        {spaces.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-sm)' }}>
            <span className="text-lg">{s.icon || '📦'}</span>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{s.name}</div>
              {s.zoneId && <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{zoneMap.get(s.zoneId)?.name || '?'}</div>}
            </div>
            <button onClick={() => remove(s.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>✕</button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Zones ─────────────────────────────────────────────────

function ZonesView({ onBack }: { onBack: () => void }) {
  const zones = useLiveQuery(() => db.zones.toArray()) ?? [];
  const [newName, setNewName] = useState('');

  const add = async () => {
    if (!newName.trim()) return;
    playComplete();
    const now = nowISO();
    await db.zones.add({ id: generateId(), name: newName.trim(), icon: '🏠', sortOrder: zones.length, createdAt: now, updatedAt: now });
    setNewName('');
  };

  const remove = async (id: string) => {
    const spacesIn = await db.storageSpaces.where('zoneId').equals(id).count();
    if (spacesIn > 0) { alert(`Cannot delete: ${spacesIn} storage spaces are in this room.`); return; }
    playComplete();
    await db.zones.delete(id);
  };

  return (
    <motion.div
      key="zn"
      className="flex flex-col gap-3 pt-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <button onClick={onBack} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Workshop</button>
      <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Rooms</h2>
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Room name"
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>+</button>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto pb-4">
        {zones.map((z) => (
          <div key={z.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-sm)' }}>
            <span className="text-lg">{z.icon || '🏠'}</span>
            <span className="flex-1 text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{z.name}</span>
            <button onClick={() => remove(z.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>✕</button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Data ──────────────────────────────────────────────────

function DataView({ onBack }: { onBack: () => void }) {
  const exportData = async () => {
    playTap();
    const data = {
      zones: await db.zones.toArray(),
      storageSpaces: await db.storageSpaces.toArray(),
      lifecycles: await db.lifecycles.toArray(),
      moments: await db.moments.toArray(),
      transitions: await db.transitions.toArray(),
      objects: await db.objects.toArray(),
      history: await db.history.toArray(),
      journalEntries: await db.journalEntries.toArray(),
      books: await db.books.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homeos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      await db.transaction('rw', [
        db.zones, db.storageSpaces, db.lifecycles, db.moments,
        db.transitions, db.objects, db.history, db.journalEntries, db.books,
      ], () => {
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val) && (db as any)[key]) (db as any)[key].bulkAdd(val);
        });
      });
      playComplete();
    };
    input.click();
  };

  return (
    <motion.div
      key="dt"
      className="flex flex-col gap-4 pt-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <button onClick={onBack} className="self-start text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>← Workshop</button>
      <h2 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Data</h2>
      <div className="flex gap-3">
        <motion.button onClick={exportData} className="flex-1 rounded-2xl py-4 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: 'var(--shadow-md)' }} whileTap={{ scale: 0.95 }}>
          💾 Export
        </motion.button>
        <motion.button onClick={importData} className="flex-1 rounded-2xl py-4 text-sm font-medium" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: 'var(--shadow-md)' }} whileTap={{ scale: 0.95 }}>
          📂 Import
        </motion.button>
      </div>
    </motion.div>
  );
}
