import { memo, useState } from 'react';
import { useLiveQuery } from '../../shared/db/hooks';
import { db } from '../../shared/db/dexie';
import { motion } from 'motion/react';
import type { Object as HomeOSObject, StorageSpace } from '../../shared/types/domain';
import ZoneCard from './ZoneCard';
import ObjectSheet from './ObjectSheet';
import HelpGuide from '../../shared/components/HelpGuide';

export default function BrowsePage() {
  const [selectedObject, setSelectedObject] = useState<HomeOSObject | null>(null);

  const zones = useLiveQuery(() => db.zones.toArray()) ?? [];
  const storageSpaces = useLiveQuery(() => db.storageSpaces.toArray()) ?? [];
  const objects = useLiveQuery(() => db.objects.toArray()) ?? [];
  const moments = useLiveQuery(() => db.moments.toArray()) ?? [];

  // Group storage spaces by zone
  const zonesWithSpaces = zones
    .map((zone) => ({
      zone,
      spaces: storageSpaces.filter((s) => s.zoneId === zone.id),
    }))
    .filter(({ spaces }) => spaces.length > 0);

  // Ungrouped spaces (no zone)
  const ungroupedSpaces = storageSpaces.filter((s) => !s.zoneId);

  return (
    <div className="flex h-full flex-col px-5 pt-14">
      <div className="flex items-center justify-between">
        <motion.h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'hsl(var(--foreground))' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Browse
        </motion.h1>
        <HelpGuide
          tips={[
            'Explore your objects organized by room and storage space.',
            'Tap a room card to expand it and see its storage spaces.',
            'Tap any object to see its details, move it, or advance its lifecycle.',
            'The colored dot shows each object\'s current state — green means at rest.',
            'Use the Workshop to create new rooms, spaces, and lifecycles.',
          ]}
        />
      </div>
      <motion.p
        className="mt-1.5 text-base font-medium"
        style={{ color: 'hsl(var(--muted-foreground))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {objects.length} object{objects.length !== 1 ? 's' : ''} across {storageSpaces.length} space{storageSpaces.length !== 1 ? 's' : ''}
      </motion.p>

      <div className="flex-1 overflow-y-auto pb-24 pt-5">
        <div className="flex flex-col gap-3">
          {zonesWithSpaces.map(({ zone, spaces }) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              storageSpaces={spaces}
              objects={objects}
              moments={moments}
              onSelectObject={setSelectedObject}
            />
          ))}

          {ungroupedSpaces.length > 0 && (
            <div className="rounded-2xl border" style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
              <div className="px-4 py-3">
                <div className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                  Other Spaces
                </div>
              </div>
              <div className="border-t px-4 py-2" style={{ borderColor: 'hsl(var(--border))' }}>
                {ungroupedSpaces.map((space) => (
                  <BrowseSpaceRow
                    key={space.id}
                    space={space}
                    objects={objects}
                    moments={moments}
                    onSelectObject={setSelectedObject}
                  />
                ))}
              </div>
            </div>
          )}

          {zonesWithSpaces.length === 0 && ungroupedSpaces.length === 0 && (
            <div className="flex flex-col items-center gap-3 pt-12 text-center">
              <span className="text-4xl">📦</span>
              <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No storage spaces yet. Create one in the Workshop.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Object Sheet */}
      {selectedObject && (
        <ObjectSheet
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}
    </div>
  );
}

const BrowseSpaceRow = memo(function BrowseSpaceRow({
  space,
  objects,
  moments,
  onSelectObject,
}: {
  space: StorageSpace;
  objects: HomeOSObject[];
  moments: { id: string; icon?: string; name: string; atmosphereWeight: number }[];
  onSelectObject: (obj: HomeOSObject) => void;
}) {
  const spaceObjects = objects.filter(
    (o) =>
      o.currentStorageSpaceId === space.id ||
      o.homeStorageSpaceId === space.id,
  );

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <span>{space.icon || '📁'}</span>
        <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
          {space.name}
        </span>
        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {spaceObjects.length}
        </span>
      </div>
      {spaceObjects.map((obj) => {
        const moment = moments.find(
          (m) => m.id === obj.currentMomentId,
        );
        return (
          <button
            key={obj.id}
            onClick={() => onSelectObject(obj)}
            className="flex w-full items-center gap-2 rounded-lg px-5 py-1.5 text-left transition-colors hover:opacity-80"
          >
            <span className="text-base">{obj.icon || '📄'}</span>
            <span
              className="text-sm"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {obj.name}
            </span>
            <span
              className="ml-auto text-xs font-medium"
              style={{
                color: moment
                  ? moment.atmosphereWeight >= 0.5
                    ? 'hsl(var(--progress-completed))'
                    : moment.atmosphereWeight < 0
                      ? 'hsl(var(--status-waiting))'
                      : 'hsl(var(--muted-foreground))'
                  : 'hsl(var(--muted-foreground))',
              }}
            >
              {moment?.icon} {moment?.name}
            </span>
          </button>
        );
      })}
    </div>
  );
});
