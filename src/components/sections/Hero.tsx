import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { MagneticButton } from '../ui/MagneticButton';
import heroBg from '../../assets/hero-bg.png';

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.hero-line', { y: 80, opacity: 0 });

      gsap.to('.hero-line', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.3,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="min-h-screen bg-background overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] min-h-screen">
        {/* Image — top on mobile, right on desktop */}
        <div className="relative lg:order-2 h-[40vh] sm:h-[50vh] lg:h-screen overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={heroBg}
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Text — bottom on mobile, left on desktop */}
        <div className="lg:order-1 flex items-center px-5 lg:pl-margin-desktop lg:pr-16 py-16 lg:py-0">
          <div className="w-full max-w-lg">
            {/* Badge */}
            <motion.div
              {...fadeIn(0)}
              className="inline-flex items-center gap-2.5 px-4 py-2 border border-primary/20 rounded-full mb-10 bg-primary/[0.04]"
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-label-caps text-label-caps text-primary uppercase">
                Available for Projects
              </span>
            </motion.div>

            {/* Headline */}
            <h1 ref={titleRef} className="mb-8">
              <div className="overflow-hidden mb-1">
                <span className="hero-line inline-block font-headline-lg text-headline-lg sm:text-5xl lg:text-headline-lg text-white leading-[1.15] tracking-tight">
                  Websites that turn
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="hero-line inline-block font-headline-lg text-headline-lg sm:text-5xl lg:text-headline-lg text-primary leading-[1.15] tracking-tight">
                  visitors into customers.
                </span>
              </div>
            </h1>

            {/* Supporting copy */}
            <motion.p
              {...fadeIn(0.7)}
              className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed"
            >
              High-performance booking systems, resort websites, and web
              applications for brands that mean business.
            </motion.p>

            {/* Calls to action */}
            <motion.div
              {...fadeIn(0.9)}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton variant="primary">
                Get a Free Consultation
              </MagneticButton>
              <MagneticButton variant="ghost">
                View My Work
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
