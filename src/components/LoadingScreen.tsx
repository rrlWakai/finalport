import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TAGLINES = [
  'Loading projects...',
  'Initializing booking systems...',
  'Connecting experiences...',
  'Preparing your experience...',
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function LoadingScreen({ onLoaded }: { onLoaded: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'enter' | 'name' | 'tagline' | 'progress' | 'exit'>('enter');
  const [taglineIndex, setTaglineIndex] = useState(0);

  const noAnim = reduced ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } } : undefined;

  useEffect(() => {
    if (reduced) {
      setPhase('progress');
      return;
    }
    const t1 = setTimeout(() => setPhase('name'), 100);
    const t2 = setTimeout(() => setPhase('tagline'), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  useEffect(() => {
    if (phase !== 'tagline' || reduced) return;
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== 'tagline' || reduced) return;
    const t = setTimeout(() => setPhase('progress'), 4500);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const handleProgressComplete = useCallback(() => {
    setPhase('exit');
    setTimeout(onLoaded, reduced ? 0 : 300);
  }, [onLoaded, reduced]);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#F8F7F5' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: reduced ? 0 : 0.3, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <motion.h1
              className="font-display-xl text-3xl sm:text-5xl font-semibold tracking-tight"
              style={{ color: '#1c1917' }}
              {...(noAnim ?? {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              })}
            >
              {'RHEN A. LUMBO'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={noAnim?.initial ?? { opacity: 0 }}
                  animate={noAnim?.animate ?? { opacity: 1 }}
                  transition={
                    noAnim?.transition ?? {
                      duration: 0.03,
                      delay: 0.8 + i * 0.035,
                      ease: 'easeOut',
                    }
                  }
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>

            <AnimatePresence mode="wait">
              {(phase === 'tagline' || phase === 'progress') && (
                <motion.p
                  key={taglineIndex}
                  className="font-body-md text-sm sm:text-base tracking-wide"
                  style={{ color: '#a8a29e' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {TAGLINES[taglineIndex]}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              className="relative w-48 sm:w-64 h-[2px] rounded-full overflow-hidden mt-2"
              style={{ background: '#e7e5e4' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'progress' ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
            >
              {phase === 'progress' && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: '#92400e' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: reduced ? 0.01 : 2.5,
                    ease: 'easeInOut',
                  }}
                  onAnimationComplete={handleProgressComplete}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
