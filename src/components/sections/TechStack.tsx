import { useState } from 'react';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiVite,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiMysql,
  SiSupabase,
} from 'react-icons/si';
import { GiPayMoney } from 'react-icons/gi';
import { VscSymbolRuler } from 'react-icons/vsc';
import { categories, techStack as techStackData } from '../../data';
import { SectionHeading } from '../ui/SectionHeading';
import type { TechItem } from '../../types';

const iconMap: Record<string, IconType> = {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiVite,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiMysql,
  SiSupabase,
  SiPaymongo: GiPayMoney,
  SiApif: VscSymbolRuler,
};

const groupByCategory = (categoryId: string) =>
  techStackData.filter((t) => t.category === categoryId);

function TechPill({ item, index }: { item: TechItem; index: number }) {
  const Icon = iconMap[item.iconName];
  if (!Icon) return null;

  return (
    <div
      key={`${item.id}-${index}`}
      className="group/pill flex flex-col items-center gap-3 px-6 py-5 rounded-2xl transition-all duration-300 cursor-default shrink-0 hover:scale-110 hover:shadow-[0_0_30px_-8px_rgba(180,83,9,0.2)]"
    >
      <div className="text-on-surface-variant group-hover/pill:text-primary transition-colors duration-300">
        <Icon className="w-12 h-12 sm:w-14 sm:h-14" aria-label={item.name} />
      </div>
      <span className="font-body-md text-body-md text-on-surface-variant/60 group-hover/pill:text-on-surface transition-colors duration-300 whitespace-nowrap text-center">
        {item.name}
      </span>
    </div>
  );
}

function CarouselRow({
  items,
  direction,
  speed,
  paused,
}: {
  items: TechItem[];
  direction: 'left' | 'right';
  speed: number;
  paused: boolean;
}) {
  const duration = speed * (items.length / 4);

  return (
    <div
      className="flex overflow-hidden select-none"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
      }}
    >
      <div
        className="flex gap-2 sm:gap-4 shrink-0"
        style={{
          animation: `scroll-${direction} ${duration}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          willChange: 'transform',
        }}
      >
        {[...items, ...items].map((item, i) => (
          <TechPill key={`${item.id}-${i}`} item={item} index={i} />
        ))}
      </div>
      <div
        className="flex gap-2 sm:gap-4 shrink-0"
        style={{
          animation: `scroll-${direction} ${duration}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
          willChange: 'transform',
        }}
        aria-hidden
      >
        {[...items, ...items].map((item, i) => (
          <TechPill key={`clone-${item.id}-${i}`} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

export function TechStack() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      className="py-section-gap overflow-hidden px-5 lg:px-margin-desktop"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHeading label="Built With" className="mb-4 text-center" />
        <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-16 max-w-2xl mx-auto">
          Modern, reliable technology that major hospitality platforms trust — not
          outdated systems that break or slow you down.
        </p>
      </motion.div>

      <div className="space-y-10">
        {categories.map((cat, i) => {
          const catItems = groupByCategory(cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id}>
              <span
                className="block font-label-caps text-label-caps text-primary uppercase tracking-widest mb-4"
                style={{ paddingLeft: 'clamp(0px, calc((100vw - 1440px) / 2), 80px)' }}
              >
                {cat.label}
              </span>
              <CarouselRow
                items={catItems}
                direction={i % 2 === 0 ? 'left' : 'right'}
                speed={28 - i * 2}
                paused={paused}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes scroll-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </section>
  );
}
