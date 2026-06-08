import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { MagneticButton } from '../ui/MagneticButton';
import heroBg from '../../assets/hero-bg.png';

const staggerItem = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function Hero() {
  const parallaxRef = useRef<HTMLImageElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const img = parallaxRef.current;
    if (!img) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      img.style.transform = `translateY(${scrolled * 0.12}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-title-line',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          ref={parallaxRef}
          src={heroBg}
          alt="Rhen Lumbo Portrait"
          className="w-full h-full object-cover opacity-90 transition-all duration-700 parallax-img"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full px-5 lg:px-margin-desktop">
        <div className="max-w-lg">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-full w-fit mb-8 bg-primary/5"
            {...staggerItem(0)}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-label-caps font-label-caps text-primary uppercase">
              Available for Internship
            </span>
          </motion.div>

          <h1 className="font-display-2xl text-5xl sm:text-display-2xl mb-8">
            <span className="hero-title-line inline-block">RHEN</span>{' '}
            <br />
            <span className="hero-title-line inline-block text-primary-container">LUMBO</span>
          </h1>

          <motion.p
            className="font-body-lg text-body-lg text-on-surface-variant mb-12"
            {...staggerItem(0.2)}
          >
            Crafting cinematic digital experiences through rigorous full-stack engineering and
            avant-garde UI design. Specializing in high-performance web applications that bridge
            the gap between imagination and execution.
          </motion.p>

          <motion.div className="flex gap-6" {...staggerItem(0.3)}>
            <MagneticButton variant="primary">View Work</MagneticButton>
            <MagneticButton>Read Story</MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
