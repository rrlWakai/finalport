import { motion } from 'framer-motion';
import type { ElementType } from 'react';
import { Code2, Terminal, Palette, Database, Network } from 'lucide-react';
import { techStack } from '../../data';
import { SectionHeading } from '../ui/SectionHeading';
import { useTiltEffect } from '../../hooks/useTiltEffect';

const iconMap: Record<string, ElementType> = {
  Code2,
  Terminal,
  Palette,
  Database,
  Network,
};

function TechCard({ name, icon, delay }: { name: string; icon: string; delay: number }) {
  const tiltRef = useTiltEffect<HTMLDivElement>();
  const Icon = iconMap[icon] || Code2;

  return (
    <motion.div
      ref={tiltRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay * 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-black/[0.03] backdrop-blur-xl border border-black/10 p-8 rounded-2xl w-48 h-48 flex flex-col items-center justify-center gap-4 group hover:border-primary/50 transition-all duration-500 cursor-default"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      <div className="w-12 h-12 flex items-center justify-center bg-black/5 rounded-lg group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
      <span className="font-label-caps text-label-caps uppercase tracking-widest">
        {name}
      </span>
    </motion.div>
  );
}

export function TechStack() {
  return (
    <section className="py-section-gap overflow-hidden px-5 lg:px-margin-desktop">
      <SectionHeading label="The Arsenal" className="mb-16 text-center" />
      <div className="flex flex-wrap justify-center gap-8">
        {techStack.map((tech) => (
          <TechCard key={tech.id} name={tech.name} icon={tech.icon} delay={tech.delay} />
        ))}
      </div>
    </section>
  );
}
