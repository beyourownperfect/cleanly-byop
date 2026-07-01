import { useState } from 'react';
import type { Zone, StorageSpace, Object, LifecycleMoment } from '../../shared/types/domain';
import StorageSpaceTree from './StorageSpaceTree';

interface Props {
  zone: Zone;
  storageSpaces: StorageSpace[];
  objects: Object[];
  moments: LifecycleMoment[];
  onSelectObject: (obj: Object) => void;
}

export default function ZoneCard({ zone, storageSpaces, objects, moments, onSelectObject }: Props) {
  const [expanded, setExpanded] = useState(false);

  const spaceIds = new Set(storageSpaces.map((s) => s.id));
  const zoneObjects = objects.filter(
    (o) => spaceIds.has(o.currentStorageSpaceId) || spaceIds.has(o.homeStorageSpaceId),
  );
  const outOfPlaceCount = zoneObjects.filter(
    (o) => o.currentStorageSpaceId !== o.homeStorageSpaceId,
  ).length;

  const topSpaces = storageSpaces.filter((s) => !s.parentId);

  return (
    <div
      className="rounded-2xl border transition-all duration-500"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: outOfPlaceCount > 0
          ? 'hsl(var(--atmos-hue), calc(var(--atmos-saturation) + 15%), 82%)'
          : 'transparent',
        boxShadow: outOfPlaceCount > 0 ? 'var(--depth-2)' : 'var(--depth-1)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-2xl">{zone.icon || '📁'}</span>
        <div className="flex-1">
          <div className="font-medium" style={{ color: 'hsl(var(--atmos-hue), 20%, 25%)' }}>
            {zone.name}
          </div>
          {zoneObjects.length > 0 && (
            <div className="text-xs" style={{ color: 'hsl(var(--atmos-hue), 10%, 50%)' }}>
              {zoneObjects.length} object{zoneObjects.length !== 1 ? 's' : ''}
              {outOfPlaceCount > 0 && ` · ${outOfPlaceCount} out of place`}
            </div>
          )}
        </div>
        <span
          className="text-lg transition-transform duration-300"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ›
        </span>
      </button>

      {expanded && (
        <div className="border-t px-4 py-2" style={{ borderColor: 'hsl(var(--atmos-hue), calc(var(--atmos-saturation) + 10%), 88%)' }}>
          <StorageSpaceTree
            spaces={topSpaces}
            allSpaces={storageSpaces}
            objects={objects}
            moments={moments}
            onSelectObject={onSelectObject}
          />
        </div>
      )}
    </div>
  );
}
