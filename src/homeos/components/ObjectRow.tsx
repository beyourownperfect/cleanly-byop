import type { Object, LifecycleMoment } from '../../shared/types/domain';
import { memo } from 'react';

interface Props {
  object: Object;
  moments: LifecycleMoment[];
  depth: number;
  onClick: () => void;
}

function ObjectRow({ object, moments, depth, onClick }: Props) {
  const currentMoment = moments.find((m) => m.id === object.currentMomentId);
  const isHome = object.currentStorageSpaceId === object.homeStorageSpaceId;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:opacity-80"
      style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
    >
      <span className="text-sm">{object.icon || '📄'}</span>
      <span className="flex-1 text-sm" style={{ color: 'hsl(var(--foreground))' }}>
        {object.name}
      </span>
      {currentMoment && (
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{
            backgroundColor: isHome
              ? 'hsl(var(--muted))'
              : 'hsl(var(--status-progress) / 0.15)',
            color: isHome
              ? 'hsl(var(--muted-foreground))'
              : 'hsl(var(--foreground))',
          }}
        >
          {currentMoment.icon} {currentMoment.name}
        </span>
      )}
    </button>
  );
}

export default memo(ObjectRow);
