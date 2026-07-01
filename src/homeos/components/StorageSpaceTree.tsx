import { useState } from 'react';
import type { StorageSpace, Object, LifecycleMoment } from '../../shared/types/domain';
import ObjectRow from './ObjectRow';

interface Props {
  spaces: StorageSpace[];
  allSpaces: StorageSpace[];
  objects: Object[];
  moments: LifecycleMoment[];
  onSelectObject: (obj: Object) => void;
  depth?: number;
}

export default function StorageSpaceTree({ spaces, allSpaces, objects, moments, onSelectObject, depth = 0 }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {spaces.map((space) => (
        <StorageSpaceNode
          key={space.id}
          space={space}
          allSpaces={allSpaces}
          objects={objects}
          moments={moments}
          onSelectObject={onSelectObject}
          depth={depth}
        />
      ))}
    </div>
  );
}

function StorageSpaceNode({
  space,
  allSpaces,
  objects,
  moments,
  onSelectObject,
  depth,
}: {
  space: StorageSpace;
  allSpaces: StorageSpace[];
  objects: Object[];
  moments: LifecycleMoment[];
  onSelectObject: (obj: Object) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const children = allSpaces.filter((s) => s.parentId === space.id);
  const spaceObjects = objects.filter((o) => o.currentStorageSpaceId === space.id || o.homeStorageSpaceId === space.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:opacity-80"
        style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
      >
        {hasChildren && (
          <span
            className="text-xs transition-transform duration-200"
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            ›
          </span>
        )}
        {!hasChildren && <span className="w-3" />}
        <span>{space.icon || '📁'}</span>
        <span className="text-sm" style={{ color: 'hsl(var(--card-foreground))' }}>
          {space.name}
        </span>
        {spaceObjects.length > 0 && (
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {spaceObjects.length}
          </span>
        )}
      </button>

      {expanded && (
        <div className="flex flex-col">
          {hasChildren && (
            <StorageSpaceTree
              spaces={children}
              allSpaces={allSpaces}
              objects={objects}
              moments={moments}
              onSelectObject={onSelectObject}
              depth={depth + 1}
            />
          )}
          {spaceObjects.map((obj) => (
            <ObjectRow
              key={obj.id}
              object={obj}
              moments={moments}
              depth={depth + 1}
              onClick={() => onSelectObject(obj)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
