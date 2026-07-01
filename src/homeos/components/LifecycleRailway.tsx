import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { LifecycleMoment } from '../../shared/types/domain';

interface LifecycleRailwayProps {
  moments: LifecycleMoment[];
  currentMomentId: string;
  onStationTap?: (momentId: string) => void;
  className?: string;
}

export function LifecycleRailway({
  moments,
  currentMomentId,
  onStationTap,
  className = '',
}: LifecycleRailwayProps) {
  const sorted = useMemo(
    () => [...moments].sort((a, b) => a.sortOrder - b.sortOrder),
    [moments],
  );

  const currentIndex = sorted.findIndex(
    (m) => m.id === currentMomentId,
  );

  return (
    <div className={`relative w-full overflow-x-auto py-1 ${className}`}>
      <div className="relative flex items-center min-w-0 px-1">
        {/* Track line */}
        <div className="absolute left-4 right-4 top-[10px] h-[3px] rounded-full bg-[hsl(var(--rail-track))]" />

        {/* Completed portion of track */}
        <div
          className="absolute left-4 top-[10px] h-[3px] rounded-full bg-[hsl(var(--rail-completed))] transition-all duration-500 ease-out"
          style={{
            width: currentIndex >= 0
              ? `calc(${(currentIndex / Math.max(sorted.length - 1, 1)) * 100}% - ${currentIndex > 0 ? '0px' : '0px'})`
              : '0%',
          }}
        />

        {/* Stations */}
        <div className="relative flex w-full justify-between">
          {sorted.map((moment, i) => {
            const isActive = moment.id === currentMomentId;
            const isCompleted = i < currentIndex;
            const isFuture = i > currentIndex;

            return (
              <div
                key={moment.id}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => onStationTap?.(moment.id)}
                style={{ flex: '0 0 auto' }}
              >
                {/* Station dot */}
                {isActive ? (
                  <motion.div
                    layoutId="active-station"
                    className="relative z-10 flex items-center justify-center"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    <motion.div
                      className="w-[18px] h-[18px] rounded-full bg-[hsl(var(--rail-active))] animate-rail-pulse"
                      initial={false}
                    />
                  </motion.div>
                ) : (
                  <div
                    className={`w-[14px] h-[14px] rounded-full border-2 transition-colors duration-300 ${
                      isCompleted
                        ? 'bg-[hsl(var(--rail-completed))] border-[hsl(var(--rail-completed))]'
                        : 'bg-transparent border-[hsl(var(--rail-future))]'
                    }`}
                  />
                )}

                {/* Station label */}
                <span
                  className={`text-[10px] font-medium leading-tight text-center whitespace-nowrap transition-colors duration-300 ${
                    isActive
                      ? 'text-[hsl(var(--rail-active))]'
                      : isCompleted
                        ? 'text-[hsl(var(--rail-completed))]'
                        : 'text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {moment.icon && (
                    <span className="mr-0.5">{moment.icon}</span>
                  )}
                  {moment.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
