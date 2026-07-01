import { motion } from 'motion/react';
import type { Routine } from '../../shared/types/domain';
import { playTap } from '../../shared/lib/sounds';

interface RoutineCardProps {
  routine: Routine;
  onStart: () => void;
  actionableCount?: number;
}

export default function RoutineCard({ routine, onStart, actionableCount }: RoutineCardProps) {
  const hasActionable = actionableCount !== undefined ? actionableCount > 0 : true;

  return (
    <motion.div
      className="flex flex-col gap-5 rounded-3xl px-6 py-6"
      style={{
        backgroundColor: 'hsl(var(--card))',
        boxShadow: 'var(--shadow-md)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 250 }}
    >
      {/* Emoji + title row */}
      <div className="flex items-start gap-4">
        <span className="text-4xl leading-none shrink-0">{routine.emoji || '📋'}</span>
        <div className="flex-1 min-w-0">
          <h2
            className="text-2xl font-bold tracking-tight leading-tight"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {routine.name}
          </h2>
          {routine.description && (
            <p
              className="text-sm mt-1 leading-snug"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {routine.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta + CTA row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {routine.estimatedDuration && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
            >
              ⏱ {routine.estimatedDuration} min
            </span>
          )}
          {actionableCount !== undefined && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-lg"
              style={{
                backgroundColor: actionableCount > 0 ? 'hsl(var(--muted))' : 'hsl(var(--muted))',
                color: actionableCount > 0
                  ? 'hsl(var(--foreground))'
                  : 'hsl(var(--muted-foreground))',
              }}
            >
              {actionableCount > 0
                ? `${actionableCount} ${actionableCount === 1 ? 'item' : 'items'}`
                : 'All done'}
            </span>
          )}
        </div>

        <motion.button
          onClick={() => { playTap(); onStart(); }}
          className="rounded-xl px-6 py-3 text-base font-bold tracking-wide"
          style={{
            backgroundColor: hasActionable
              ? 'hsl(var(--primary))'
              : 'hsl(var(--muted))',
            color: hasActionable
              ? 'hsl(var(--primary-foreground))'
              : 'hsl(var(--muted-foreground))',
          }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
        >
          {hasActionable ? 'Start' : 'Done'}
        </motion.button>
      </div>
    </motion.div>
  );
}
