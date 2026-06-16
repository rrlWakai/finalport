import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { carouselProjects } from '../../data';
import { ProjectCard } from '../projects/ProjectCard';
import { CarouselControls } from '../projects/CarouselControls';

const AUTOPLAY_INTERVAL = 6000;
const SWIPE_THRESHOLD = 60;

function wrap(index: number, total: number) {
  return ((index % total) + total) % total;
}

export function ProjectsCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cardWidth, setCardWidth] = useState(1180);
  const [cardHeight, setCardHeight] = useState(Math.round(1180 * 9 / 16));
  const total = carouselProjects.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const vw = window.innerWidth;
      const cw = Math.min(1180, vw * 0.82);
      setCardWidth(cw);
      setCardHeight(Math.round(cw * 9 / 16));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const next = useCallback(() => {
    setActive((prev) => wrap(prev + 1, total));
  }, [total]);

  const prev = useCallback(() => {
    setActive((prev) => wrap(prev - 1, total));
  }, [total]);

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
      if (info.offset.x < 0) next();
      else prev();
    },
    [next, prev],
  );

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const id = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [next, isPaused, reducedMotion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next]);

  const sideOffset = 32 + cardWidth * 0.96;
  const halfCard = cardWidth / 2;

  const offsets = carouselProjects.map((_, i) => {
    let diff = i - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 280, damping: 32, mass: 0.8 };

  return (
    <section id="projects" className="relative overflow-hidden bg-white px-5 lg:px-12 pt-[120px] pb-[140px]">
      <div className="pb-12 lg:pb-14 text-center">
        <h2 className="text-4xl sm:text-5xl text-[#0a0a0a] font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>
          Featured Work
        </h2>
        <p className="text-[15px] text-[#0a0a0a]/60 max-w-md mx-auto leading-relaxed">
          Booking platforms, reservation systems, and modern software tools.
        </p>
      </div>

      <div
        className="max-w-[1180px] w-[82vw] mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          style={{ height: cardHeight, touchAction: 'pan-y', borderRadius: '32px' }}
        >
          <AnimatePresence mode="popLayout">
            {carouselProjects.map((project, i) => {
              const diff = offsets[i]!;
              const absDiff = Math.abs(diff);
              const translateX = diff * (sideOffset + 32);
              const scale = absDiff === 0 ? 1 : 0.92;
              const opacity = absDiff === 0 ? 1 : 0.55;
              const zIndex = absDiff === 0 ? 20 : 10;
              const isActive = diff === 0;

              return (
                <motion.div
                  key={project.id}
                  layout={reducedMotion ? false : true}
                  initial={false}
                  animate={{
                    x: translateX,
                    scale,
                    opacity,
                    zIndex,
                    filter: absDiff === 0 ? 'blur(0px)' : 'blur(1px)',
                  }}
                  transition={spring}
                  className="absolute left-1/2 top-0"
                  style={{
                    marginLeft: -halfCard,
                    height: '100%',
                    pointerEvents: isActive ? 'auto' : 'auto',
                  }}
                  onClick={() => {
                    if (diff === -1 || diff === total - 1) prev();
                    else if (diff === 1 || diff === -(total - 1)) next();
                  }}
                >
                  <ProjectCard
                    project={project}
                    cardWidth={cardWidth}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <CarouselControls
          total={total}
          active={active}
          onPrev={prev}
          onNext={next}
          onGoTo={goTo}
        />
      </div>
    </section>
  );
}
