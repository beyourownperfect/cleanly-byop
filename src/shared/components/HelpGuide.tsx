import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpGuideProps {
  tips: string[];
  className?: string;
}

export default function HelpGuide({ tips, className = '' }: HelpGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold transition-colors hover:opacity-80 ${className}`}
        style={{
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
        }}
        aria-label="Help"
      >
        ?
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{ backgroundColor: 'hsl(var(--background))' }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl pb-8 pt-2"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                maxHeight: '70dvh',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pb-2">
                <div
                  className="h-1 w-10 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}
                />
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-6">
                <div className="flex flex-col gap-4">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5"
                        style={{
                          backgroundColor: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
