import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const journeyLines = [
  'Started with curiosity.',
  'Built websites.',
  'Solved problems.',
  'Turned ideas into products.',
  'Today, I build experiences that help people and businesses succeed.',
];

export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = sectionRef.current?.querySelectorAll('.journey-line');
      if (!lines) return;

      gsap.fromTo(
        lines,
        { opacity: 0.05, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-section-gap max-w-4xl mx-auto text-center px-5 lg:px-margin-desktop" id="journey">
      <div className="space-y-12">
        {journeyLines.map((line, i) => (
          <p
            key={line}
            className={`journey-line font-display-xl text-3xl sm:text-display-xl ${
              i === journeyLines.length - 1 ? 'text-primary' : ''
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
