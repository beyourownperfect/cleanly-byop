import type { Object, LifecycleMoment } from '../../shared/types/domain';

interface Props {
  object: Object;
  moments: LifecycleMoment[];
  depth: number;
  onClick: () => void;
}

export default function ObjectRow({ object, moments, depth, onClick }: Props) {
  const currentMoment = moments.find((m) => m.id === object.currentMomentId);
  const isHome = object.currentStorageSpaceId === object.homeStorageSpaceId;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors"
      style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
    >
      <span className="text-sm">{object.icon || '📄'}</span>
      <span className="flex-1 text-sm" style={{ color: 'hsl(var(--atmos-hue), 15%, 30%)' }}>
        {object.name}
      </span>
      {currentMoment && (
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{
            backgroundColor: isHome
              ? 'hsl(var(--atmos-hue), 20%, 92%)'
              : 'hsl(30, 60%, 90%)',
            color: isHome
              ? 'hsl(var(--atmos-hue), 20%, 35%)'
              : 'hsl(30, 40%, 30%)',
          }}
        >
          {currentMoment.icon} {currentMoment.name}
        </span>
      )}
    </button>
  );
}
